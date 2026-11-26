import { database } from "../config/database";
import { CustomerRepository } from "./CustomerRepository";
import { OrderRepository } from "./OrderRepository";
import { PaymentRepository } from "./PaymentRepository";

export interface Repositories {
  customers: CustomerRepository;
  orders: OrderRepository;
  payments: PaymentRepository;
}
export class Transaction {
  async run<T>(work: (repositories: Repositories) => Promise<T>): Promise<T> {
    const client = await database.connect();
    try {
      await client.query("BEGIN");
      const result = await work({
        customers: new CustomerRepository(client),
        orders: new OrderRepository(client),
        payments: new PaymentRepository(client),
      });
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
