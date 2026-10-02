import { database } from "../config/database";
import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from "../models/Customer";
import { AppError } from "../errors/AppError";

export class CustomerRepository {
  async findAll(): Promise<Customer[]> {
    return (await database.query<Customer>("select * from customers order by created_at, id")).rows;
  }
  async findById(id: string): Promise<Customer | undefined> {
    return (await database.query<Customer>("select * from customers where id = $1", [id])).rows[0];
  }
  async create(data: CreateCustomerDTO): Promise<Customer> {
    return (await database.query<Customer>(
      "insert into customers (name, phone, email) values ($1, $2, $3) returning *",
      [data.name, data.phone, data.email ?? null],
    )).rows[0];
  }
  async update(id: string, data: UpdateCustomerDTO): Promise<Customer | undefined> {
    // Campos permitidos na atualização
    const keys = (["name", "phone", "email"] as const).filter(key => data[key] !== undefined);
    if (!keys.length) throw new AppError(400, "Informe ao menos um campo.");
    return (await database.query<Customer>(
      `update customers set ${keys.map((key, i) => `${key} = $${i + 2}`).join(", ")} where id = $1 returning *`,
      [id, ...keys.map(key => data[key])],
    )).rows[0];
  }
  async hasOrders(id: string): Promise<boolean> {
    const result = await database.query<{ exists: boolean }>("select exists(select 1 from orders where customer_id = $1)", [id]);
    return result.rows[0].exists;
  }
  async delete(id: string): Promise<boolean> {
    try {
      return (await database.query("delete from customers where id = $1", [id])).rowCount === 1;
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "23503") {
        throw new AppError(409, "Não é possível excluir um cliente que possui encomendas.");
      }
      throw error;
    }
  }
}
