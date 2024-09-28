import { beforeEach, describe, expect, it } from "vitest";
import Context, { BuyPrice, SellPrice } from "./context";
import DateSequence from "./dateSequence";
import Stock from "./stock";

describe("Context", () => {
  let context: Context;

  beforeEach(() => {
    const mockStockData = {
      "1101": [
        {
          o: 50,
          l: 49,
          h: 51,
          c: 50.5,
          v: 10000,
          t: 20200729,
        },
        {
          o: 50.5,
          l: 50,
          h: 51.5,
          c: 51,
          v: 12000,
          t: 20200730,
        },
        {
          o: 50.5,
          l: 50,
          h: 51.5,
          c: 51,
          v: 12000,
          t: 20200731,
        },
        {
          o: 50.5,
          l: 50,
          h: 51.5,
          c: 51,
          v: 12000,
          t: 20200801,
        },
      ],
      "2330": [
        {
          o: 45.2,
          l: 44.95,
          h: 45.4,
          c: 45.35,
          v: 10001,
          t: 20200729,
        },
        {
          o: 45.5,
          l: 45.2,
          h: 45.8,
          c: 45.6,
          v: 11000,
          t: 20200730,
        },
        {
          o: 45.5,
          l: 45.2,
          h: 45.8,
          c: 45.6,
          v: 11000,
          t: 20200731,
        },
        {
          o: 45.5,
          l: 45.2,
          h: 45.8,
          c: 45.6,
          v: 11000,
          t: 20200801,
        },
      ],
    };
    const dateSequence = new DateSequence({
      data: [20200729, 20200730, 20200731, 20200801],
    });
    const stocks = Object.entries(mockStockData).reduce((acc, [id, data]) => {
      acc[id] = new Stock({ data, dateSequence, id, name: id + "test" });
      return acc;
    }, {} as { [id: string]: Stock });

    context = new Context({
      stocks,
      dateSequence,
      buyMethod: () => ({
        status: true,
        detail: "test",
      }),
      sellMethod: () => ({
        status: true,
        detail: "test",
      }),
      options: {
        capital: 10000000,
        hightStockPrice: 600,
        hightLoss: 0.05,

        buyPrice: BuyPrice.OPEN,
        sellPrice: SellPrice.CLOSE,
      },
    });
  });

  it("初始化正確", () => {
    expect(context.capital).toBe(10000000);
    expect(context.hightStockPrice).toBe(600);
    expect(context.hightLoss).toBe(0.05);
    expect(context.buyPrice).toBe(BuyPrice.OPEN);
    expect(context.sellPrice).toBe(SellPrice.CLOSE);
  });

  it("買入股票", () => {
    context.run();
    expect(context.dateSequence.currentDate).toBe(20200729);
    expect(context.record.getWaitPurchasedStockId("1101")).toBeTruthy();
    expect(context.record.getWaitPurchasedStockId("2330")).toBeTruthy();
    context.buy();
    expect(context.record.getInventoryStockId("1101")).toBeTruthy();
    expect(context.record.getInventoryStockId("2330")).toBeTruthy();
    expect(context.capital).toBeLessThan(10000000);
    expect(context.unSoldProfit).toBe(0);
  });

  it("賣出股票", () => {
    // 先買入股票
    context.run();
    expect(context.dateSequence.currentDate).toBe(20200729);
    expect(context.stocks["1101"].currentData?.t).toBe(20200729);
    expect(context.record.getWaitPurchasedStockId("1101")).toBeTruthy();
    expect(context.record.getWaitPurchasedStockId("2330")).toBeTruthy();
    context.buy();
    expect(context.record.getInventoryStockId("1101")).toBeTruthy();
    expect(context.record.getInventoryStockId("2330")).toBeTruthy();
    context.run();
    expect(context.dateSequence.currentDate).toBe(20200730);
    expect(context.record.getWaitSaleStockId("1101")).toBeTruthy();
    expect(context.record.getWaitSaleStockId("2330")).toBeTruthy();
    context.sell();
    expect(context.record.getInventoryStockId("1101")).toBeFalsy();
    expect(context.record.getInventoryStockId("2330")).toBeFalsy();
  });

  it("計算未實現損益", () => {
    context.run();
    context.run();
    context.run();
    expect(context.unSoldProfit).toBe(890);
  });

  it("運行整個流程", () => {
    context.run();
    expect(context.record.getWaitPurchasedStockId("1101")).toBeTruthy();
    expect(context.record.getWaitPurchasedStockId("2330")).toBeTruthy();
    context.run();
    expect(context.record.getInventoryStockId("1101")).toBeTruthy();
    expect(context.record.getInventoryStockId("2330")).toBeTruthy();
    context.run();
    expect(context.record.getWaitSaleStockId("1101")).toBeTruthy();
    expect(context.record.getWaitSaleStockId("2330")).toBeTruthy();
    context.run();
    expect(context.record.getInventoryStockId("1101")).toBeFalsy();
    expect(context.record.getInventoryStockId("2330")).toBeFalsy();
    expect(context.unSoldProfit).toBe(0);
    expect(context.record.profit).toBe(890);
  });

  it("绑定新股票", () => {
    const newStockData = [
      {
        o: 100,
        l: 98,
        h: 102,
        c: 101,
        v: 20000,
        t: 20200729,
      },
      {
        o: 101,
        l: 99,
        h: 103,
        c: 102,
        v: 22000,
        t: 20200730,
      },
      {
        o: 101,
        l: 99,
        h: 103,
        c: 102,
        v: 22000,
        t: 20200731,
      },
    ];
    context.run();
    expect(context.dateSequence.currentDate).toBe(20200729);
    expect(context.stocks["1101"].currentData?.t).toBe(20200729);

    context.bind("3008", "大立光", newStockData);
    expect(context.stocks["3008"]).toBeDefined();
    expect(context.stocks["3008"].id).toBe("3008");
    expect(context.stocks["3008"].name).toBe("大立光");
    expect(context.stocks["3008"].futureData.length).toBe(3);
    expect(context.stocks["3008"].dateSequence).toBe(context.dateSequence);
    expect(context.stocks["3008"].currentData?.t).toBeUndefined();
    context.run();
    expect(context.stocks["3008"].futureData.length).toBe(1);
    expect(context.dateSequence.currentDate).toBe(20200730);
    expect(context.stocks["1101"].currentData?.t).toBe(20200730);
    expect(context.stocks["3008"].currentData?.t).toBe(20200730);
  });
});
