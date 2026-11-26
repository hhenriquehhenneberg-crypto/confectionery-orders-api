import { icon } from './icons.js';
import { statusLabels, methodLabels, occasionLabels, money, paidFor, balanceFor, summarize, matchesSearch, csvCell } from './domain.js';

const $ = selector => document.querySelector(selector);
const state = { customers: [], orders: [], payments: [], view: 'overview', query: '', filter: 'all', loaded: false, loading: false, demo: false };
const names = { overview: 'Visão geral', orders: 'Encomendas', customers: 'Clientes', payments: 'Pagamentos' };
const singular = { orders: 'encomenda', customers: 'cliente', payments: 'pagamento' };
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const date = (value, options = {}) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', ...options });
const time = value => new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const customerFor = id => state.customers.find(c => c.id === id);
const orderFor = id => state.orders.find(o => o.id === id);
const byDelivery = (a, b) => new Date(a.delivery_date) - new Date(b.delivery_date);
const initials = name => String(name || '?').trim().split(/\s+/).slice(0, 2).map(n => n[0]).join('').toLocaleUpperCase('pt-BR');
const badge = status => '<span class="badge ' + escape(status) + '">' + escape(statusLabels[status] || status) + '</span>';
const actionButton = (action, entity, id, label, glyph, extra = '') => '<button type="button" class="icon-button ' + extra + '" data-action="' + action + '" data-entity="' + entity + '" data-id="' + escape(id) + '" aria-label="' + escape(label) + '" title="' + escape(label) + '">' + icon(glyph) + '</button>';
const actions = (entity, item) => '<div class="row-actions">' + actionButton('edit', entity, item.id, 'Editar ' + singular[entity], 'edit') + actionButton('delete', entity, item.id, 'Excluir ' + singular[entity], 'trash', 'danger') + '</div>';
let toastTimer;
let formSaving = false;
let deleting = false;

