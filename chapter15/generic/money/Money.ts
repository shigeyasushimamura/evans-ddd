export type Currency = "USD" | "JPY" | "EUR";

export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: Currency
  ) {}

  /**
   * 加算ロジック
   */
  add(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new Error("異なる通貨の加算は出来ません");
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  toString(): string {
    return `${this.currency} ${this.amount}`;
  }
}
