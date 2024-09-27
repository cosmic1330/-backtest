import type { StockListType } from "@ch20026103/anysis/dist/esm/stockSkills/types";
import DateSequence from "./dateSequence";
import Stock from "./stock";

describe("Stock", () => {
  let dateSequence: DateSequence;
  let stockData: StockListType;
  beforeEach(() => {
    dateSequence = new DateSequence({ data: [20230101, 20230102, 20230103] });
    stockData = [
      { t: 20230101, o: 100, h: 110, l: 95, c: 105, v: 1000 },
      { t: 20230102, o: 105, h: 115, l: 100, c: 110, v: 1200 },
      { t: 20230103, o: 110, h: 120, l: 105, c: 115, v: 1100 },
    ];
  });

  test("初始化股票對象", () => {
    const stock = new Stock({
      dateSequence,
      id: "1",
      name: "Test Stock",
      data: stockData,
    });
    expect(stock).toBeDefined();
    expect(stock.futureData).toEqual(stockData);
    expect(stock.historyData).toEqual([]);
    expect(stock.currentData).toBeUndefined();
  });

  test("更新股票數據", () => {
    const stock = new Stock({
      dateSequence,
      id: "1",
      name: "Test Stock",
      data: stockData,
    });

    dateSequence.next();

    expect(stock.historyData.length).toBe(1);
    expect(stock.currentData?.c).toEqual(stock.historyData[0].c);
    expect(stock.futureData.length).toBe(2);

    dateSequence.next();
    expect(stock.historyData.length).toBe(2);
    expect(stock.currentData?.c).toEqual(stock.historyData[1].c);
    expect(stock.futureData.length).toBe(1);
  });

  test("技術指標計算", () => {
    const stock = new Stock({
      dateSequence,
      id: "1",
      name: "Test Stock",
      data: stockData,
    });

    dateSequence.next();

    expect(stock.currentData).toHaveProperty("bollMa");
    expect(stock.currentData).toHaveProperty("ema5");
    expect(stock.currentData).toHaveProperty("rsi5");
    // 添加更多技術指標的檢查
  });

  test("日期不匹配時不更新", () => {
    stockData.shift();
    const stock = new Stock({
      dateSequence,
      id: "1",
      name: "Test Stock",
      data: stockData,
    });

    dateSequence.next();

    expect(stock.historyData.length).toBe(0);
    expect(stock.currentData).toBeUndefined();
    expect(stock.futureData.length).toBe(2);
  });

  test("股票對象日期比較早", () => {
    // 插入一個比較早的日期
    stockData.unshift({ t: 20221231, o: 100, h: 106, l: 96, c: 106, v: 999 });
    stockData.unshift({ t: 20221230, o: 99, h: 110, l: 95, c: 105, v: 1000 });
    const stock = new Stock({
      dateSequence,
      id: "1",
      name: "Test Stock",
      data: stockData,
    });

    dateSequence.next();

    expect(stock.historyData.length).toBe(3);
    expect(stock.currentData?.t).toBe(20230101);
    expect(stock.futureData[0].t).toBe(20230102);
    expect(stock.futureData.length).toBe(2);
  });

  it("應該正確更新後來綁定的股票對象", () => {
    const mockStock1 = new Stock({
      dateSequence,
      id: "1",
      name: "Stock 1",
      data: [
        { t: 20230101, o: 100, h: 110, l: 95, c: 105, v: 1000 },
        { t: 20230102, o: 105, h: 115, l: 100, c: 110, v: 1200 },
        { t: 20230103, o: 110, h: 120, l: 105, c: 115, v: 1100 },
      ],
    });
    dateSequence.next(); // 移動到 20200729

    console.log(mockStock1);
    const mockStock2 = new Stock({
      dateSequence,
      id: "2",
      name: "Stock 2",
      data: [
        { t: 20230101, o: 200, h: 210, l: 195, c: 205, v: 2000 },
        { t: 20230102, o: 205, h: 215, l: 200, c: 210, v: 2200 },
        { t: 20230103, o: 210, h: 220, l: 205, c: 215, v: 2100 },
      ],
    });

    dateSequence.next(); // 移動到 20230102

    expect(mockStock1.currentData?.t).toBe(20230102);
    expect(mockStock1.historyData.length).toBe(2);
    expect(mockStock1.futureData.length).toBe(1);

    expect(mockStock2.currentData?.t).toBe(20230102);
    expect(mockStock2.historyData.length).toBe(2);
    expect(mockStock2.futureData.length).toBe(1);

    dateSequence.next(); // 移動到 20230103

    expect(mockStock1.currentData?.t).toBe(20230103);
    expect(mockStock1.historyData.length).toBe(3);
    expect(mockStock1.futureData.length).toBe(0);

    expect(mockStock2.currentData?.t).toBe(20230103);
    expect(mockStock2.historyData.length).toBe(3);
    expect(mockStock2.futureData.length).toBe(0);
  });
});