function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }
function notify(message, error = false) {
  clearTimeout(toastTimer);
  $('#toast').className = 'toast' + (error ? ' error' : '');
  $('#toast').innerHTML = icon(error ? 'warning' : 'check') + '<span>' + escape(message) + '</span>';
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 5500);
}
async function api(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(path, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...options.headers } });
    if (response.status === 204) return null;
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      const fields = Array.isArray(result?.errors) ? result.errors.map(e => e.message).join(' ') : '';
      throw new Error(fields || result?.message || 'Não foi possível concluir a operação. Tente novamente.');
    }
    return result;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('A conexão demorou mais que o esperado. Tente novamente.');
    if (error instanceof TypeError) throw new Error('Não foi possível conectar. Verifique sua conexão e tente novamente.');
    throw error;
  } finally { clearTimeout(timer); }
}
async function loadData() {
  if (state.loading) return false;
  state.loading = true;
  $('#sync-state').className = 'sync-state';
  $('#sync-state').innerHTML = '<span></span>Atualizando';
  $('#view').setAttribute('aria-busy', 'true');
  try {
    const values = await Promise.all(['customers', 'orders', 'payments'].map(resource => api('/' + resource)));
    if (!values.every(Array.isArray)) throw new Error('Os dados recebidos não estão no formato esperado.');
    [state.customers, state.orders, state.payments] = values;
    state.loaded = true;
    $('#connection-error').hidden = true;
    $('#sync-state').className = 'sync-state connected';
    $('#sync-state').innerHTML = '<span></span>' + (state.demo ? 'Demonstração local' : 'Tudo atualizado');
    render();
    return true;
  } catch (error) {
    $('#connection-error').innerHTML = escape(error.message) + '<button type="button" data-action="refresh">Tentar novamente</button>';
    $('#connection-error').hidden = false;
    $('#sync-state').className = 'sync-state failed';
    $('#sync-state').innerHTML = '<span></span>Sem conexão';
    if (!state.loaded) $('#view').innerHTML = empty('Seu ateliê está aqui.', 'Precisamos conectar à API para carregar seus dados. Use “Tentar novamente” acima.', '', '', 'heart');
    return false;
  } finally { state.loading = false; $('#view').setAttribute('aria-busy', 'false'); }
}
function empty(title, text, label = '', entity = '', glyph = 'bag') {
  return '<div class="empty-state"><span class="empty-icon">' + icon(glyph) + '</span><h3>' + escape(title) + '</h3><p>' + escape(text) + '</p>' + (label ? '<button class="button primary small" data-action="create" data-entity="' + entity + '">' + icon('plus') + escape(label) + '</button>' : '') + '</div>';
}
function go(view) { if (state.view === view) { state.filter = 'all'; state.query = ''; $('#global-search').value = ''; render(); } else location.hash = view; }
function readRoute() {
  state.view = Object.hasOwn(names, location.hash.slice(1)) ? location.hash.slice(1) : 'overview';
  state.filter = 'all'; state.query = ''; $('#global-search').value = '';
  render();
}
function render() {
  const view = state.view;
  const header = {
    overview: ['Seu ateliê, em dia', 'Tudo o que você precisa para cuidar de cada encomenda.', 'UM POUQUINHO DE ORGANIZAÇÃO, MUITO MAIS LEVEZA'],
    orders: ['Encomendas feitas com carinho', 'Da primeira ideia à entrega. Acompanhe cada detalhe.', 'CADA PEDIDO CONTA UMA HISTÓRIA'],
    customers: ['Quem adoça o seu dia', 'Seus clientes e os momentos que vocês celebram juntos.', 'BOAS RELAÇÕES COMEÇAM PELO CUIDADO'],
    payments: ['Contas claras, rotina leve', 'Registre recebimentos e acompanhe o saldo de cada encomenda.', 'UM CUIDADO A MAIS COM O SEU NEGÓCIO'],
  }[view];
  $('#breadcrumb').textContent = names[view];
  document.title = names[view] + ' · Doce Gestão';
  $('#page-title').innerHTML = escape(header[0]) + '<span>.</span>';
  $('#page-subtitle').textContent = header[1];
  $('#page-eyebrow').textContent = header[2];
  const entity = view === 'overview' ? 'orders' : view;
  $('#primary-action').dataset.entity = entity;
  $('#primary-action').innerHTML = icon('plus') + ({ orders: 'Nova encomenda', customers: 'Novo cliente', payments: 'Registrar pagamento' }[entity]);
  const placeholder = { overview: 'Buscar encomenda ou cliente...', orders: 'Buscar encomenda ou cliente...', customers: 'Buscar nome, telefone ou e-mail...', payments: 'Buscar encomenda, cliente ou método...' }[view];
  $('#global-search').placeholder = placeholder;
  $('#global-search').setAttribute('aria-label', placeholder.replace('...', ''));
  document.querySelectorAll('[data-nav]').forEach(el => {
    const active = el.dataset.nav === view;
    el.classList.toggle('active', active);
    if (active) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
  });
  $('#order-count').textContent = state.orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
  if (state.loaded) $('#view').innerHTML = view === 'overview' ? dashboard() : view === 'orders' ? orderList() : view === 'customers' ? customerList() : paymentList();
}
function orderMatches(order) { return matchesSearch([order.title, customerFor(order.customer_id)?.name, statusLabels[order.status]], state.query); }
function filteredOrders() { return [...state.orders].filter(orderMatches).filter(o => state.filter === 'all' || (state.filter === 'open' ? !['delivered', 'cancelled'].includes(o.status) : o.status === state.filter)).sort(byDelivery); }
function orderRows(orders, compact = false) {
  return orders.map(o => '<tr><td><button class="cell-main cell-button" data-action="detail" data-entity="orders" data-id="' + escape(o.id) + '">' + escape(o.title) + '</button><span class="cell-sub">' + escape(customerFor(o.customer_id)?.name || 'Cliente não encontrado') + '</span></td><td><span class="cell-main">' + escape(date(o.delivery_date)) + '</span><span class="cell-sub">' + escape(time(o.delivery_date)) + '</span></td><td>' + badge(o.status) + '</td><td class="cell-price">' + money(o.total_price) + '</td>' + (compact ? '' : '<td class="' + (balanceFor(o, state.payments) > 0 ? 'balance-positive' : 'balance-settled') + '">' + money(balanceFor(o, state.payments)) + '</td>') + '<td>' + (compact ? actionButton('detail', 'orders', o.id, 'Ver encomenda', 'chevron') : actions('orders', o)) + '</td></tr>').join('');
}
function orderTable(orders, compact = false) {
  if (!orders.length) return empty(state.query ? 'Nenhuma encomenda encontrada' : 'Espaço para novos momentos', state.query ? 'Tente outro nome ou ajuste os filtros.' : 'Cadastre uma encomenda e acompanhe tudo por aqui.', state.query ? '' : 'Nova encomenda', 'orders');
  return '<div class="table-wrap"><table><caption class="sr-only">Encomendas</caption><thead><tr><th>Encomenda / cliente</th><th>Entrega</th><th>Status</th><th>Valor</th>' + (compact ? '' : '<th>Saldo a receber</th>') + '<th><span class="sr-only">Ações</span></th></tr></thead><tbody>' + orderRows(orders, compact) + '</tbody></table></div>';
}
function filters(options) {
  return '<div class="panel-filters">' + options.map(([value, label]) => '<button class="filter-button ' + (state.filter === value ? 'active' : '') + '" data-action="filter" data-filter="' + value + '" aria-pressed="' + (state.filter === value) + '">' + label + '</button>').join('') + '</div>';
}
function metric(label, value, note, glyph, color) {
  return '<article class="metric-card"><div class="metric-top"><span class="metric-label">' + label + '</span><span class="metric-icon ' + color + '">' + icon(glyph) + '</span></div><p class="metric-value">' + value + '</p><p class="metric-note">' + icon('check') + note + '</p></article>';
}
function metricCards() {
  const s = summarize(state.orders, state.payments);
  return '<section class="metric-grid" aria-label="Resumo da confeitaria">' + metric('Encomendas em aberto', s.open, 'Pendentes até prontas para entrega', 'bag', '') + metric('Em produção', s.production, 'Carinho tomando forma', 'cake', 'lilac') + metric('Total recebido', money(s.received), state.payments.length + ' pagamento(s) registrados', 'wallet', 'mint') + metric('A receber', money(s.outstanding), 'Saldo das encomendas ativas', 'clock', 'gold') + '</section>';
}
const cakeArt = '<svg viewBox="0 0 220 185" fill="none" aria-hidden="true"><ellipse cx="117" cy="165" rx="78" ry="8" fill="#ead4de"/><path d="M47 157h140" stroke="#b77b94" stroke-width="3" stroke-linecap="round"/><path d="M106 150v13m24-13v13m-35 0h48" stroke="#bc829a" stroke-width="2"/><path d="M58 104c0-7 26-13 59-13s59 6 59 13v40c0 7-26 13-59 13s-59-6-59-13v-40Z" fill="#e2bacb"/><ellipse cx="117" cy="104" rx="59" ry="13" fill="#fdf3f5" stroke="#c998ad"/><path d="M58 106c8 10 12 6 16 4 9-5 12 6 21 6s11-6 20-4 10 5 19 1 13 4 22 0 14 0 20-7" stroke="#c995ad" stroke-width="2"/><path d="M76 70c0-6 18-10 41-10s41 4 41 10v30c0 6-18 10-41 10s-41-4-41-10V70Z" fill="#edcfdb"/><ellipse cx="117" cy="70" rx="41" ry="10" fill="#fff9fa" stroke="#c998ad"/><path d="M76 73c9 9 13 3 21 5s13 8 21 3 10 1 19-1 14 4 21-5" stroke="#c995ad" stroke-width="2"/><path d="M117 62V41" stroke="#b37590" stroke-width="3"/><path d="M117 40c-10-7-3-15 0-19 6 8 9 15 0 19Z" fill="#d7ae6e"/><circle cx="40" cy="60" r="3" fill="#d7ae6e"/><path d="m176 34 2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7ZM40 113l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="#c891a9"/><path d="m187 115 4 5m-8-1 4 5m-144-33 5-2" stroke="#d7ae6e" stroke-width="2" stroke-linecap="round"/></svg>';
function dashboard() {
  const today = new Date().toDateString();
  const dueToday = state.orders.filter(o => new Date(o.delivery_date).toDateString() === today && !['delivered', 'cancelled'].includes(o.status)).length;
  const orders = filteredOrders();
  return '<section class="hero"><div class="hero-copy"><div class="hero-tag">' + icon('sparkles') + 'O SEU TALENTO MERECE ESSE CUIDADO</div><h2>Mais leveza na rotina.<br>Mais carinho em cada entrega.</h2><p>' + (dueToday ? 'Você tem ' + dueToday + ' entrega(s) para hoje. Vamos deixar tudo em dia?' : 'Organize suas encomendas e abra espaço para a criatividade.') + '</p><button class="text-link" data-action="navigate" data-view="orders">Cuidar das encomendas ' + icon('chevron') + '</button></div><div class="hero-art">' + cakeArt + '</div></section>' + metricCards() +
    '<div class="dashboard-grid"><section class="panel"><div class="panel-header"><div><h2 class="panel-title">Suas encomendas<span class="panel-count">' + state.orders.length + '</span></h2><p class="panel-subtitle">Cada detalhe no tempo certo.</p></div><button class="text-link" data-action="navigate" data-view="orders">Ver todas ' + icon('chevron') + '</button></div>' +
    filters([['all', 'Todas'], ['open', 'Em aberto'], ['in_production', 'Em produção'], ['ready', 'Prontas']]) + orderTable(orders.slice(0, 6), true) +
    '<div class="panel-bottom"><span>' + Math.min(orders.length, 6) + ' de ' + orders.length + ' encomendas</span><span>Organizadas por entrega</span></div></section><div class="right-column">' + chartPanel() + upcomingPanel() + '</div></div>';
}
function chartPanel() {
  const days = Array.from({ length: 7 }, (_, index) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + index); d.setHours(0, 0, 0, 0);
    const value = state.payments.filter(p => new Date(p.created_at).toDateString() === d.toDateString()).reduce((sum, p) => sum + Math.round(Number(p.amount) * 100), 0) / 100;
    return { label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), value };
  });
  const max = Math.max(...days.map(d => d.value), 1);
  const total = days.reduce((sum, d) => sum + Math.round(d.value * 100), 0) / 100;
  return '<section class="panel chart-card"><div class="panel-header"><div><h2 class="panel-title">Um negócio que floresce</h2><p class="panel-subtitle">Recebimentos dos últimos 7 dias</p></div>' + icon('trend') + '</div><p class="chart-total">' + money(total) + '<small>em pagamentos registrados</small></p><div class="chart" role="img" aria-label="' + escape(days.map(d => d.label + ': ' + money(d.value)).join('; ')) + '">' + days.map(d => '<div class="chart-column" title="' + escape(d.label + ': ' + money(d.value)) + '"><div class="chart-bar" style="height:' + Math.max(2, Math.round(d.value / max * 100)) + '%"></div></div>').join('') + '</div><div class="chart-labels" aria-hidden="true">' + days.map(d => '<span>' + d.label + '</span>').join('') + '</div><p class="chart-legend">Valores recebidos por dia</p></section>';
}
function upcomingPanel() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = state.orders.filter(o => !['delivered', 'cancelled'].includes(o.status) && new Date(o.delivery_date) >= today).sort(byDelivery).slice(0, 3);
  return '<section class="panel"><div class="panel-header"><div><h2 class="panel-title">Próximos momentos</h2><p class="panel-subtitle">Sua agenda de entregas</p></div>' + icon('calendar') + '</div>' + (upcoming.length ? '<div class="delivery-list">' + upcoming.map(o => '<button class="delivery-item" data-action="detail" data-entity="orders" data-id="' + escape(o.id) + '"><span class="date-tile"><strong>' + new Date(o.delivery_date).getDate() + '</strong><small>' + escape(new Date(o.delivery_date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')) + '</small></span><span class="delivery-copy"><strong>' + escape(o.title) + '</strong><small>' + escape(customerFor(o.customer_id)?.name || '') + ' · ' + time(o.delivery_date) + '</small></span>' + icon('chevron') + '</button>').join('') + '</div>' : '<p class="delivery-empty">Nenhuma entrega futura por enquanto. A próxima celebração começa com uma nova encomenda.</p>') + '</section>';
}
function exportButton(entity) { return '<button class="button small" data-action="export" data-entity="' + entity + '">' + icon('export') + 'Exportar CSV</button>'; }
function orderList() {
  const orders = filteredOrders();
  return '<section class="panel"><div class="section-card-header">' + filters([['all', 'Todas'], ['open', 'Em aberto'], ['in_production', 'Em produção'], ['ready', 'Prontas'], ['delivered', 'Entregues'], ['cancelled', 'Canceladas']]) + exportButton('orders') + '</div>' + orderTable(orders) + '<div class="panel-bottom"><span>' + orders.length + ' encomenda(s) encontradas</span><span>Saldo considera todos os pagamentos</span></div></section>';
}
function filteredCustomers() { return state.customers.filter(c => matchesSearch([c.name, c.phone, c.email], state.query)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); }
function customerList() {
  const customers = filteredCustomers();
  return '<section class="panel"><div class="section-card-header"><p class="list-summary"><strong>' + state.customers.length + '</strong> pessoas que fazem parte da sua história</p>' + exportButton('customers') + '</div>' + (customers.length ? '<div class="table-wrap"><table><caption class="sr-only">Clientes</caption><thead><tr><th>Cliente</th><th>Telefone</th><th>E-mail</th><th>Encomendas</th><th><span class="sr-only">Ações</span></th></tr></thead><tbody>' + customers.map(c => '<tr><td><div class="cell-person"><span class="person-avatar">' + escape(initials(c.name)) + '</span><button class="cell-main cell-button" data-action="detail" data-entity="customers" data-id="' + escape(c.id) + '">' + escape(c.name) + '</button></div></td><td>' + escape(c.phone) + '</td><td>' + escape(c.email || 'Não informado') + '</td><td>' + state.orders.filter(o => o.customer_id === c.id).length + ' encomenda(s)</td><td>' + actions('customers', c) + '</td></tr>').join('') + '</tbody></table></div>' : empty(state.query ? 'Nenhum cliente encontrado' : 'Toda história tem um começo', state.query ? 'Tente buscar por outro nome, telefone ou e-mail.' : 'Cadastre seu primeiro cliente para começar a receber encomendas.', state.query ? '' : 'Novo cliente', 'customers', 'users')) + '<div class="panel-bottom"><span>' + customers.length + ' cliente(s) encontrados</span><span>Em ordem alfabética</span></div></section>';
}
function filteredPayments() {
  return state.payments.filter(p => {
    const order = orderFor(p.order_id);
    return matchesSearch([order?.title, customerFor(order?.customer_id)?.name, methodLabels[p.method]], state.query) && (state.filter === 'all' || p.method === state.filter);
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
function paymentList() {
  const payments = filteredPayments();
  return metricCards() + '<section class="panel"><div class="section-card-header">' + filters([['all', 'Todos'], ['pix', 'Pix'], ['cash', 'Dinheiro'], ['credit_card', 'Crédito'], ['debit_card', 'Débito']]) + exportButton('payments') + '</div>' + (payments.length ? '<div class="table-wrap"><table><caption class="sr-only">Pagamentos</caption><thead><tr><th>Encomenda / cliente</th><th>Registrado em</th><th>Método</th><th>Valor recebido</th><th><span class="sr-only">Ações</span></th></tr></thead><tbody>' + payments.map(p => {
    const order = orderFor(p.order_id);
    return '<tr><td><button class="cell-main cell-button" data-action="detail" data-entity="payments" data-id="' + escape(p.id) + '">' + escape(order?.title || 'Encomenda não encontrada') + '</button><span class="cell-sub">' + escape(customerFor(order?.customer_id)?.name || '') + '</span></td><td><span class="cell-main">' + date(p.created_at) + '</span><span class="cell-sub">' + time(p.created_at) + '</span></td><td>' + escape(methodLabels[p.method]) + '</td><td class="cell-price">' + money(p.amount) + '</td><td>' + actions('payments', p) + '</td></tr>';
  }).join('') + '</tbody></table></div>' : empty(state.query || state.filter !== 'all' ? 'Nenhum pagamento encontrado' : 'Cada recebimento, bem cuidado', state.query || state.filter !== 'all' ? 'Ajuste a busca ou o método de pagamento.' : 'Registre o primeiro pagamento de uma encomenda para acompanhar seus recebimentos.', state.query || state.filter !== 'all' ? '' : 'Registrar pagamento', 'payments', 'wallet')) + '<div class="panel-bottom"><span>' + payments.length + ' pagamento(s)</span><span>Total da seleção: ' + money(payments.reduce((sum, p) => sum + Math.round(Number(p.amount) * 100), 0) / 100) + '</span></div></section>';
}

function field(label, control, full = false, hint = '') {
  return '<label class="field ' + (full ? 'full' : '') + '"><span>' + escape(label) + '</span>' + control + (hint ? '<small>' + escape(hint) + '</small>' : '') + '</label>';
}
function input(name, value = '', attrs = '') { return '<input name="' + name + '" value="' + escape(value) + '" ' + attrs + '>'; }
function options(values, selected) { return Object.entries(values).map(([value, label]) => '<option value="' + escape(value) + '"' + (value === selected ? ' selected' : '') + '>' + escape(label) + '</option>').join(''); }
function localDatetime(value) {
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function dialogHeader(title, subtitle, dialog, id = 'form-title') {
  return '<header class="dialog-header"><div><p class="dialog-eyebrow">MEU ATELIÊ · DOCE GESTÃO</p><h2 id="' + id + '">' + escape(title) + '</h2><p>' + escape(subtitle) + '</p></div><button type="button" class="icon-button" data-action="close" data-dialog="' + dialog + '" aria-label="Fechar">' + icon('close') + '</button></header>';
}
function closeDialog(id) { $('#' + id).close(); }
function openForm(entity, id = '', relatedId = '') {
  if (!state.loaded) { notify('Conecte à API antes de cadastrar um registro.', true); return; }
  const existing = id ? state[entity].find(item => item.id === id) : null;
  if (id && !existing) { notify('Esse registro não está mais disponível. Atualize os dados.', true); return; }
  if (entity === 'orders' && !state.customers.length) {
    notify('Vamos cadastrar seu primeiro cliente antes da encomenda.');
    openForm('customers'); return;
  }
  const payable = state.orders.filter(o => o.status !== 'cancelled' && balanceFor(o, state.payments) > 0);
  if (entity === 'payments' && !existing && !payable.length) {
    notify('Não há encomendas com saldo a receber. Cadastre ou confira uma encomenda.');
    go('orders'); return;
  }
  const item = existing || {};
  const title = (existing ? 'Editar ' : entity === 'payments' ? 'Registrar ' : entity === 'customers' ? 'Novo ' : 'Nova ') + singular[entity];
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(14, 0, 0, 0);
  let fields = '';
  if (entity === 'customers') {
    fields = field('Nome do cliente *', input('name', item.name, 'required maxlength="120" autocomplete="name" placeholder="Como seu cliente se chama?"'), true) +
      field('Telefone *', input('phone', item.phone, 'type="tel" required maxlength="30" autocomplete="tel" placeholder="(41) 99999-9999"'), true) +
      field('E-mail', input('email', item.email, 'type="email" maxlength="150" autocomplete="email" placeholder="cliente@exemplo.com"'), true, 'Opcional. Para manter todos os contatos à mão.');
  } else if (entity === 'orders') {
    const customers = [...state.customers].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    fields = field('Cliente *', '<select name="customer_id" required>' + '<option value="">Selecione um cliente</option>' + customers.map(c => '<option value="' + escape(c.id) + '"' + (c.id === (item.customer_id || relatedId) ? ' selected' : '') + '>' + escape(c.name) + '</option>').join('') + '</select>', true) +
      field('O que vamos preparar? *', input('title', item.title, 'required maxlength="150" placeholder="Ex.: Bolo de aniversário de chocolate"'), true) +
      field('Entrega *', input('delivery_date', localDatetime(item.delivery_date || tomorrow), 'type="datetime-local" required')) +
      field('Valor total (R$) *', input('total_price', existing ? Number(item.total_price).toFixed(2) : '', 'type="number" inputmode="decimal" min="0" max="99999999.99" step="0.01" required placeholder="0,00"')) +
      field('Ocasião', '<select name="occasion"><option value="">Não informada</option>' + options(occasionLabels, item.occasion) + '</select>') +
      field('Status', '<select name="status">' + options(statusLabels, item.status || 'pending') + '</select>') +
      field('Detalhes e observações', '<textarea name="description" maxlength="500" placeholder="Sabor, tamanho, decoração e aquele detalhe especial...">' + escape(item.description) + '</textarea>', true);
  } else {
    const selectedOrder = existing ? item.order_id : payable.some(o => o.id === relatedId) ? relatedId : payable.sort(byDelivery)[0].id;
    fields = (existing ? field('Encomenda', input('order_title', orderFor(item.order_id)?.title || '', 'readonly'), true, 'O vínculo com a encomenda é mantido nas correções.') : field('Encomenda *', '<select name="order_id" id="payment-order" required>' + payable.map(o => '<option value="' + escape(o.id) + '"' + (o.id === selectedOrder ? ' selected' : '') + '>' + escape(o.title + ' · ' + (customerFor(o.customer_id)?.name || '')) + '</option>').join('') + '</select>', true)) +
      '<div class="dialog-callout field full" id="payment-balance"></div>' +
      field('Valor recebido (R$) *', input('amount', existing ? Number(item.amount).toFixed(2) : '', 'type="number" inputmode="decimal" min="0.01" max="99999999.99" step="0.01" required placeholder="0,00"')) +
      field('Método de pagamento *', '<select name="method" required>' + options(methodLabels, item.method || 'pix') + '</select>');
  }
  const dialog = $('#form-dialog');
  dialog.innerHTML = dialogHeader(title, 'Preencha os detalhes. Campos com * são obrigatórios.', 'form-dialog') +
    '<form id="record-form"><div class="dialog-body"><div class="form-error" id="form-error" role="alert" hidden></div><div class="form-grid">' + fields + '</div></div><footer class="dialog-footer"><button type="button" class="button" data-action="close" data-dialog="form-dialog">Cancelar</button><button type="submit" class="button primary" id="save-button">' + icon('check') + (existing ? 'Salvar alterações' : entity === 'payments' ? 'Registrar pagamento' : 'Salvar ' + singular[entity]) + '</button></footer></form>';
  if ($('#detail-dialog').open) closeDialog('detail-dialog');
  if (!dialog.open) dialog.showModal();
  const form = $('#record-form');
  const updateBalance = () => {
    const orderId = existing ? item.order_id : form.elements.order_id?.value;
    const order = orderFor(orderId);
    if (!order) return;
    const available = balanceFor(order, state.payments) + Number(existing ? item.amount : 0);
    $('#payment-balance').innerHTML = '<span>' + icon('wallet') + ' Saldo disponível para este registro: <strong>' + money(available) + '</strong></span>';
    form.elements.amount.max = Math.max(0, Math.round(available * 100) / 100);
  };
  if (entity === 'payments') { updateBalance(); $('#payment-order')?.addEventListener('change', updateBalance); }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (formSaving) return;
    const data = Object.fromEntries(new FormData(form));
    let body;
    if (entity === 'customers') body = { name: data.name.trim(), phone: data.phone.trim(), email: data.email.trim() || null };
    else if (entity === 'orders') body = { ...data, title: data.title.trim(), description: data.description.trim() || null, occasion: data.occasion || null, total_price: Number(data.total_price), delivery_date: new Date(data.delivery_date).toISOString() };
    else body = { amount: Number(data.amount), method: data.method, ...(existing ? {} : { order_id: data.order_id }) };
    formSaving = true;
    const button = $('#save-button');
    const originalButton = button.innerHTML;
    button.disabled = true;
    button.textContent = 'Salvando...';
    $('#form-error').hidden = true;
    try {
      await api('/' + entity + (existing ? '/' + encodeURIComponent(id) : ''), { method: existing ? 'PUT' : 'POST', body: JSON.stringify(body) });
      closeDialog('form-dialog');
      const refreshed = await loadData();
      notify(existing ? 'Alterações salvas com carinho.' : entity === 'payments' ? 'Pagamento registrado.' : entity === 'customers' ? 'Cliente cadastrado. Que venham novas histórias!' : 'Encomenda cadastrada. Hora de criar!');
      if (!refreshed) notify('Registro salvo. Atualize a página para conferir os dados.', true);
    } catch (error) {
      $('#form-error').textContent = error.message;
      $('#form-error').hidden = false;
      $('#form-error').scrollIntoView({ block: 'nearest' });
    } finally { formSaving = false; button.disabled = false; button.innerHTML = originalButton; }
  });
}
function detailLine(label, value, full = false) { return '<div class="' + (full ? 'full' : '') + '"><dt>' + escape(label) + '</dt><dd>' + escape(value || 'Não informado') + '</dd></div>'; }
function openDetail(entity, id) {
  const item = state[entity].find(record => record.id === id);
  if (!item) { notify('Registro não encontrado. Atualize os dados.', true); return; }
  let title, content;
  if (entity === 'orders') {
    title = item.title;
    const paid = paidFor(item.id, state.payments);
    const balance = balanceFor(item, state.payments);
    const payments = state.payments.filter(p => p.order_id === item.id);
    const steps = ['pending', 'confirmed', 'in_production', 'ready', 'delivered'];
    content = badge(item.status) + '<div class="progress-track" aria-hidden="true"><span style="width:' + (item.status === 'cancelled' ? 0 : (steps.indexOf(item.status) + 1) / steps.length * 100) + '%"></span></div>' +
      '<dl class="detail-info">' + detailLine('Cliente', customerFor(item.customer_id)?.name, true) + detailLine('Entrega', date(item.delivery_date, { year: 'numeric' }) + ' · ' + time(item.delivery_date)) + detailLine('Ocasião', occasionLabels[item.occasion]) + detailLine('Valor da encomenda', money(item.total_price)) + detailLine('Criada em', date(item.created_at, { year: 'numeric' })) + detailLine('Observações', item.description, true) + '</dl>' +
      '<div class="detail-money"><div><small>Total recebido</small><strong>' + money(paid) + '</strong></div><div><small>Saldo a receber</small><strong>' + money(balance) + '</strong></div></div><section class="detail-section"><div class="view-heading-row"><h3>Pagamentos desta encomenda</h3>' + (balance > 0 && item.status !== 'cancelled' ? '<button class="button small" data-action="pay-order" data-id="' + escape(item.id) + '">' + icon('plus') + 'Registrar</button>' : '') + '</div>' +
      (payments.length ? payments.map(p => '<div class="delivery-item"><span class="person-avatar">' + icon('wallet') + '</span><div class="delivery-copy"><strong>' + money(p.amount) + ' · ' + escape(methodLabels[p.method]) + '</strong><small>' + date(p.created_at) + ' · ' + time(p.created_at) + '</small></div>' + actions('payments', p) + '</div>').join('') : '<p class="detail-note">Os recebimentos desta encomenda aparecerão aqui.</p>') + '</section>';
  } else if (entity === 'customers') {
    title = item.name;
    const orders = state.orders.filter(o => o.customer_id === item.id).sort(byDelivery);
    content = '<dl class="detail-info">' + detailLine('Telefone', item.phone) + detailLine('E-mail', item.email) + detailLine('Cliente desde', date(item.created_at, { year: 'numeric' })) + detailLine('Encomendas', String(orders.length)) + '</dl><section class="detail-section"><div class="view-heading-row"><h3>Histórias com esse cliente</h3><button class="button small" data-action="order-customer" data-id="' + escape(item.id) + '">' + icon('plus') + 'Encomenda</button></div>' +
      (orders.length ? orders.map(o => '<button class="delivery-item" data-action="detail" data-entity="orders" data-id="' + escape(o.id) + '"><div class="delivery-copy"><strong>' + escape(o.title) + '</strong><small>' + date(o.delivery_date) + ' · ' + money(o.total_price) + '</small></div>' + badge(o.status) + '</button>').join('') : '<p class="detail-note">Ainda não há encomendas para esse cliente.</p>') + '</section>';
  } else {
    title = 'Pagamento registrado';
    const order = orderFor(item.order_id);
    content = '<span class="badge paid">Recebido</span><div class="detail-money"><div><small>Valor recebido</small><strong>' + money(item.amount) + '</strong></div><div><small>Método</small><strong style="font-size:15px">' + escape(methodLabels[item.method]) + '</strong></div></div><dl class="detail-info">' + detailLine('Encomenda', order?.title, true) + detailLine('Cliente', customerFor(order?.customer_id)?.name, true) + detailLine('Registrado em', date(item.created_at, { year: 'numeric' }) + ' · ' + time(item.created_at), true) + '</dl><p class="detail-note">Este é um registro administrativo de recebimento. A exclusão corrige o registro; não realiza estorno bancário.</p>';
  }
  const dialog = $('#detail-dialog');
  dialog.innerHTML = dialogHeader(title, 'Os detalhes que fazem a diferença.', 'detail-dialog', 'detail-title') + '<div class="dialog-body">' + content + '<section class="detail-section detail-actions"><button class="button" data-action="edit" data-entity="' + entity + '" data-id="' + escape(id) + '">' + icon('edit') + 'Editar ' + singular[entity] + '</button><button class="button" data-action="delete" data-entity="' + entity + '" data-id="' + escape(id) + '">' + icon('trash') + 'Excluir</button></section></div>';
  if (!dialog.open) dialog.showModal();
}
function confirmDelete(entity, id) {
  const item = state[entity].find(record => record.id === id);
  if (!item) return;
  const label = entity === 'customers' ? item.name : entity === 'orders' ? item.title : money(item.amount) + ' · ' + methodLabels[item.method];
  const message = entity === 'customers' ? 'Clientes com encomendas não podem ser excluídos.' : entity === 'orders' ? 'Encomendas com pagamentos não podem ser excluídas. Remova os registros de pagamento antes.' : 'Essa correção remove o registro e atualiza o saldo da encomenda. Ela não realiza um estorno bancário.';
  const dialog = $('#confirm-dialog');
  dialog.innerHTML = dialogHeader('Excluir ' + singular[entity] + '?', label, 'confirm-dialog', 'confirm-title') + '<div class="dialog-body"><p>' + escape(message) + '</p><p style="margin-top:12px">Esta ação não pode ser desfeita.</p><div id="delete-error" class="form-error" role="alert" hidden style="margin:16px 0 0"></div></div><footer class="dialog-footer"><button class="button" data-action="close" data-dialog="confirm-dialog">Manter registro</button><button class="button danger" id="confirm-delete">' + icon('trash') + 'Sim, excluir</button></footer>';
  dialog.showModal();
  $('#confirm-delete').addEventListener('click', async () => {
    if (deleting) return;
    deleting = true;
    const button = $('#confirm-delete'); button.disabled = true; button.textContent = 'Excluindo...';
    try {
      await api('/' + entity + '/' + encodeURIComponent(id), { method: 'DELETE' });
      dialog.close();
      if ($('#detail-dialog').open) closeDialog('detail-dialog');
      await loadData(); notify('Registro excluído.');
    } catch (error) { $('#delete-error').hidden = false; $('#delete-error').textContent = error.message; }
    finally { deleting = false; button.disabled = false; button.innerHTML = icon('trash') + 'Sim, excluir'; }
  });
}
function showGuide() {
  const dialog = $('#guide-dialog');
  dialog.innerHTML = dialogHeader('Vamos adoçar sua rotina?', 'Três passos para deixar seu ateliê organizado.', 'guide-dialog', 'guide-title') + '<div class="dialog-body">' +
    [['users', 'Comece pelas pessoas', 'Cadastre o nome e telefone do cliente. Depois, todas as encomendas dele ficam reunidas em um só lugar.'], ['cake', 'Dê forma à encomenda', 'Escolha o cliente, descreva o que vai preparar e informe a entrega e o valor. Atualize o status conforme o trabalho avança.'], ['wallet', 'Cuide dos recebimentos', 'Registre o sinal ou pagamento completo. O saldo é atualizado automaticamente, sem permitir receber mais que o total.']].map(([glyph, title, description]) => '<section class="guide-step">' + icon(glyph) + '<div><h3>' + title + '</h3><p>' + description + '</p></div></section>').join('') + '</div><footer class="dialog-footer"><button class="button primary" data-action="close" data-dialog="guide-dialog">Tudo pronto para começar</button></footer>';
  dialog.showModal();
}
function exportCSV(entity) {
  const records = entity === 'customers' ? filteredCustomers() : entity === 'orders' ? filteredOrders() : filteredPayments();
  if (!records.length) { notify('Não há registros nessa seleção para exportar.'); return; }
  const headers = entity === 'customers' ? ['Nome', 'Telefone', 'Email'] : entity === 'orders' ? ['Encomenda', 'Cliente', 'Entrega', 'Status', 'Valor total', 'Recebido', 'Saldo'] : ['Encomenda', 'Cliente', 'Método', 'Valor', 'Registrado em'];
  const rows = records.map(record => {
    if (entity === 'customers') return [record.name, record.phone, record.email];
    if (entity === 'orders') return [record.title, customerFor(record.customer_id)?.name, new Date(record.delivery_date).toLocaleString('pt-BR'), statusLabels[record.status], Number(record.total_price).toFixed(2).replace('.', ','), paidFor(record.id, state.payments).toFixed(2).replace('.', ','), balanceFor(record, state.payments).toFixed(2).replace('.', ',')];
    const order = orderFor(record.order_id);
    return [order?.title, customerFor(order?.customer_id)?.name, methodLabels[record.method], Number(record.amount).toFixed(2).replace('.', ','), new Date(record.created_at).toLocaleString('pt-BR')];
  });
  const blob = new Blob(['\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'docegestao-' + entity + '.csv'; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000); notify('Arquivo CSV exportado.');
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const { action, entity, id, dialog, view, filter } = button.dataset;
  if (action === 'create') openForm(entity);
  else if (action === 'edit') openForm(entity, id);
  else if (action === 'detail') openDetail(entity, id);
  else if (action === 'delete') confirmDelete(entity, id);
  else if (action === 'close') closeDialog(dialog);
  else if (action === 'navigate') go(view);
  else if (action === 'filter') { state.filter = filter; render(); }
  else if (action === 'refresh') loadData();
  else if (action === 'guide') showGuide();
  else if (action === 'export') exportCSV(entity);
  else if (action === 'pay-order') openForm('payments', '', id);
  else if (action === 'order-customer') openForm('orders', '', id);
});
$('#global-search').addEventListener('input', event => { state.query = event.target.value; render(); });
window.addEventListener('hashchange', readRoute);
hydrateIcons();
$('#today-label').innerHTML = icon('calendar') + escape(new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));
readRoute();
try {
  const config = await api('/app/config.json');
  state.demo = config?.demo === true;
  $('#demo-banner').hidden = !state.demo;
} catch { /* O carregamento dos dados apresenta eventual indisponibilidade da API. */ }
await loadData();
