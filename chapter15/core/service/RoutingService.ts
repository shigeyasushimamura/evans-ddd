import { RouteSpecification } from "../model/delivery/RouteSpecification";
import { Itinerary } from "../model/delivery/Itinerary";

export interface RoutingService {
  findBestRoute(spec: RouteSpecification): Itinerary;
}
