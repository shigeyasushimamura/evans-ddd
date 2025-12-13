import { Location } from "../shared/Types";
import { Itinerary } from "./Itinerary";

export class RouteSpecification {
  constructor(
    public readonly origin: Location,
    public readonly destination: Location,
    public readonly deadline: Date
  ) {}

  isSatisfiedBy(itinerary: Itinerary): boolean {
    // スケジュールが期限内かどうかの判定ロジックなど
    return true;
  }
}
