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

// 1. 場所の定義
const chengduFactory = new Location("Chengdu Factory"); // 中国・成都工場
const chengduPort = new Location("Chengdu River Port");
const chongqingPort = new Location("Chongqing Port");
const shanghaiPort = new Location("Shanghai Port");
const osakaPort = new Location("Osaka Port");
const kyotoWarehouse = new Location("Kyoto Warehouse"); // 日本・京都倉庫

// 2. 運行スケジュールの定義 (TransportationLeg: 単なるデータ)
// (A) 成都 -> 重慶 (川下りバージ船)
const bargeData = new TransportationLeg(
  new Voyage("V_BARGE_001"),
  chengduPort,
  chongqingPort,
  new Date("2023-10-01"),
  new Date("2023-10-03")
);

// (B) 重慶 -> 上海 (長江輸送船)
const riverShipData = new TransportationLeg(
  new Voyage("V_RIVER_99"),
  chongqingPort,
  shanghaiPort,
  new Date("2023-10-04"),
  new Date("2023-10-08")
);

// (C) 上海 -> 大阪 (外航船)
const oceanShipData = new TransportationLeg(
  new Voyage("V_PACIFIC_777"),
  shanghaiPort,
  osakaPort,
  new Date("2023-10-10"),
  new Date("2023-10-12")
);

// 3. ルート要素 (Route) の構築

// Step 1: 工場から港へ (トラック)
const truckToPort = new DoorRoute(chengduFactory, chengduPort);

// Step 2: 中国内陸水運セクション (ここが入れ子のコンポジット！)
// 2つの行程 (Leg) を束ねて「内陸ルート」として扱う
const legChengduToChongqing = new Leg(bargeData);
const legChongqingToShanghai = new Leg(riverShipData);

const chinaInlandRoute = new CompositeRoute([
  legChengduToChongqing,
  legChongqingToShanghai,
]);

// Step 3: 国際輸送セクション (Leg)
const oceanLeg = new Leg(oceanShipData);

// Step 4: 日本国内配送 (トラック)
const truckToWarehouse = new DoorRoute(osakaPort, kyotoWarehouse);

// 4. 全体を束ねる巨大なコンポジットルートを作成
// DoorRoute(Leaf), CompositeRoute(Node), Leg(Leaf), DoorRoute(Leaf) が混在
const fullJourney = new CompositeRoute([
  truckToPort, // トラック
  chinaInlandRoute, // ★入れ子のコンポジット (川下り2区間)
  oceanLeg, // 外航船
  truckToWarehouse, // トラック
]);

// --- 実行と検証 ---

console.log("=== 全行程の港湾業務リストを取得 ===");
const allOps = fullJourney.getPortOperations();

allOps.forEach((op, index) => {
  console.log(`${index + 1}. [${op.operationType}] @ ${op.location.name}`);
});
export {};
