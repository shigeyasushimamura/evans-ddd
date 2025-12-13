// --- src/subdomains/customer/CustomerRepository.ts ---
import { Customer } from "./Customer";

export class CustomerRepository {
  getById(id: string): Customer {
    // DBから取得するシミュレーション
    return new Customer(id, "Acme Corp", "Tokyo, Japan");
  }
}
