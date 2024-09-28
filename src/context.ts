import DateSequence from "./dateSequence";
import Record from "./record";
import Stock from "./stock";

import type { StockListType } from "@ch20026103/anysis/dist/esm/stockSkills/types";
import Transaction from "./transaction";
import type { LogicResType } from "./types";

export enum BuyPrice {
  OPEN = "o",
  CLOSE = "c",
  HIGHT = "h",
  LOW = "l",
}
export enum SellPrice {
  OPEN = "o",
  CLOSE = "c",
  HIGHT = "h",
  LOW = "l",
}

type Options = {
  marketSentiment?: () => boolean;
  handlingFeeRebate?: number;
  limitHandlingFee?: number;
  capital?: number;
  hightStockPrice?: number;
  hightLoss?: number;
  reviewPurchaseListMethod?: (data: StockListType) => boolean;
  reviewSellListMethod?: (data: StockListType) => boolean;
  buyPrice?: BuyPrice;
  sellPrice?: SellPrice;
};
export default class Context {
  // type
  dateSequence: DateSequence; // 日期模組
  transaction: Transaction; // 交易模組
  record: Record; // 紀錄模組
  stocks: { [id: string]: Stock }; // 股票模組列表
  capital: number; // 本金
  hightLoss: number; // 虧損上限
  unSoldProfit: number; // 未實現損益
  hightStockPrice?: number; // 股價上限
  buyMethod: (data: StockListType) => LogicResType; // 買入判斷方法
  sellMethod: (data: StockListType) => LogicResType; // 賣出判斷方法
  buyPrice: BuyPrice; // 買入價格
  sellPrice: SellPrice; // 賣出價格
  reviewPurchaseListMethod: (data: StockListType) => boolean; // 買入清單檢查方法
  reviewSellListMethod: (data: StockListType) => boolean; // 賣出清單檢查方法
  marketSentiment: () => boolean; // 市場情緒

  constructor({
    stocks,
    dateSequence,
    sellMethod,
    buyMethod,
    options,
  }: {
    stocks: { [id: string]: Stock };
    dateSequence: DateSequence;
    sellMethod: (data: StockListType) => LogicResType;
    buyMethod: (data: StockListType) => LogicResType;
    options?: Options;
  }) {
    this.stocks = stocks;
    this.unSoldProfit = 0;
    this.capital = options?.capital ? options.capital : 300000;
    this.hightStockPrice = options?.hightStockPrice;
    this.hightLoss = options?.hightLoss ? options.hightLoss : 0.1;
    this.buyPrice = options?.buyPrice || BuyPrice.OPEN;
    this.sellPrice = options?.sellPrice || SellPrice.LOW;
    this.sellMethod = sellMethod;
    this.buyMethod = buyMethod;
    this.reviewPurchaseListMethod =
      options?.reviewPurchaseListMethod || (() => true);
    this.reviewSellListMethod = options?.reviewSellListMethod || (() => true);
    this.marketSentiment = options?.marketSentiment || (() => true);

    this.transaction = new Transaction({
      handlingFeeRebate: options?.handlingFeeRebate,
      limitHandlingFee: options?.limitHandlingFee,
    });
    this.record = new Record();
    this.dateSequence = dateSequence;
    this.dateSequence.attach(this);
  }

  bind(id: string, name: string, data: StockListType) {
    const stock = new Stock({
      id,
      name,
      data,
      dateSequence: this.dateSequence,
    });
    this.stocks[id] = stock;
  }

  buy() {
    // 市場情緒不好 跳過
    if (!this.marketSentiment()) return;

    const stocks = Object.values(this.stocks);
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      // 在庫存中 跳過
      if (this.record.getInventoryStockId(stock.id)) continue;
      // 如果currentData不存在 跳過
      if (stock.currentData === undefined) continue;
      // 如果最高價超過資金上限 跳過
      if (this.hightStockPrice && stock.currentData.l > this.hightStockPrice)
        continue;

      // 買入價格
      const buyPrice = this.transaction.getBuyPrice(
        stock.currentData[this.buyPrice]
      );
      // 在待購清單內且本金足夠買盤價、符合買入清單檢查方法 買入
      if (
        this.reviewPurchaseListMethod(stock.historyData) &&
        this.record.getWaitPurchasedStockId(stock.id) &&
        this.capital - buyPrice > 0
      ) {
        this.record.save(stock.id, stock.currentData, buyPrice);
        this.capital -= buyPrice; // 扣錢
        continue;
      }

      // 如果最高價超過資金上限 跳過
      if (buyPrice > this.capital) continue;

      // 達到買入條件加入待購清單
      const res = this.buyMethod(stock.historyData);
      if (res.status) {
        this.record.saveWaitPurchased(stock.id, {
          detail: res.detail,
          method: "buyMethod",
        });
      }
    }
  }

  sell() {
    const stocks = Object.values(this.stocks);
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      // 如果不在庫存 跳過
      if (!this.record.getInventoryStockId(stock.id)) continue;
      // 如果currentData不存在 跳過
      if (stock.currentData === undefined) continue;
      // 賣出價格
      const sellPrice = this.transaction.getSellPrice(
        stock.currentData[this.sellPrice]
      );
      // 在待售清單內且符合賣出清單檢查方法 賣出
      if (
        this.reviewSellListMethod(stock.historyData) &&
        this.record.getWaitSaleStockId(stock.id)
      ) {
        this.record.remove(stock.id, stock.currentData, sellPrice);
        this.capital += sellPrice;
        continue;
      }

      // 超過設定虧損加入待售清單
      const buyData = this.record.getInventoryStockIdData(stock.id);
      if (
        buyData.buyPrice - buyData.buyPrice * this.hightLoss >
        1000 * stock.currentData.l
      ) {
        this.record.saveWaitSale(stock.id, {
          detail: "超過設定虧損",
          method: "default",
        });
        continue;
      }

      // 達到賣出條件加入待售清單
      const res = this.sellMethod(stock.historyData);
      if (res.status && buyData.t !== stock.currentData.t) {
        this.record.saveWaitSale(stock.id, {
          detail: res.detail,
          method: "sellMethod",
        });
      }
    }
  }

  update() {
    try {
      this.buy();
      this.sell();
      this.calcUnSoldProfit();
    } catch (error) {
      console.log("update error:", error);
    }
  }

  run() {
    return this.dateSequence.next();
  }

  calcUnSoldProfit() {
    let unSoldProfit = 0;
    const stockIds = Object.keys(this.record.inventory);
    for (let i = 0; i < stockIds.length; i++) {
      const stockId = stockIds[i];
      const currentStock = this.stocks[stockId];
      if (currentStock && currentStock.currentData) {
        const price = currentStock.currentData.c;
        const sellNowPrice = this.transaction.getSellPrice(price);
        const buyData = this.record.getInventoryStockIdData(stockId);
        unSoldProfit += sellNowPrice - buyData.buyPrice;
      }
    }
    this.unSoldProfit = unSoldProfit;
  }
}
