export const statusLabels = { pending: 'Pendente', confirmed: 'Confirmada', in_production: 'Em produção', ready: 'Pronta', delivered: 'Entregue', cancelled: 'Cancelada' };
export const methodLabels = { pix: 'Pix', cash: 'Dinheiro', credit_card: 'Cartão de crédito', debit_card: 'Cartão de débito' };
export const occasionLabels = { birthday: 'Aniversário', wedding: 'Casamento', party: 'Festa', corporate: 'Corporativo', other: 'Outro' };
export const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
export const cents = value => Math.round(Number(value) * 100);
export function paidFor(orderId, payments) { return payments.filter(p => p.order_id === orderId).reduce((sum, p) => sum + cents(p.amount), 0) / 100; }
export function balanceFor(order, payments) { return (cents(order.total_price) - cents(paidFor(order.id, payments))) / 100; }
export function summarize(orders, payments) {
  const active = orders.filter(o => o.status !== 'cancelled');
  return {
    open: active.filter(o => o.status !== 'delivered').length,
    production: active.filter(o => o.status === 'in_production').length,
    received: payments.reduce((sum, p) => sum + cents(p.amount), 0) / 100,
    outstanding: active.reduce((sum, o) => sum + Math.max(0, cents(balanceFor(o, payments))), 0) / 100,
  };
}
export function normalize(value) { return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR'); }
export function matchesSearch(values, query) { return normalize(values.join(' ')).includes(normalize(query).trim()); }
export function csvCell(value) {
  let text = String(value ?? '');
  if (/^\s*[=+@-]|^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
