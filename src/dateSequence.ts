export type DatesData = number;

interface DateSequenceConstructorType {
  stopDate?: DatesData;
  data: DatesData[];
}

interface Observer {
  update(currentDate: DatesData | undefined): void;
}

export default class DateSequence {
  // types
  futureDates: DatesData[];
  historyDates: DatesData[];
  currentDate: DatesData | undefined;
  stopDate?: DatesData;
  observers: Observer[];

  constructor({ data, stopDate }: DateSequenceConstructorType) {
    this.futureDates = data;
    this.historyDates = [];
    this.currentDate = undefined;
    this.observers = [];
    this.stopDate = stopDate;
  }

  bind(observer: Observer) {
    this.observers.unshift(observer);
  }

  attach(observer: Observer) {
    this.observers.push(observer);
  }

  notifyAllObservers() {
    this.observers.forEach((observer) => {
      observer.update(this.currentDate);
    });
  }

  next() {
    if (this.futureDates.length > 0) {
      if (this.stopDate && this.futureDates[0] > this.stopDate) return false;

      const data = this.futureDates.shift();
      if (data) {
        this.currentDate = data;
        this.historyDates.push(data);
        this.notifyAllObservers();
        return true;
      }
    }
    return false;
  }
}
