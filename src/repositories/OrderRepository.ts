import { database } from "../config/database";
import { Order, CreateOrderDTO, UpdateOrderDTO } from "../models/Order";
import { AppError } from "../errors/AppError";

// Converte o preço para número na resposta
const fields = "id, customer_id, title, description, occasion, delivery_date, total_price::float8 as total_price, status, created_at, updated_at";
function rethrow(error: unknown): never {
  if (error && typeof error === "object" && "code" in error && error.code === "23503") {
    throw new AppError(404, "Cliente não encontrado.");
  }
  throw error;
}
export class OrderRepository {
  async findAll(): Promise<Order[]> {
    return (await database.query<Order>(`select ${fields} from orders order by created_at, id`)).rows;
  }
  async findById(id: string): Promise<Order | undefined> {
    return (await database.query<Order>(`select ${fields} from orders where id = $1`, [id])).rows[0];
  }
  async findByCustomerId(id: string): Promise<Order[]> {
    return (await database.query<Order>(`select ${fields} from orders where customer_id = $1 order by created_at, id`, [id])).rows;
  }
  async create(data: CreateOrderDTO): Promise<Order> {
    try {
      return (await database.query<Order>(
        `insert into orders (customer_id, title, description, occasion, delivery_date, total_price, status)
         values ($1, $2, $3, $4, $5, $6, $7) returning ${fields}`,
        [data.customer_id, data.title, data.description ?? null, data.occasion ?? null,
          data.delivery_date, data.total_price, data.status ?? "pending"],
      )).rows[0];
    } catch (error) {
      return rethrow(error);
    }
  }
  async update(id: string, data: UpdateOrderDTO): Promise<Order | undefined> {
    const keys = (["customer_id", "title", "description", "occasion", "delivery_date", "total_price", "status"] as const)
      .filter(key => data[key] !== undefined);
    if (!keys.length) throw new AppError(400, "Informe ao menos um campo.");
    try {
      return (await database.query<Order>(
        `update orders set ${keys.map((key, i) => `${key} = $${i + 2}`).join(", ")} where id = $1 returning ${fields}`,
        [id, ...keys.map(key => data[key])],
      )).rows[0];
    } catch (error) {
      return rethrow(error);
    }
  }
  async delete(id: string): Promise<boolean> {
    return (await database.query("delete from orders where id = $1", [id])).rowCount === 1;
  }
}
