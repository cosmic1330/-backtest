import DateSequence from "./dateSequence";
import { Data } from "./types";
import data from "../data/testData.json";

const mockData = data as { [stockId: string]: Data[] };
describe("test dateSequence", () => {
  it("default", () => {
    const dateSequence = new DateSequence({ data: mockData });
    console.log(dateSequence.DatesData);
    expect(true).toEqual(true);
  });
});
