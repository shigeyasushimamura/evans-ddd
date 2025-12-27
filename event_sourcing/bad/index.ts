class Item {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number
  ) {}
}

class ShoppingCart {
  private items: Item[] = [];
  addItemToCart(item: Item): void {
    this.items.push(item);
  }

  calculateTotalPrice(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}

// 実行例
const cart = new ShoppingCart();
cart.addItemToCart(new Item("A", "コーヒー", 100));
cart.addItemToCart(new Item("B", "紅茶", 200));

console.log(cart.calculateTotalPrice()); // 300

export {};
