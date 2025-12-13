import { CustomerId } from "../shared/Types";
import { RouteSpecification } from "./RouteSpecification";
import { Itinerary } from "./Itinerary";
import { RoutingService } from "../../service/RoutingService";
import { Cargo } from "../cargo/Cargo";

export class Delivery {
  private itinerary: Itinerary | null = null;
  constructor(
    public readonly id: string, // Delivery ID
    public readonly customerId: string,
    public readonly spec: RouteSpecification,
    public readonly cargo: Cargo // 荷物情報を持つ
  ) {}

  public assignRoute(routingService: RoutingService): void {
    // 外部の複雑な実装を使って、結果だけを受け取る
    const newItinerary = routingService.findBestRoute(this.spec);

    // コアのルールで検証する
    if (!this.spec.isSatisfiedBy(newItinerary)) {
      throw new Error("この経路は仕様を満たしていません");
    }

    this.itinerary = newItinerary;
    console.log("Delivery: 経路が割り当てられました");
  }

  // 配送完了ステータスなどを返すメソッドがある想定
  isComplete(): boolean {
    return !!this.itinerary;
  }
}
