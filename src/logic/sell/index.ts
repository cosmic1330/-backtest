import Default from "./methods/default";
import type { Data, LogicResType } from "../../types";
export default function sellLogic(
  data: Data[],
  useMethod: string
): LogicResType {
  switch (useMethod) {
    case "Default": {
      const res = Default(data);
      return res;
    }
    default:
      return { status: false, detail: "not found method" };
  }
}
