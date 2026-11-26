export const paymentMethods = ["pix", "cash", "credit_card", "debit_card"] as const;
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: typeof paymentMethods[number];
  created_at: Date;
  updated_at: Date;
}
export type CreatePaymentDTO = Pick<Payment, "order_id" | "amount" | "method">;
export type UpdatePaymentDTO = Partial<Pick<Payment, "amount" | "method">>;
