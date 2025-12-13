// --- src/subdomains/customer/Customer.ts ---
export class Customer {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly address: string
  ) {}
}
