import { Pool, PoolClient } from "pg";
import { database } from "../config/database";
import { Payment, CreatePaymentDTO, UpdatePaymentDTO } from "../models/Payment";

const fields = "id, order_id, amount::float8 as amount, method, created_at, updated_at";
export class PaymentRepository {
  constructor(private readonly connection: Pick<Pool | PoolClient, "query"> = database) {}
  async findAll(): Promise<Payment[]> {
    return (await this.connection.query<Payment>(`select ${fields} from payments order by created_at, id`)).rows;
  }
  async findById(id: string): Promise<Payment | undefined> {
    return (await this.connection.query<Payment>(`select ${fields} from payments where id = $1`, [id])).rows[0];
  }
  async findByOrderId(id: string): Promise<Payment[]> {
    return (await this.connection.query<Payment>(`select ${fields} from payments where order_id = $1 order by created_at, id`, [id])).rows;
  }
  async totalForOrder(orderId: string, excludeId?: string): Promise<number> {
    const result = await this.connection.query<{ total: number }>(
      "select coalesce(sum(amount), 0)::float8 as total from payments where order_id = $1 and ($2::uuid is null or id <> $2::uuid)",
      [orderId, excludeId ?? null],
    );
    return result.rows[0].total;
  }
  async create(data: CreatePaymentDTO): Promise<Payment> {
    return (await this.connection.query<Payment>(
      `insert into payments (order_id, amount, method) values ($1, $2, $3) returning ${fields}`,
      [data.order_id, data.amount, data.method],
    )).rows[0];
  }
  async update(id: string, data: UpdatePaymentDTO): Promise<Payment | undefined> {
    return (await this.connection.query<Payment>(
      `update payments set amount = coalesce($2, amount), method = coalesce($3, method) where id = $1 returning ${fields}`,
      [id, data.amount ?? null, data.method ?? null],
    )).rows[0];
  }
  async delete(id: string): Promise<boolean> {
    return (await this.connection.query("delete from payments where id = $1", [id])).rowCount === 1;
  }
}
