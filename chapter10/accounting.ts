// Money	Value Object	100円はどこでも100円。ID不要。	完全イミュータブル。IDなし。
// Entry	Value Object	過去の事実は変わらない。	完全イミュータブル。IDなし（またはDB用にあっても良いが、ドメイン的には値）。
// Account	Entity	「Aさんの口座」と「Bさんの口座」は区別が必要。	IDを持つイミュータブル（Immutable Entity）。
// Asset	Entity	顧客ごとの資産契約はユニーク。	IDを持つイミュータブル（Immutable Entity）。

// 「ID（同一性）は必要だが、可変（Mutable）である必要はない」

// これが、エヴァンスのDDDと関数型プログラミングを融合させる際の最適解です。今のあなたの感覚は、まさにこの「Immutable Entity」に向かっています。素晴らしい進化です

type Money = number;
type IsoDate = string; // "YYYY-MM-DD"

class Entry {
  constructor(public readonly amount: number, public readonly date: string) {}
}

class FeePayment extends Entry {
  constructor(amount: number, date: string) {
    super(-amount, date);
  }
}

class InterestAccrual extends Entry {
  constructor(amount: number, date: string) {
    super(amount, date);
  }
}

class Account {
  constructor(
    public readonly name: string,
    private readonly entries: ReadonlyArray<Entry> = []
  ) {}

  // 副作用なし
  post(entry: Entry): Account {
    const newEntries = [...this.entries, entry];
    return new Account(this.name, newEntries);
  }

  getBalance(): number {
    return this.entries.reduce((sum, entry) => sum + entry.amount, 0);
  }

  getHistory(): ReadonlyArray<Entry> {
    return this.entries;
  }
}

class Asset {
  constructor(
    public readonly feeAccount: Account,
    public readonly interestAccount: Account
  ) {}

  updateFeeAccount(newAccount: Account): Asset {
    return new Asset(newAccount, this.interestAccount);
  }
  updateInterestAccount(newAccount: Account): Asset {
    return new Asset(this.feeAccount, newAccount);
  }
}

class InterestCalculationService {
  // このメソッドは何も書き換えない。計算して「Entry」を返すだけ。
  calculate(asset: Asset, rate: number, date: IsoDate): Entry {
    // ここに複雑な計算ロジックが入る
    // 例: 現在の残高等に基づき計算
    const calculatedAmount = 100; // 仮計算

    // 発生(Accrual)という「事実」を作成して返す
    return new InterestAccrual(calculatedAmount, date);
  }
}

// --- 6. アプリケーション層 / 実行シナリオ ---

// 実行用の関数
function main() {
  console.log("=== 会計システム シミュレーション開始 ===\n");

  // 1. 初期状態の構築
  const initialAsset = new Asset(
    new Account("手数料勘定"),
    new Account("利息勘定")
  );

  console.log(`初期残高: 利息=${initialAsset.interestAccount.getBalance()}`);

  // 2. 利息の計算 (まだ何も記録されない)
  const service = new InterestCalculationService();
  const interestEntry = service.calculate(initialAsset, 0.05, "2023-12-01");

  console.log(`\n計算結果: ${interestEntry.amount} ${interestEntry.amount}円`);
  console.log("※この時点ではまだAssetは更新されていません");

  // 3. 記帳 (状態遷移)
  // 古い interestAccount に entry を post し、新しい account を得る
  const newInterestAccount = initialAsset.interestAccount.post(interestEntry);

  // Asset全体を新しい状態に更新（イミュータブルな更新）
  const assetV1 = initialAsset.updateInterestAccount(newInterestAccount);

  console.log(
    `\n記帳後(V1) 残高: 利息=${assetV1.interestAccount.getBalance()}`
  );

  // 4. 手数料の支払いが発生したとする
  const feeEntry = new FeePayment(500, "2023-12-05");

  // チェーンして書くことも可能
  const assetV2 = assetV1.updateFeeAccount(assetV1.feeAccount.post(feeEntry));

  console.log(
    `\n手数料支払後(V2) 残高: 手数料=${assetV2.feeAccount.getBalance()}`
  );

  // --- 結果の確認 ---
  console.log("\n=== 最終レポート ===");
  console.log("【利息勘定 履歴】");
  assetV2.interestAccount
    .getHistory()
    .forEach((e) => console.log(` - ${e.date}: ${e.amount} (${e.amount})`));

  console.log("【手数料勘定 履歴】");
  assetV2.feeAccount
    .getHistory()
    .forEach((e) => console.log(` - ${e.date}: ${e.amount} (${e.amount})`));

  console.log("\n=== 過去へのタイムトラベル（不変性のメリット） ===");
  // assetV1（手数料支払い前）はそのまま残っている
  console.log(`過去(V1)の利息残高: ${assetV1.interestAccount.getBalance()}`); // 正しく残っている
  console.log(`過去(V1)の手数料残高: ${assetV1.feeAccount.getBalance()}`); // 0のまま
}

main();
