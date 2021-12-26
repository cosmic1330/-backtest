import type { Data } from "./types";
type InventoryItem = Data & {
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

  save(key: string, value: Data, buyPrice: number) {
    this.inventory[key] = { ...value, ...this.waitPurchased[key], buyPrice };
    // clear
    delete this.waitPurchased[key];
  }

  remove(key: string, value: Data, sellPrice: number) {
    const res = {
      buy: this.inventory[key],
      sell: {
        ...value,
        ...this.waitSale[key],
        sellPrice,
      },
    };
    this.history.push(res);
    // calculate
    const profit = sellPrice - this.inventory[key].buyPrice;
    if (profit > 0) {
      this.win += 1;
      this.profit += profit;
    } else {
      this.lose += 1;
      this.profit += profit;
    }
    // clear
    delete this.inventory[key];
    delete this.waitSale[key];
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
