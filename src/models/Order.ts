export const occasions = ["birthday", "wedding", "party", "corporate", "other"] as const;
export const statuses = ["pending", "confirmed", "in_production", "ready", "delivered", "cancelled"] as const;
export interface Order {
  id: string;
  customer_id: string;
  title: string;
  description: string | null;
  occasion: typeof occasions[number] | null;
  delivery_date: Date;
  total_price: number;
  status: typeof statuses[number];
  created_at: Date;
  updated_at: Date;
}
export type CreateOrderDTO = Pick<Order, "customer_id" | "title" | "total_price"> & {
  delivery_date: string;
  description?: string | null;
  occasion?: Order["occasion"];
  status?: Order["status"];
};
export type UpdateOrderDTO = Partial<CreateOrderDTO>;
