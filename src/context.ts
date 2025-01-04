import _ from "lodash";
import DateSequence from "./dateSequence";
import Market from "./market";
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
  handlingFeeRebate?: number;
  limitHandlingFee?: number;
  capital?: number;
  hightStockPrice?: number;
  lowStockPrice?: number;
  hightLoss?: number;
  finalizePendingPurchases?: [string | number, string | number][];
  finalizePendingSales?: [string | number, string | number][];
  marketSentiment?: (data: StockListType) => boolean;
  buyPrice?: BuyPrice;
  sellPrice?: SellPrice;
  market?: Market;
};
export default class Context {
  dateSequence: DateSequence; // 日期模組
  transaction: Transaction; // 交易模組
  record: Record; // 紀錄模組
  stocks: { [id: string]: Stock }; // 股票模組列表
  market?: Market; // 市場模組
  capital: number; // 本金
  copy_capital: number; // 紀錄預設本金
  hightLoss?: number; // 虧損上限
  unSoldProfit: number; // 未實現損益
  hightStockPrice?: number; // 買入股價上限
  lowStockPrice?: number; // 買入股價上限
  buyMethod: (data: StockListType) => LogicResType; // 納入買入清單方法
  sellMethod: (data: StockListType) => LogicResType; // 納入賣出清單方法
  buyPrice: BuyPrice; // 買入價格位置
  sellPrice: SellPrice; // 賣出價格位置
  finalizePendingPurchases: [string | number, string | number][]; // 符合待購清單購買條件(A>B)
  finalizePendingSales: [string | number, string | number][]; // 賣出清單檢查方法(A<B)
  marketSentiment?: (data: StockListType) => boolean; // 市場情緒判斷方法

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
    this.copy_capital = this.capital;
    this.hightStockPrice = options?.hightStockPrice;
    this.lowStockPrice = options?.lowStockPrice;
    this.hightLoss = options?.hightLoss; // 0.1 = 10%
    this.buyPrice = options?.buyPrice || BuyPrice.OPEN;
    this.sellPrice = options?.sellPrice || SellPrice.LOW;
    this.sellMethod = sellMethod;
    this.buyMethod = buyMethod;
    this.finalizePendingPurchases = options?.finalizePendingPurchases || [];
    this.finalizePendingSales = options?.finalizePendingSales || [];
    this.marketSentiment = options?.marketSentiment;
    this.market = options?.market;

