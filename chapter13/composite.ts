class Location {
  constructor(public readonly name: string) {}
}

class PortOperation {
  constructor(
    public readonly location: Location,
    public readonly operationType: "LOAD" | "UNLOAD"
  ) {}
}

abstract class Route {
  abstract getPortOperations(): PortOperation[];
}

class CompositeRoute extends Route {
  private components: Route[] = [];
  constructor(routes: Route[]) {
    super();
    this.components = routes;
  }

  addRoute(route: Route): Route {
    return new CompositeRoute([...this.components, route]);
  }

  getPortOperations(): PortOperation[] {
    return this.components.flatMap((route) => route.getPortOperations());
  }
}

class Leg extends Route {
  constructor(private readonly transportDetails: TransportationLeg) {
    super();
  }

  getPortOperations(): PortOperation[] {
    return [
      new PortOperation(this.transportDetails.origin, "LOAD"),
      new PortOperation(this.transportDetails.destination, "UNLOAD"),
    ];
  }
  get expectedArrivalTime(): Date {
    return this.transportDetails.arrivalTime;
  }
}

class DoorRoute extends Route {
  constructor(public from: Location, public to: Location) {
    super();
  }

  getPortOperations(): PortOperation[] {
    return [];
  }
}

class Voyage {
  constructor(public readonly voyageNumber: string) {}
}
class TransportationLeg {
  constructor(
    public readonly voyage: Voyage,
    public readonly origin: Location,
    public readonly destination: Location,
    public readonly departureTime: Date,
    public readonly arrivalTime: Date
  ) {}
}

// --- 使用例 ---

const tokyo = new Location("Tokyo Port");
const osaka = new Location("Osaka Port");
const warehouse = new Location("Saitama Warehouse");

// 1. スケジュールとしての「運送行程」を作成 (ただのデータ)
const transLegData = new TransportationLeg(
  new Voyage("V101"),
  tokyo,
  osaka,
  new Date("2023-10-01"),
  new Date("2023-10-02")
);

const shipLeg = new Leg(transLegData);
const truckLeg = new DoorRoute(warehouse, tokyo);

const route = new CompositeRoute([truckLeg, shipLeg]);

console.log(route.getPortOperations());

export {};
