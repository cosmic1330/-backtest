import { dateFormat } from "@ch20026103/anysis";
import type { Data } from "./types";

type ResDates = { [stockId: string]: number[] };

export interface DateSequenceConstructorType {
  startDate?: number;
  endDate?: number;
  data: { [stockId: string]: Data[] };
}

export default class DateSequence {
  // types
  DatesData: { [stockId: string]: { [date: string]: Data } };
  futureDates: ResDates;
  historyDates: ResDates;
  currentDate: number;
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  observers: any[];
  stopDate?: number;

  constructor({ data, startDate, endDate }: DateSequenceConstructorType) {
    this.DatesData = getDatesData(data);
    this.futureDates = getDates(data);
    this.historyDates = getEmptyArrays(data);
    this.currentDate = startDate || getFirstDate(this.futureDates);
    this.observers = [];
    this.stopDate = endDate;
  }

  getHistoryData(stockId: string): Data[] {
    const allDates = this.historyDates[stockId];
    const res: Data[] = [];
    allDates.forEach((item) => {
      const filterData = this.DatesData[stockId][item];
      res.push(filterData);
    });
    return res;
  }

  attach(observer: any) {
    this.observers.push(observer);
  }

  notifyAllObservers() {
    this.observers.forEach((observer) => {
      observer.update();
    });
  }

  setNext() {
    if (this.stopDate && this.currentDate > this.stopDate) return;

    let nextDate = dateFormat(this.currentDate, 2) + 24 * 60 * 60 * 1000;
    nextDate = dateFormat(nextDate, 5);
    Object.keys(this.futureDates).map((stockId) => {
      for (let i = 0; i < this.futureDates[stockId].length; i++) {
        const t = this.futureDates[stockId][i];
        const res = this.dateSaveInHistory(stockId, nextDate, t);
        if (!res) break;
      }
      return false;
    });
    this.currentDate = nextDate;
    this.notifyAllObservers();
  }

  dateSaveInHistory(stockId: string, nextDate: number, t: number) {
    if (t < nextDate) {
      this.historyDates[stockId].push(t);
      this.futureDates[stockId].shift();
      return true;
    } else {
      return false;
    }
  }
}

function getDatesData(data: { [stockId: string]: Data[] }): {
  [stockId: string]: { [date: string]: Data };
} {
  const res: {
    [stockId: string]: { [date: string]: Data };
  } = {};
  for (const stockId in data) {
    res[stockId] = {};
    data[stockId].map((item) => {
      res[stockId][item.t] = item;
    });
  }
  return res;
}

function getDates(data: { [stockId: string]: Data[] }): ResDates {
  const res: ResDates = {};
  for (const stockId in data) {
    const dates = data[stockId].map((item) => item.t);
    res[stockId] = dates;
  }
  return res;
}

function getEmptyArrays(data: { [stockId: string]: Data[] }): ResDates {
  const res: ResDates = {};
  for (const stockId in data) {
    res[stockId] = [];
  }
  return res;
}

function getFirstDate(futureDates: ResDates) {
  const firstDates = [];
  for (const stockId in futureDates) {
    firstDates.push(futureDates[stockId][0]);
  }
  return Math.min(...firstDates);
}
