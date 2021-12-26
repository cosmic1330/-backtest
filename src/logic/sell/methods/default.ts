import type { Data, LogicResType } from "../../../types";
import { Williams } from "@ch20026103/anysis";
export default function Default(data: Data[]): LogicResType {
  const res = {
    status: false,
    detail: "Not up to standard",
  };

  const williams = new Williams();
  const williamsData = williams.getAllWillams(data);
  const length = williamsData.length - 1;

  if (
    williamsData[length].williams9 &&
    (williamsData[length].williams9 as number) > -10
  ) {
    res.status = true;
    res.detail = `date:${data[data.length - 1].t},williams9:${
      williamsData[williamsData.length - 1].williams9
    }`;
  }

  return res;
}
