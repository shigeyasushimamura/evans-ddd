// src/
// ├── generic/               <-- 【汎用サブドメイン】 (金銭など)
// │   └── money/             <-- どの層からも直接使ってOK
// │
// ├── core/                  <-- 【コアドメイン】 (配送)
// │   ├── model/
// │   │   ├── delivery/
// │   │   └── cargo/         <-- 貨物 (ここに金銭が登場するかも)
// │   └── service/
// │
// ├── subdomains/
// │   ├── logistics/         <-- 【物流サブドメイン】 (計算)
// │   ├── customer/          <-- 【顧客サブドメイン】 (管理)
// │   └── billing/           <-- 【請求サブドメイン (支援)】 (★今回追加)
// │
// └── main.ts                <-- アプリケーション層 (全体を指揮する)

// --- src/main.ts ---
import { Money } from "./generic/money/Money";
import { Cargo } from "./core/model/cargo/Cargo";
import { Delivery } from "./core/model/delivery/Delivery";
import { RouteSpecification } from "./core/model/delivery/RouteSpecification";
import { GraphRoutingService } from "./subdomains/logistics/GraphRoutingService";
import { PricingService } from "./subdomains/billing/PricingService";

// 1. セットアップ
const routingService = new GraphRoutingService();
const pricingService = new PricingService();

// 2. データの準備 (金銭は汎用的に使用)
const cargo = new Cargo(
  "cargo-999",
  50, // 50kg
  new Money(1000, "USD") // $1000の価値がある荷物
);

const spec = new RouteSpecification("Tokyo", "Osaka", new Date());
const delivery = new Delivery("del-001", "cust-123", spec, cargo);

// 3. 【コアドメイン】の実行
console.log("--- Phase 1: Core Domain Execution ---");
delivery.assignRoute(routingService);
// ここで物流サブドメインが裏で働き、コアの状態が更新される

// 4. 【請求サブドメイン】の実行
// コアの処理結果を使って、別のコンテキスト(請求)を動かす
console.log("\n--- Phase 2: Billing Subdomain Execution ---");
try {
  const invoice = pricingService.generateInvoice(delivery);
  console.log(
    `請求書発行完了: ID=${invoice.invoiceId}, 金額=${invoice.amount.toString()}`
  );
} catch (e) {
  console.error("請求エラー:", e);
}
