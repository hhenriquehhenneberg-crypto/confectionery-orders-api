import { test, expect } from "vitest";
import { paidFor, balanceFor, summarize, matchesSearch, csvCell, money } from "../../public/domain.js";

test("resumo financeiro usa centavos e desconsidera encomendas canceladas no saldo", () => {
  const orders = [
    { id: "a", total_price: 0.3, status: "in_production" },
    { id: "b", total_price: 100, status: "cancelled" },
    { id: "c", total_price: 40, status: "delivered" },
  ];
  const payments = [{ order_id: "a", amount: 0.1 }, { order_id: "a", amount: 0.2 }, { order_id: "c", amount: 20 }];
  expect(paidFor("a", payments)).toBe(0.3);
  expect(balanceFor(orders[0], payments)).toBe(0);
  expect(summarize(orders, payments)).toEqual({ open: 1, production: 1, received: 20.3, outstanding: 20 });
  expect(money(20.3)).toContain("20,30");
});

test("busca permite nomes com acentos, maiúsculas e espaços na consulta", () => {
  expect(matchesSearch(["Bolo de aniversário", "Júlia"], " JULIA ")).toBe(true);
  expect(matchesSearch(["Bolo de aniversário", "Júlia"], "aniversario")).toBe(true);
  expect(matchesSearch(["Mariana", null], "Camila")).toBe(false);
});

test("exportação CSV preserva aspas e neutraliza fórmulas de planilha", () => {
  expect(csvCell('Bolo "especial"')).toBe('"Bolo ""especial"""');
  expect(csvCell("=1+1")).toBe('"\'=1+1"');
  expect(csvCell("  =1+1")).toBe('"\'  =1+1"');
  expect(csvCell("+5541999999999")).toBe('"\'+5541999999999"');
});
