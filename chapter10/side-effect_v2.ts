type Lender = string;

class Share {
  constructor(public readonly lender: Lender, public readonly amount: number) {}
}

class SharePie {
  private shares: Map<Lender, number>;

  constructor(shares: Map<Lender, number>) {
    this.shares = shares;
  }

  public static fromList(shares: Share[]): SharePie {
    const map = new Map<Lender, number>();
    shares.forEach((s) => map.set(s.lender, s.amount));
    return new SharePie(map);
  }

  public static fromMap(map: Map<Lender, number>): SharePie {
    return new SharePie(new Map(map));
  }

  public static empty(): SharePie {
    return new SharePie(new Map());
  }

  get total(): number {
    let sum = 0;
    for (const v of this.shares.values()) sum += v;
    return sum;
  }

  prorated(targetAmount: number): SharePie {
    const newMap = new Map<string, number>();
    const total = this.total;

    this.shares.forEach((amount, lender) => {
      newMap.set(lender, (amount / total) * targetAmount);
    });
    return SharePie.fromMap(newMap);
  }

  minus(other: SharePie): SharePie {
    const result = new Map(this.shares);
    // (簡略化のためotherの中身を直接回す想定)
    other["shares"].forEach((deductAmount, lender) => {
      const current = result.get(lender) || 0;
      result.set(lender, current - deductAmount);
    });
    return SharePie.fromMap(result);
  }
}

class Loan {
  private shares: SharePie;

  constructor(initialShares: Share[]) {
    this.shares = SharePie.fromList(initialShares);
  }

  processPayment(amount: number) {
    const paymentPie = this.shares.prorated(amount);

    this.shares = this.shares.minus(paymentPie);
  }
}

const pie = SharePie.fromList([
  new Share("Bank A", 100),
  new Share("Bank B", 200),
]);
