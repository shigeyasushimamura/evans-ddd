import { Delivery } from "../../core/model/delivery/Delivery";
import { Money } from "../../generic/money/Money";
import { Invoice } from "./Invoice";

// 価格決定モデル (Pricing Model)
// 配送データを受け取って、請求額を計算する
export class PricingService {
  public generateInvoice(delivery: Delivery): Invoice {
    if (!delivery.isComplete()) {
      throw new Error("配送が完了していないため請求できません");
    }

    // ビジネスルール:
    // 基本料金 $10 + (重さ * $2) + (宣言価値の1%を保険料として加算)

    const baseRate = 10;
    const weightCharge = delivery.cargo.weightKg * 2;
    const insuranceCharge = delivery.cargo.declaredValue.amount * 0.01;

    const totalAmount = new Money(
      baseRate + weightCharge + insuranceCharge,
      "USD"
    );

    // 請求書の生成
    console.log("Billing: 請求計算を実行...");
    return new Invoice(
      `INV-${Date.now()}`,
      delivery.customerId,
      totalAmount,
      new Date()
    );
  }
}
