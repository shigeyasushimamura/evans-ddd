type Lender = string;

class Share {
  constructor(public lender: Lender, public outstandingAmount: number) {}

  payment(amount: number): void {
    this.outstandingAmount -= amount;
  }

  getAmount(): number {
    return this.outstandingAmount;
  }
}

class Loan {
  private shares: Map<Lender, Share> = new Map();

  constructor() {
    // サンプルデータの初期化
    this.addShare("Bank A", 10000);
    this.addShare("Bank B", 20000);
    // 合計: 30000
  }

  private addShare(lender: Lender, amount: number) {
    this.shares.set(lender, new Share(lender, amount));
  }

  private getTotalOusstanding(): number {
    let total = 0;
    for (const share of this.shares.values()) {
      total += share.getAmount();
    }
    return total;
  }

  /**
   * 改善点1: 副作用のない関数 (Side-Effect-Free Function)
   * 計算のみを行い、状態を変更せずに「結果のMap」を返す。
   * これにより、このロジック単体でのユニットテストが容易になる。
   */
  private calculatePrincipalPaymentShares(
    paymentAmount: number
  ): Map<Lender, number> {
    const paymentShares = new Map<Lender, number>();
    const totalOutstanding = this.getTotalOusstanding();

    for (const share of this.shares.values()) {
      const shareAmount =
        (share.getAmount() / totalOutstanding) * paymentAmount;
      paymentShares.set(share.lender, shareAmount);
    }

    return paymentShares;
  }

  /**
   * 改善点2: コマンド
   * 副作用有
   */
  public applyPrincipalPaymentShares(paymentShares: Map<Lender, number>): void {
    for (const [lender, amount] of paymentShares) {
      const share = this.shares.get(lender);
      if (share) {
        share.payment(amount);
        console.log(`${lender} applied payment: ${amount.toFixed(2)}`);
      }
    }
  }

  /**
   * クライアントコードの利用
   */
  public processPayment(amount: number): void {
    const distribution = this.calculatePrincipalPaymentShares(amount);
    this.applyPrincipalPaymentShares(distribution);
  }
}

const myLoan = new Loan();
myLoan.processPayment(1500);

// Bank A (10000) -> 500 支払い
// Bank B (20000) -> 1000 支払い

export {};
