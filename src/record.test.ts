import type { StockType } from "@ch20026103/anysis/dist/esm/stockSkills/types";
import Record from "./record";

describe("Record", () => {
  let record: Record;
  let buyStockData: StockType;
  let sellStockData: StockType;
  beforeEach(() => {
    record = new Record();
    buyStockData = {
      id: "1",
      name: "Test Stock",
      c: 100,
      h: 110,
      l: 90,
      o: 95,
      t: 0,
      v: 0,
    };
    sellStockData = {
      id: "1",
      name: "Test Stock",
      c: 125,
      h: 130,
      l: 120,
      o: 121,
      t: 0,
      v: 0,
    };
  });

  test("初始化", () => {
    expect(record.win).toBe(0);
    expect(record.lose).toBe(0);
    expect(record.profit).toBe(0);
    expect(record.inventory).toEqual({});
    expect(record.history).toEqual([]);
    expect(record.waitPurchased).toEqual({});
    expect(record.waitSale).toEqual({});
  });

  test("save 方法", () => {
    record.saveWaitPurchased("1", {
      detail: "Test Detail",
      method: "Test Method",
    });
    record.save("1", buyStockData, 90);

    expect(record.inventory["1"]).toEqual({
      ...buyStockData,
      detail: "Test Detail",
      method: "Test Method",
      buyPrice: 90,
    });
    expect(record.waitPurchased["1"]).toBeUndefined();
  });

  test("remove 方法", () => {
    record.saveWaitPurchased("1", {
      detail: "Buy Detail",
      method: "Buy Method",
    });
    record.save("1", buyStockData, 100);
    record.saveWaitSale("1", { detail: "Sell Detail", method: "Sell Method" });
    record.remove("1", sellStockData, 120);

    expect(record.inventory["1"]).toBeUndefined();
    expect(record.waitSale["1"]).toBeUndefined();
    expect(record.win).toBe(1);
    expect(record.profit).toBe(20);
    expect(record.history.length).toBe(1);
    expect(record.history[0]).toEqual({
      buy: {
        ...buyStockData,
        detail: "Buy Detail",
        method: "Buy Method",
        buyPrice: 100,
      },
      sell: {
        ...sellStockData,
        detail: "Sell Detail",
        method: "Sell Method",
        sellPrice: 120,
      },
    });
  });

  test("getInventoryStockId 方法", () => {
    record.save("1", buyStockData, 90);
    expect(record.getInventoryStockId("1")).toBe(true);
    expect(record.getInventoryStockId("2")).toBe(false);
  });

  test("getInventoryStockIdData 方法", () => {
    record.save("1", buyStockData, 90);
    expect(record.getInventoryStockIdData("1")).toEqual({
      ...buyStockData,
      buyPrice: 90,
    });
  });

  test("getWaitSaleStockId 方法", () => {
    record.saveWaitSale("1", { detail: "Test Detail", method: "Test Method" });
    expect(record.getWaitSaleStockId("1")).toBe(true);
    expect(record.getWaitSaleStockId("2")).toBe(false);
  });

  test("getWaitPurchasedStockId 方法", () => {
    record.saveWaitPurchased("1", {
      detail: "Test Detail",
      method: "Test Method",
    });
    expect(record.getWaitPurchasedStockId("1")).toBe(true);
    expect(record.getWaitPurchasedStockId("2")).toBe(false);
  });
});
