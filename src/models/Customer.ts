export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: Date;
  updated_at: Date;
}
export type CreateCustomerDTO = Pick<Customer, "name" | "phone"> & { email?: string | null };
export type UpdateCustomerDTO = Partial<CreateCustomerDTO>;
