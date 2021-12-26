import type { Data, LogicResType } from "../../../types";
import { Macd } from "@ch20026103/anysis";
export default function Default(data: Data[]): LogicResType {
  const res = {
    status: false,
    detail: "Not up to standard",
  };

  const macd = new Macd();
  const macdData = macd.getMACD(data);
  const length = macdData.length - 1;

  if (
    data[data.length - 1]?.sumING > 100 &&
    data[data.length - 2]?.sumING > 100 &&
    data[data.length - 3]?.sumING > 100
  ) {
    res.status = true;
    res.detail = `date:${data[data.length - 1].t},sumING:[ ${
      data[data.length - 1]["sumING"]
    },${data[data.length - 2]["sumING"]},${data[data.length - 3]["sumING"]}]}`;
  }

  return res;
}
