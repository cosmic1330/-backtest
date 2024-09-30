import type { StockType } from "@ch20026103/anysis/dist/esm/stockSkills/types";
type InventoryItem = StockType & {
  detail: string;
  method: string;
  buyPrice: number;
};

type WaitSaleItem = {
  detail: string;
  method: string;
};

type WaitPurchasedItem = WaitSaleItem;
export default class Record {
  win: number;
  lose: number;
  profit: number;
  inventory: { [stockId: string]: InventoryItem };
  history: unknown[];
  waitPurchased: {
    [stockId: string]: WaitPurchasedItem;
  };
  waitSale: {
    [stockId: string]: WaitSaleItem;
  };

  constructor() {
    this.inventory = {};
    this.history = [];
    this.win = 0;
    this.lose = 0;
    this.profit = 0;
    this.waitSale = {};
    this.waitPurchased = {};
  }

  init() {
    this.inventory = {};
    this.history = [];
    this.win = 0;
    this.lose = 0;
    this.profit = 0;
    this.waitSale = {};
    this.waitPurchased = {};
  }

  save(id: string, value: StockType, buyPrice: number) {
    this.inventory[id] = { ...value, ...this.waitPurchased[id], buyPrice };
    // clear
    delete this.waitPurchased[id];
  }

  remove(id: string, value: StockType, sellPrice: number) {
    const res = {
      buy: this.inventory[id],
      sell: {
        ...value,
        ...this.waitSale[id],
        sellPrice,
      },
    };
    this.history.push(res);
    // calculate
    const profit = sellPrice - this.inventory[id].buyPrice;
    if (profit > 0) {
      this.win += 1;
      this.profit += profit;
    } else {
      this.lose += 1;
      this.profit += profit;
    }
    // clear
    delete this.inventory[id];
    delete this.waitSale[id];
  }

  saveWaitPurchased(key: string, value: WaitPurchasedItem) {
    this.waitPurchased[key] = value;
  }

  saveWaitSale(key: string, value: WaitSaleItem) {
    this.waitSale[key] = value;
  }

  getInventoryStockId(stockId: string) {
    const inventories = Object.keys(this.inventory);
    return inventories.includes(stockId);
  }

  getInventoryStockIdData(stockId: string) {
    return this.inventory[stockId];
  }

  getWaitSaleStockId(stockId: string) {
    const waitSales = Object.keys(this.waitSale);
    return waitSales.includes(stockId);
  }

  getWaitPurchasedStockId(stockId: string) {
    const waitPurchaseds = Object.keys(this.waitPurchased);
    return waitPurchaseds.includes(stockId);
  }
}
