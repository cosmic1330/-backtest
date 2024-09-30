import type { StockListType } from "@ch20026103/anysis/dist/esm/stockSkills/types";
import DateSequence from "./dateSequence";
import Market from "./market";

describe("Stock", () => {
  let dateSequence: DateSequence;
  let taiexData: StockListType;
  let market: Market;
  beforeEach(() => {
    dateSequence = new DateSequence({ data: [20230101, 20230102, 20230103] });
    taiexData = [
      { t: 20230101, o: 100, h: 110, l: 95, c: 105, v: 1000 },
      { t: 20230102, o: 105, h: 115, l: 100, c: 110, v: 1200 },
      { t: 20230103, o: 110, h: 120, l: 105, c: 115, v: 1100 },
    ];

    market = new Market({
      dateSequence,
      data: taiexData,
    });
  });

  test("初始化股票對象", () => {
    expect(market).toBeDefined();
    expect(market.futureData).toEqual(taiexData);
    expect(market.historyData).toEqual([]);
    expect(market.currentData).toBeUndefined();
  });

  test("更新股票數據", () => {

    dateSequence.next();

    expect(market.historyData.length).toBe(1);
    expect(market.currentData?.c).toEqual(market.historyData[0].c);
    expect(market.futureData.length).toBe(2);

    dateSequence.next();
    expect(market.historyData.length).toBe(2);
    expect(market.currentData?.c).toEqual(market.historyData[1].c);
    expect(market.futureData.length).toBe(1);
  });

  test("技術指標計算", () => {
    dateSequence.next();

    expect(market.currentData).toHaveProperty("bollMa");
    expect(market.currentData).toHaveProperty("ema5");
    expect(market.currentData).toHaveProperty("rsi5");
    // 添加更多技術指標的檢查
  });

  test("日期不匹配時不更新", () => {
    taiexData.shift();
    market = new Market({
      dateSequence,
      data: taiexData,
    });

    dateSequence.next();

    expect(market.historyData.length).toBe(0);
    expect(market.currentData).toBeUndefined();
    expect(market.futureData.length).toBe(2);
  });

  test("市場對象日期比較早", () => {
    // 插入一個比較早的日期
    taiexData.unshift({ t: 20221231, o: 100, h: 106, l: 96, c: 106, v: 999 });
    taiexData.unshift({ t: 20221230, o: 99, h: 110, l: 95, c: 105, v: 1000 });
    market = new Market({
      dateSequence,
      data: taiexData,
    });

    dateSequence.next();

    expect(market.historyData.length).toBe(3);
    expect(market.currentData?.t).toBe(20230101);
    expect(market.futureData[0].t).toBe(20230102);
    expect(market.futureData.length).toBe(2);
  });

  test("初始化市场对象", () => {
    dateSequence.next();
    expect(market.historyData.length).toBe(1);
    expect(market.currentData?.c).toEqual(market.historyData[0].c);
    expect(market.futureData.length).toBe(2);

    market.init();
    expect(market.historyData).toEqual([]);
    expect(market.currentData).toBeUndefined();
    expect(market.futureData).toEqual(taiexData);
  });
});
