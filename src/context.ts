import Record from "./record";
import DateSequence from "./dateSequence";
import Transaction from "./transaction";
import type { Data, LogicResType } from "./types";
import buyLogic from "./logic/buy";
import sellLogic from "./logic/sell";

type Options = {
  startDate?: number;
  endDate?: number;
  handlingFeeRebate?: number;
  limitHandlingFee?: number;
  capital?: number;
  hightStockPrice?: number;
  hightLoss?: number;
  sellMethod?: string;
  buyMethod?: string;
  customBuyMethod?: (data: Data[]) => LogicResType;
  customSellMethod?: (data: Data[]) => LogicResType;
};
export default class Context {
  // type
  dateSequence: DateSequence;
  transaction: Transaction;
  record: Record;
  stockIds: string[];
  capital: number;
  hightLoss: number;
  unSoldProfit: number;
  buyMethod: string;
  sellMethod: string;
  hightStockPrice?: number;
  customBuyMethod?: (data: Data[]) => LogicResType;
  customSellMethod?: (data: Data[]) => LogicResType;

  constructor(data: { [stockId: string]: Data[] }, options: Options) {
    this.stockIds = Object.keys(data);
    this.unSoldProfit = 0;
    this.capital = options?.capital ? options.capital : 300000;
    this.hightStockPrice = options?.hightStockPrice;
    this.customBuyMethod = options?.customBuyMethod;
    this.customSellMethod = options?.customSellMethod;
    this.hightLoss = options?.hightLoss ? options.hightLoss : 0.1;
    this.sellMethod = options?.sellMethod
      ? options.sellMethod
      : options?.customSellMethod
      ? "customSellMethod"
      : "Default";
    this.buyMethod = options?.buyMethod
      ? options.buyMethod
      : options?.customBuyMethod
      ? "customBuyMethod"
      : "Default";

    this.transaction = new Transaction({
      handlingFeeRebate: options?.handlingFeeRebate,
      limitHandlingFee: options?.limitHandlingFee,
    });
    this.record = new Record();
    this.dateSequence = new DateSequence({
      data,
      startDate: options?.startDate,
      endDate: options?.endDate,
    });
    this.dateSequence.attach(this);
  }

  buy() {
    for (let i = 0; i < this.stockIds.length; i++) {
      const stockId = this.stockIds[i];
      // 在庫存中 跳過
      if (this.record.getInventoryStockId(stockId)) continue;

      const historyData = this.dateSequence.getHistoryData(stockId);
      const buyData = historyData[historyData.length - 1];
      const buyOpenPrice = this.transaction.getBuyPrice(buyData.o);
      // 在待購清單內且本金足夠 買入
      if (
        this.record.getWaitPurchasedStockId(stockId) &&
        this.capital - buyOpenPrice > 0
      ) {
        this.record.save(stockId, buyData, buyOpenPrice);
        this.capital -= buyOpenPrice; // 扣錢
        continue;
      }

      // 達到買入條件加入待購清單
      const res = this.customBuyMethod
        ? this.customBuyMethod(historyData)
        : buyLogic(historyData, this.buyMethod);
      if (res.status) {
        this.record.saveWaitPurchased(stockId, {
          detail: res.detail,
          method: this.buyMethod,
        });
      }
    }
  }

  sell() {
    for (let i = 0; i < this.stockIds.length; i++) {
      const stockId = this.stockIds[i];
      // 如果不在庫存 跳過
      if (!this.record.getInventoryStockId(stockId)) continue;
      // 在待售清單內 賣出
      else if (this.record.getWaitSaleStockId(stockId)) {
        const historyData = this.dateSequence.getHistoryData(stockId);
        const sellData = historyData[historyData.length - 1];
        const sellLowPrice = this.transaction.getSellPrice(sellData.l);
        this.record.remove(stockId, sellData, sellLowPrice);
        this.capital += sellLowPrice;
        continue;
      }

      const historyData = this.dateSequence.getHistoryData(stockId);
      const sellData = historyData[historyData.length - 1];
      const buyData = this.record.getInventoryStockIdData(stockId);

      // 超過設定虧損加入待售清單
      if (
        buyData.buyPrice - buyData.buyPrice * this.hightLoss >
        1000 * sellData.l
      ) {
        this.record.saveWaitSale(stockId, {
          detail: "exceeding the loss limit",
          method: this.sellMethod,
        });
        continue;
      }

      // 達到賣出條件加入待售清單
      const res = this.customSellMethod
        ? this.customSellMethod(historyData)
        : sellLogic(historyData, this.sellMethod);
      if (res.status && buyData.t !== sellData.t) {
        this.record.saveWaitSale(stockId, {
          detail: res.detail,
          method: this.sellMethod,
        });
      }
    }
  }

  update() {
    console.log(this.dateSequence.currentDate);
    this.buy();
    this.sell();
    this.calcUnSoldProfit();
  }

  run() {
    this.dateSequence.setNext();
  }

  calcUnSoldProfit() {
    this.unSoldProfit = 0;
    const stockIds = Object.keys(this.record.inventory);
    for (let i = 0; i < stockIds.length; i++) {
      const stockId = stockIds[i];
      const historyData = this.dateSequence.getHistoryData(stockId);
      const nowData = historyData[historyData.length - 1];
      const sellNowPrice = this.transaction.getSellPrice(nowData.l);
      const buyData = this.record.getInventoryStockIdData(stockId);
      this.unSoldProfit += sellNowPrice - buyData.buyPrice;
    }
  }

  // WIP
  pretreatment() {
    return true;
  }
}
