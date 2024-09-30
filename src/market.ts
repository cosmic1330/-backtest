import {
  Boll,
  BollResType,
  Ema,
  Kd,
  Ma,
  Macd,
  Rsi,
  Williams,
} from "@ch20026103/anysis";
import { EmaResType } from "@ch20026103/anysis/dist/esm/stockSkills/ema";
import { KdResType } from "@ch20026103/anysis/dist/esm/stockSkills/kd";
import { MaResType } from "@ch20026103/anysis/dist/esm/stockSkills/ma";
import { MacdResType } from "@ch20026103/anysis/dist/esm/stockSkills/macd";
import { RsiResType } from "@ch20026103/anysis/dist/esm/stockSkills/rsi";
import type {
  StockListType,
  StockType,
} from "@ch20026103/anysis/dist/esm/stockSkills/types";
import { WilliamsResType } from "@ch20026103/anysis/dist/esm/stockSkills/williams";
import DateSequence, { DatesData } from "./dateSequence";

class TechnicalIndicators {
  boll: Boll;
  ema5: Ema;
  ema10: Ema;
  ema20: Ema;
  ma5: Ma;
  ma10: Ma;
  ma20: Ma;
  ma60: Ma;
  ma120: Ma;
  ma240: Ma;
  kd: Kd;
  macd: Macd;
  rsi5: Rsi;
  rsi10: Rsi;
  williams8: Williams;
  williams18: Williams;

  boll_data: BollResType;
  ema5_data: EmaResType;
  ema10_data: EmaResType;
  ema20_data: EmaResType;
  ma5_data: MaResType;
  ma10_data: MaResType;
  ma20_data: MaResType;
  ma60_data: MaResType;
  ma120_data: MaResType;
  ma240_data: MaResType;
  kd_data: KdResType;
  macd_data: MacdResType;
  rsi5_data: RsiResType;
  rsi10_data: RsiResType;
  williams8_data: WilliamsResType;
  williams18_data: WilliamsResType;
  constructor() {
    // tools
    this.boll = new Boll();
    this.ema5 = new Ema();
    this.ema10 = new Ema();
    this.ema20 = new Ema();
    this.ma5 = new Ma();
    this.ma10 = new Ma();
    this.ma20 = new Ma();
    this.ma60 = new Ma();
    this.ma120 = new Ma();
    this.ma240 = new Ma();
    this.kd = new Kd();
    this.macd = new Macd();
    this.rsi5 = new Rsi();
    this.rsi10 = new Rsi();
    this.williams8 = new Williams();
    this.williams18 = new Williams();
    // record
    this.boll_data = {
      dataset: [],
      bollMa: 0,
      bollUb: 0,
      bollLb: 0,
    };
    this.ema5_data = {
      dataset: [],
      ema: 0,
      type: 5,
    };
    this.ema10_data = {
      dataset: [],
      ema: 0,
      type: 10,
    };
    this.ema20_data = {
      dataset: [],
      ema: 0,
      type: 20,
    };
    this.ma5_data = {
      dataset: [],
      ma: 0,
      type: 5,
      exclusionValue: {
        "d+1": 0,
        d: 0,
        "d-1": 0,
      },
    };
    this.ma10_data = {
      dataset: [],
      ma: 0,
      type: 10,
      exclusionValue: {
        "d+1": 0,
        d: 0,
        "d-1": 0,
      },
    };
    this.ma20_data = {
      dataset: [],
      ma: 0,
      type: 20,
      exclusionValue: {
        "d+1": 0,
        d: 0,
        "d-1": 0,
      },
    };
    this.ma60_data = {
      dataset: [],
      ma: 0,
      type: 60,
      exclusionValue: {
        "d+1": 0,
        d: 0,
        "d-1": 0,
      },
    };
    this.ma120_data = {
      dataset: [],
      ma: 0,
      type: 120,
      exclusionValue: {
        "d+1": 0,
        d: 0,
        "d-1": 0,
      },
    };
    this.ma240_data = {
      dataset: [],
      ma: 0,
      type: 0,
      exclusionValue: {
        "d+1": 0,
        d: 0,
        "d-1": 0,
      },
    };
    this.kd_data = {
      dataset: [],
      rsv: 0,
      k: 0,
      d: 0,
      "k-d": 0,
      type: 9,
    };
    this.macd_data = {
      dataset: [],
      ema12: 0,
      ema26: 0,
      dif: [],
      macd: 0,
      osc: 0,
    };
    this.rsi5_data = {
      dataset: [],
      rsi: 0,
      type: 5,
      avgGain: 0,
      avgLoss: 0,
    };
    this.rsi10_data = {
      dataset: [],
      rsi: 0,
      type: 10,
      avgGain: 0,
      avgLoss: 0,
    };
    this.williams8_data = {
      dataset: [],
      williams: 0,
      type: 8,
    };
    this.williams18_data = {
      dataset: [],
      williams: 0,
      type: 18,
    };
  }

