interface Item {
  id: string;
  name: string;
  price: number;
}

// イベントの定義
type ItemAddedToCart = {
  type: "ItemAddedToCart";
  item: Item;
};

type ItemRemovedFromCart = {
  type: "ItemRemovedFromCart";
  itemId: string;
};

type CartEvent = ItemAddedToCart | ItemRemovedFromCart;

// 集約: イベントから状態を再構築
class Cart {
  private currentTotal = 0;
  private itemPrices = new Map<string, number>();
  private uncommittedEvents: CartEvent[] = [];

  addItem(item: Item): void {
    if (this.itemPrices.has(item.id)) {
      throw new Error("商品は既にカートに存在します");
    }

    const event: ItemAddedToCart = {
      type: "ItemAddedToCart",
      item: item,
    };

    this.uncommittedEvents.push(event);
    this.applyItemAdded(event);
  }

  removeItem(itemId: string): void {
    if (!this.itemPrices.has(itemId)) {
      throw new Error("削除対象の商品が見つかりません");
    }

    const event: ItemRemovedFromCart = {
      type: "ItemRemovedFromCart",
      itemId: itemId,
    };

    this.uncommittedEvents.push(event);
    this.applyItemRemoved(event);
  }

  private applyItemAdded(event: ItemAddedToCart): void {
    this.currentTotal += event.item.price;
    this.itemPrices.set(event.item.id, event.item.price);
  }

  private applyItemRemoved(event: ItemRemovedFromCart): void {
    const price = this.itemPrices.get(event.itemId);
    if (price !== undefined) {
      this.currentTotal -= price;
      this.itemPrices.delete(event.itemId);
    }
  }

  getTotalPrice(): number {
    return this.currentTotal;
  }

  getUncommittedEvents(): ReadonlyArray<CartEvent> {
    return [...this.uncommittedEvents];
  }

  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }

  // イベントから状態を復元（イベントソーシングの核心）
  static fromHistory(events: CartEvent[]): Cart {
    const cart = new Cart();

    for (const event of events) {
      if (event.type === "ItemAddedToCart") {
        cart.applyItemAdded(event);
      } else if (event.type === "ItemRemovedFromCart") {
        cart.applyItemRemoved(event);
      }
    }

    return cart;
  }
}

// 永続化されるイベント
type PersistedCartEvent = CartEvent & {
  eventId: string;
  cartId: string;
  timestamp: Date;
  version: number; // 集約内でのイベントシーケンス番号
};

interface EventStore {
  append(cartId: string, events: PersistedCartEvent[]): Promise<void>;
  getEvents(cartId: string): Promise<CartEvent[]>;
}

class CartRepository {
  constructor(private eventStore: EventStore) {}

  async save(cartId: string, cart: Cart): Promise<void> {
    const domainEvents = cart.getUncommittedEvents();

    const persistedEvents: PersistedCartEvent[] = domainEvents.map(
      (event, index) => ({
        ...event,
        eventId: crypto.randomUUID(),
        cartId: cartId,
        timestamp: new Date(),
        version: index + 1,
      })
    );

    // イベントストアに永続化
    await this.eventStore.append(cartId, persistedEvents);
    cart.markEventsAsCommitted();
  }

  async findById(cartId: string): Promise<Cart | null> {
    // イベントを取得
    const events = await this.eventStore.getEvents(cartId);
    if (events.length === 0) return null;

    // イベントから状態を再構築
    return Cart.fromHistory(events);
  }
}

// 簡易的なデータストア
class InMemoryEventStore implements EventStore {
  private events = new Map<string, PersistedCartEvent[]>();

  async append(cartId: string, events: PersistedCartEvent[]): Promise<void> {
    const existingEvents = this.events.get(cartId) || [];
    this.events.set(cartId, [...existingEvents, ...events]);
  }

  async getEvents(cartId: string): Promise<CartEvent[]> {
    const persistedEvents = this.events.get(cartId) || [];
    return persistedEvents.map(
      ({ eventId, cartId, timestamp, version, ...domainEvent }) => domainEvent
    );
  }

  getAllEvents(cartId: string): PersistedCartEvent[] {
    return this.events.get(cartId) || [];
  }
}

class CartApplicationService {
  constructor(private cartRepository: CartRepository) {}

  async addItemToCart(cartId: string, item: Item): Promise<void> {
    let cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      cart = new Cart();
    }

    cart.addItem(item);
    await this.cartRepository.save(cartId, cart);
  }
}

// 使用例（async関数でラップ）
async function main() {
  const eventStore: EventStore = new InMemoryEventStore();
  const cartRepository = new CartRepository(eventStore);
  const service = new CartApplicationService(cartRepository);

  await service.addItemToCart("cart-1", {
    id: "A",
    name: "コーヒー",
    price: 100,
  });
  await service.addItemToCart("cart-1", { id: "B", name: "紅茶", price: 200 });

  const cart = await cartRepository.findById("cart-1");
  console.log(cart?.getTotalPrice()); // 300

  // イベントストアに保存された履歴
  console.log(await eventStore.getEvents("cart-1"));
  //   [{
  //     type: 'ItemAddedToCart',
  //     item: { id: 'A', name: 'コーヒー', price: 100 }
  //   },
  //   {
  //     type: 'ItemAddedToCart',
  //     item: { id: 'B', name: '紅茶', price: 200 }
  //   }]
}

main().catch(console.error);