    this.transaction = new Transaction({
      handlingFeeRebate: options?.handlingFeeRebate,
      limitHandlingFee: options?.limitHandlingFee,
    });
    this.record = new Record();
    this.dateSequence = dateSequence;
    this.dateSequence.attach(this);
  }

  init() {
    this.capital = this.copy_capital;
    this.unSoldProfit = 0;
    this.record.init();
    this.dateSequence.init();
    Object.values(this.stocks).forEach((stock: Stock) => {
      stock.init();
    });
    this.market?.init();
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
    if (
      this.market !== undefined &&
      this.marketSentiment !== undefined &&
      this.marketSentiment(this.market.historyData) === false
    )
      return;

    const stocks = _.shuffle(Object.values(this.stocks));
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      // 在庫存中 跳過
      if (this.record.getInventoryStockId(stock.id)) continue;
      // 如果currentData不存在 跳過
      if (stock.currentData === undefined) continue;
      // 如果高過或低於股價設定區間 跳過
      if (
        (this.hightStockPrice && stock.currentData.l > this.hightStockPrice) ||
        (this.lowStockPrice && stock.currentData.l < this.lowStockPrice)
      )
        continue;

      // 買入價格
      const buyPrice = this.transaction.getBuyPrice(
        stock.currentData[this.buyPrice]
      );

      // 如果最高價超過資金上限 跳過
      if (buyPrice > this.capital) continue;

      // 如果收盤價漲停 跳過
      if (
        stock.historyData.length > 1 &&
        stock.historyData[stock.historyData.length - 1].c >
          stock.historyData[stock.historyData.length - 2].c &&
        Math.abs(
          ((stock.historyData[stock.historyData.length - 1].c -
            stock.historyData[stock.historyData.length - 2].c) /
            stock.historyData[stock.historyData.length - 2].c) *
            100
        ) > 9.5
      )
        continue;

      // 在待購清單內 買入
      if (this.record.getWaitPurchasedStockId(stock.id)) {
        // 驗證指定的待購清單檢查方法
        if (this.finalizePendingPurchases.length > 0) {
          try {
            const checkIndex = this.record.waitPurchased[stock.id].index;
            const indexs = this.finalizePendingPurchases
              .map((_, index) => checkIndex + index + 1)
              .filter((index) => stock.historyData.length > index);
            const res = indexs.every((number, index) => {
              const A = this.finalizePendingPurchases[index][0];
              const B = this.finalizePendingPurchases[index][1];
              if (
                typeof A === "string" &&
                typeof B === "string" &&
                <number>stock.historyData[number][A] >
                  <number>stock.historyData[number][B]
              )
                return true;
              else if (typeof A === "number" && typeof B === "number" && A > B)
                return true;
              else if (
                typeof A === "string" &&
                typeof B === "number" &&
                <number>stock.historyData[number][A] > B
              )
                return true;
              else if (
                typeof A === "number" &&
                typeof B === "string" &&
                A > <number>stock.historyData[number][B]
              )
                return true;
              else return false;
            });
            if (res && indexs.length === this.finalizePendingPurchases.length) {
              this.record.save(stock.id, stock.currentData, buyPrice);
              this.capital -= buyPrice; // 扣錢
            } else if (!res) {
              this.record.removeWaitPurchased(stock.id);
            }
          } catch (error) {
            console.log("error:", stock.id, error);
          }
          continue;
        }
        this.record.save(stock.id, stock.currentData, buyPrice);
        this.capital -= buyPrice; // 扣錢
        continue;
      }

      // 達到買入條件加入待購清單
      const res = this.buyMethod(stock.historyData);
      if (res.status) {
        this.record.saveWaitPurchased(stock.id, {
          detail: res.detail,
          method: "buyMethod",
          index: stock.historyData.length - 1,
        });
      }
    }
  }

  sell() {
    const stocks = _.shuffle(Object.values(this.stocks));
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

      // 在待售清單內 買入
      if (this.record.getWaitSaleStockId(stock.id)) {
        // 驗證指定的待售清單檢查方法
        if (this.finalizePendingSales.length > 0) {
          try {
            const checkIndex = this.record.waitSale[stock.id].index;
            const indexs = this.finalizePendingSales
              .map((_, index) => checkIndex + index + 1)
              .filter((index) => stock.historyData.length > index);
            const res = indexs.every((number, index) => {
              const A = this.finalizePendingSales[index][0];
              const B = this.finalizePendingSales[index][1];
              if (
                typeof A === "string" &&
                typeof B === "string" &&
                <number>stock.historyData[number][A] <
                  <number>stock.historyData[number][B]
              )
                return true;
              else if (typeof A === "number" && typeof B === "number" && A < B)
                return true;
              else if (
                typeof A === "string" &&
                typeof B === "number" &&
                <number>stock.historyData[number][A] < B
              )
                return true;
              else if (
                typeof A === "number" &&
                typeof B === "string" &&
                <number>stock.historyData[number][B] > A
              )
                return true;
              else return false;
            });
            if (res && indexs.length === this.finalizePendingSales.length) {
              this.record.remove(
                stock.id,
                stock.name,
                stock.currentData,
                sellPrice
              );
              this.capital += sellPrice;
            } else if (!res) {
              this.record.removeWaitSale(stock.id);
            }
            continue;
          } catch (error) {
            console.log("error:", stock.id, error);
          }
        }
        this.record.remove(stock.id, stock.name, stock.currentData, sellPrice);
        this.capital += sellPrice;
        continue;
      }

      // 如果最低價跌停加入待售清單 (損失規避心理)
      if (
        stock.historyData.length > 1 &&
        stock.historyData[stock.historyData.length - 1].l <
          stock.historyData[stock.historyData.length - 2].c &&
        Math.abs(
          ((stock.historyData[stock.historyData.length - 2].c -
            stock.historyData[stock.historyData.length - 1].l) /
            stock.historyData[stock.historyData.length - 1].l) *
            100
        ) > 9.5
      ) {
        this.record.saveWaitSale(stock.id, {
          detail: "最低價跌停",
          method: "limit down",
          index: stock.historyData.length - 1,
        });
        continue;
      }

      // 超過設定虧損加入待售清單
      const buyData = this.record.getInventoryStockIdData(stock.id);
      if (
        this.hightLoss &&
        buyData.buyPrice - buyData.buyPrice * this.hightLoss >
          1000 * stock.currentData.l
      ) {
        this.record.saveWaitSale(stock.id, {
          detail: "超過設定虧損",
          method: "hight loss",
          index: stock.historyData.length - 1,
        });
        continue;
      }

      // 達到賣出條件加入待售清單
      const res = this.sellMethod(stock.historyData);
      if (res.status && buyData.t !== stock.currentData.t) {
        this.record.saveWaitSale(stock.id, {
          detail: res.detail,
          method: "sellMethod",
          index: stock.historyData.length - 1,
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

  // 添加新的方法来更新options
  updateOptions(newOptions: Partial<Options>) {
    // 更新资本
    if (newOptions.capital !== undefined) {
      this.capital = newOptions.capital;
    }

    // 更新最高亏损
    if (newOptions.hightLoss !== undefined) {
      this.hightLoss = newOptions.hightLoss;
    }

    // 更新股价上限
    if (newOptions.hightStockPrice !== undefined) {
      this.hightStockPrice = newOptions.hightStockPrice;
    }

    // 更新股价下限
    if (newOptions.lowStockPrice !== undefined) {
      this.lowStockPrice = newOptions.lowStockPrice;
    }

    // 更新买入价格
    if (newOptions.buyPrice !== undefined) {
      this.buyPrice = newOptions.buyPrice;
    }

    // 更新卖出价格
    if (newOptions.sellPrice !== undefined) {
      this.sellPrice = newOptions.sellPrice;
    }

    // 更新买入清单检查方法
    if (newOptions.finalizePendingPurchases !== undefined) {
      this.finalizePendingPurchases = newOptions.finalizePendingPurchases;
    }

    // 更新卖出清单检查方法
    if (newOptions.finalizePendingSales !== undefined) {
      this.finalizePendingSales = newOptions.finalizePendingSales;
    }

    // 更新市场情绪判断方法
    if (newOptions.marketSentiment !== undefined) {
      this.marketSentiment = newOptions.marketSentiment;
    }

    // 更新市场模块
    if (newOptions.market !== undefined) {
      this.market = newOptions.market;
    }
  }
}
