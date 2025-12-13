import { Money } from "../../generic/money/Money";

export class Invoice {
  constructor(
    public readonly invoiceId: string,
    public readonly customerId: string,
    public readonly amount: Money,
    public readonly date: Date
  ) {}
}