  init(value: StockType) {
    this.boll_data = this.boll.init(value);
    this.ema5_data = this.ema5.init(value, 5);
    this.ema10_data = this.ema10.init(value, 10);
    this.ema20_data = this.ema20.init(value, 20);
    this.ma5_data = this.ma5.init(value, 5);
    this.ma10_data = this.ma10.init(value, 10);
    this.ma20_data = this.ma20.init(value, 20);
    this.ma60_data = this.ma60.init(value, 60);
    this.ma120_data = this.ma120.init(value, 120);
    this.ma240_data = this.ma240.init(value, 240);
    this.kd_data = this.kd.init(value, 9);
    this.macd_data = this.macd.init(value);
    this.rsi5_data = this.rsi5.init(value, 5);
    this.rsi10_data = this.rsi10.init(value, 10);
    this.williams8_data = this.williams8.init(value, 8);
    this.williams18_data = this.williams18.init(value, 18);

    return {
      bollMa: this.boll_data.bollMa,
      bollUb: this.boll_data.bollUb,
      bollLb: this.boll_data.bollLb,
      ma5: this.ma5_data.ma,
      ma10: this.ma10_data.ma,
      ma20: this.ma20_data.ma,
      ma60: this.ma60_data.ma,
      ma120: this.ma120_data.ma,
      ma240: this.ma240_data.ma,
      ema5: this.ema5_data.ema,
      ema10: this.ema10_data.ema,
      ema20: this.ema20_data.ema,
      d: this.kd_data.d,
      k: this.kd_data.k,
      ["k-d"]: this.kd_data["k-d"],
      rsv: this.kd_data.rsv,
      macd: this.macd_data.macd,
      osc: this.macd_data.osc,
      dif: this.macd_data.dif,
      ema12: this.macd_data.ema12,
      ema26: this.macd_data.ema26,
      rsi5: this.rsi5_data.rsi,
      rsi10: this.rsi10_data.rsi,
      williams8: this.williams8_data.williams,
      williams18: this.williams18_data.williams,
    };
  }

  next(value: StockType) {
    this.boll_data = this.boll.next(value, this.boll_data, 20);
    this.ema5_data = this.ema5.next(value, this.ema5_data, 5);
    this.ema10_data = this.ema10.next(value, this.ema10_data, 10);
    this.ema20_data = this.ema20.next(value, this.ema20_data, 20);
    this.ma5_data = this.ma5.next(value, this.ma5_data, 5);
    this.ma10_data = this.ma10.next(value, this.ma10_data, 10);
    this.ma20_data = this.ma20.next(value, this.ma20_data, 20);
    this.ma60_data = this.ma60.next(value, this.ma60_data, 60);
    this.ma120_data = this.ma120.next(value, this.ma120_data, 120);
    this.ma240_data = this.ma240.next(value, this.ma240_data, 240);
    this.kd_data = this.kd.next(value, this.kd_data, 9);
    this.macd_data = this.macd.next(value, this.macd_data);
    this.rsi5_data = this.rsi5.next(value, this.rsi5_data, 5);
    this.rsi10_data = this.rsi10.next(value, this.rsi10_data, 10);
    this.williams8_data = this.williams8.next(value, this.williams8_data, 8);
    this.williams18_data = this.williams18.next(
      value,
      this.williams18_data,
      18
    );

    return {
      bollMa: this.boll_data.bollMa,
      bollUb: this.boll_data.bollUb,
      bollLb: this.boll_data.bollLb,
      ma5: this.ma5_data.ma,
      ma10: this.ma10_data.ma,
      ma20: this.ma20_data.ma,
      ma60: this.ma60_data.ma,
      ma120: this.ma120_data.ma,
      ma240: this.ma240_data.ma,
      ema5: this.ema5_data.ema,
      ema10: this.ema10_data.ema,
      ema20: this.ema20_data.ema,
      d: this.kd_data.d,
      k: this.kd_data.k,
      ["k-d"]: this.kd_data["k-d"],
      rsv: this.kd_data.rsv,
      macd: this.macd_data.macd,
      osc: this.macd_data.osc,
      dif: this.macd_data.dif,
      ema12: this.macd_data.ema12,
      ema26: this.macd_data.ema26,
      rsi5: this.rsi5_data.rsi,
      rsi10: this.rsi10_data.rsi,
      williams8: this.williams8_data.williams,
      williams18: this.williams18_data.williams,
    };
  }
}

interface MarketConstructorType {
  dateSequence: DateSequence;
  data: StockListType;
}

export default class Market {
  dateSequence: DateSequence;
  futureData: StockListType;
  historyData: StockListType;
  currentData: StockType | undefined;
  technicalIndicators: TechnicalIndicators;

  constructor({ data, dateSequence }: MarketConstructorType) {
    this.technicalIndicators = new TechnicalIndicators();
    this.futureData = data;
    this.historyData = [];
    this.currentData = undefined;
    this.dateSequence = dateSequence;
    this.dateSequence.bind(this);
  }

  init() {
    this.currentData = undefined;
    this.futureData.unshift(...this.historyData);
    this.historyData = [];
  }

  generat() {
    if (this.historyData.length === 0) {
      const data = this.futureData.shift();
      if (data) {
        const indicators = this.technicalIndicators.init(data);
        const result = { ...data, ...indicators };
        this.historyData.push(result);
        this.currentData = result;
      }
    } else {
      const data = this.futureData.shift();
      if (data) {
        const indicators = this.technicalIndicators.next(data);
        const result = { ...data, ...indicators };
        this.historyData.push(result);
        this.currentData = result;
      }
    }
  }

  update(currentDate: DatesData | undefined) {
    if(!this?.futureData[0]?.t) return;
    if (currentDate === this.futureData[0].t) {
      this.generat();
    } else if (
      this.futureData.length > 0 &&
      currentDate &&
      currentDate > this.futureData[0].t
    ) {
      while (this.futureData[0] && currentDate >= this.futureData[0].t) {
        this.generat();
      }
    }
  }
}
