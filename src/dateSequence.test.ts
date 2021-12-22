import DateSequence, { Data } from "./dateSequence";
import data from "../data/data.json";

let mockData = data as { [stockId: string]: Data[] };
describe("test dateSequence", () => {
  it("default", () => {
    const dateSequence = new DateSequence({ data: mockData });
    console.log(dateSequence.show());
    expect(true).toEqual(true);
  });
});
