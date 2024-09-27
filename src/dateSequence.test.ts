import DateSequence from "./dateSequence";

describe("DateSequence", () => {
  let testData: number[] = [];
  beforeEach(() => {
    testData = [20200729, 20200730, 20200731];
  });

  it("應該正確初始化 DateSequence", () => {
    const dateSequence = new DateSequence({ data: testData });

    expect(dateSequence.currentDate).toBe(undefined);
    expect(dateSequence.futureDates).toEqual([20200729, 20200730, 20200731]);
    expect(dateSequence.historyDates).toEqual([]);
  });

  it("應該正確設置下一個日期", () => {
    const dateSequence = new DateSequence({ data: testData });
    dateSequence.next();

    expect(dateSequence.currentDate).toBe(20200729);
    expect(dateSequence.futureDates).toEqual([20200730, 20200731]);
    expect(dateSequence.historyDates).toEqual([20200729]);
  });

  it("應該在到達最後一個日期後停止", () => {
    const dateSequence = new DateSequence({ data: testData });
    dateSequence.next();
    dateSequence.next();
    dateSequence.next();
    dateSequence.next(); // 應該沒有效果

    expect(dateSequence.currentDate).toBe(20200731);
    expect(dateSequence.futureDates).toEqual([]);
    expect(dateSequence.historyDates).toEqual([20200729, 20200730, 20200731]);
  });

  it("應該在到達 stopDate 後停止", () => {
    const dateSequence = new DateSequence({
      data: testData,
      stopDate: 20200730,
    });
    dateSequence.next();
    dateSequence.next();
    dateSequence.next(); // 應該沒有效果

    expect(dateSequence.currentDate).toBe(20200730);
    expect(dateSequence.futureDates).toEqual([20200731]);
    expect(dateSequence.historyDates).toEqual([20200729, 20200730]);
  });

  it("應該正確通知觀察者", () => {
    const dateSequence = new DateSequence({ data: testData });
    const mockObserver1 = { update: vi.fn() };
    const mockObserver2 = { update: vi.fn() };
    dateSequence.attach(mockObserver1);
    dateSequence.attach(mockObserver2);
    dateSequence.next();

    expect(mockObserver1.update).toHaveBeenCalledTimes(1);
    expect(mockObserver2.update).toHaveBeenCalledTimes(1);
  });
});
