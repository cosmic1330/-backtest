import Context from "./context";
const json = {
  "1101": [],
  "2330": [
    {
      o: 45.2,
      l: 44.95,
      h: 45.4,
      c: 45.35,
      v: 10001,
      skp5: 8.467,
      stockAgentMainPower: 1578,
      sumING: 3123,
      sumForeignNoDealer: -1819,
      name: "天鈺",
      t: 20200729,
    },
    {
      o: 45.2,
      l: 44.95,
      h: 45.4,
      c: 45.35,
      v: 10001,
      skp5: 8.467,
      stockAgentMainPower: 1578,
      sumING: 3123,
      sumForeignNoDealer: -1819,
      name: "天鈺",
      t: 20200730,
    },
  ],
};

describe("test dateSequence", () => {
  it("currentDate", () => {
    const context = new Context(json, {});
    expect(context.dateSequence.currentDate).toEqual(20200729);
  });

  it("run() currentDate", () => {
    const context = new Context(json, {});
    context.run();
    expect(context.dateSequence.currentDate).toEqual(20200730);
  });
});
