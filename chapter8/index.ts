type CompanyId = string;

class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = "USD"
  ) {}
  add(other: Money): Money {
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(ratio: number): Money {
    return new Money(this.amount * ratio, this.currency);
  }
}

class Share {
  constructor(
    public readonly owner: CompanyId,
    public readonly ratio: number // 0.0 ~1.0
  ) {}
}

// 複数のshareを束ねるValue Object
class SharePie {
  private readonly shares: Share[];
  constructor(shares: Share[]) {
    const totalRatio = shares.reduce((sum, s) => sum + s.ratio, 0);

    if (Math.abs(totalRatio - 1.0) > 0.0001) {
      throw new Error("Share must sum up to 100%");
    }
    this.shares = shares;
  }

  prorate(totalAmount: Money): Map<CompanyId, Money> {
    const distribution = new Map<CompanyId, Money>();

    for (const share of this.shares) {
      distribution.set(share.owner, totalAmount.multiply(share.ratio));
    }

    return distribution;
  }

  transfer(from: CompanyId, to: CompanyId, amount: number): SharePie {
    // 譲渡ロジック
    // 今回はスキップ
    return new SharePie([]);
  }
}

class Facility {
  constructor(public readonly limit: Money, public sharePie: SharePie) {}

  getLenderCommitments(): Map<CompanyId, Money> {
    return this.sharePie.prorate(this.limit);
  }

  updateShares(newPie: SharePie): void {
    this.sharePie = newPie;
  }
}

class Loan {
  constructor(public readonly amount: Money, public sharePie: SharePie) {}

  static createFromFacility(amount: Money, facility: Facility): Loan {
    return new Loan(amount, facility.sharePie);
  }

  getLenderDistributions(): Map<CompanyId, Money> {
    return this.sharePie.prorate(this.amount);
  }
}
