import type { Data, LogicResType } from "../../../types";
export default function Default(data: Data[]): LogicResType {
  const res = {
    status: false,
    detail: "Not up to standard",
  };

  if (
    data[data.length - 1]?.["sumING"] > 100 &&
    data[data.length - 2]?.["sumING"] > 100 &&
    data[data.length - 3]?.["sumING"] > 100
  ) {
    res.status = true;
    res.detail = `date:${data[data.length - 1].t},sumING:[ ${
      data[data.length - 1]["sumING"]
    },${data[data.length - 2]["sumING"]},${data[data.length - 3]["sumING"]}]
    }`;
  }

  return res;
}
