export type Data = {
  o: number;
  l: number;
  h: number;
  c: number;
  v: number;
  skp5: number;
  stockAgentMainPower: number;
  sumING: number;
  sumForeignNoDealer: number;
  name: string;
  t: number;
};

type ResDates = { [stockId: string]: number[] };

interface DateSequenceConstructor {
  startDate?: number;
  endDate?: number;
  data: { [stockId: string]: Data[] };
}

export default class DateSequence {
  // types
  futureDates: ResDates;
  historyDates: ResDates;
  currentDate: number | null;

  constructor({ data, startDate, endDate }: DateSequenceConstructor) {
    this.futureDates = getDates(data);
    this.historyDates = getEmptyArrays(data);
    this.currentDate = null;
  }
  show() {
    return {
      futureDates: this.futureDates,
      historyDates: this.historyDates,
      currentDate: this.currentDate,
    };
  }
}

function 

function getDates(data: { [stockId: string]: Data[] }): ResDates {
  let res: ResDates = {};
  for (var stockId in data) {
    let dates = data[stockId].map((item) => item.t);
    res[stockId] = dates;
  }
  return res;
}

function getEmptyArrays(data: { [stockId: string]: Data[] }): ResDates {
  let res: ResDates = {};
  for (var stockId in data) {
    res[stockId] = [];
  }
  return res;
}
