import { Kd, Ma, Macd, Rsi, Williams } from "@ch20026103/anysis";
import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";
import data from "../data/data.json";
import { Context } from "../dist/esm/index";

ReactDOM.render(<App />, document.getElementById("root"));

// 客製化
function customBuyMethod(data) {
  let ma = new Ma();
  let macd = new Macd();
  let rsi = new Rsi();
  let kd = new Kd();
  let williams = new Williams();
  // m1
  let rsiData = rsi.getAllRsi(data);
  let williamsData = williams.getAllWillams(data);
  // m2
  // const Ema26 = macd.getEMA26(data);
  // const Ema12 = macd.getEMA12(data);
  // const Dif = macd.getDIF(data, Ema12, Ema26);
  // const Macd9 = macd.getMACD9(data, Dif);

  // let ma10Data = ma.getMa10(data);
  // let ma5Data = ma.getMa5(data);
  // let ma20Data = ma.getMa20(data);
  // let ma60Data = ma.getMa60(data);
  // let rsiData = rsi.getAllRsi(data);
  // let kdData = kd.getKD(data);
  let res = {
    status: false,
    detail: "Not up to standard",
  };
  if (
    // m1:
    (williamsData[williamsData.length - 2].williams9 < -80 ||
      williamsData[williamsData.length - 3].williams9 < -80||
      williamsData[williamsData.length - 4].williams9 < -80) &&
    (williamsData[williamsData.length - 2].williams18 < -80 ||
      williamsData[williamsData.length - 3].williams18 < -80||
      williamsData[williamsData.length - 4].williams9 < -80) &&
      (rsiData[rsiData.length - 1].rsi6>rsiData[rsiData.length - 1].rsi12) &&
      (rsiData[rsiData.length - 2].rsi6<rsiData[rsiData.length - 2].rsi12)

    // m2:
    // data[data.length - 1]["v"] > 1500 &&
    // data[data.length - 2]["v"] > 1500 &&
    // kdData[data.length - 1]["k-d"] > 3 &&
    // kdData[data.length - 1]["k"] > 50 &&
    // kdData[data.length - 1]["k"] > kdData[data.length - 1]["d"] &&
    // kdData[data.length - 2]["k"] < kdData[data.length - 2]["d"] &&
    // Dif[data.length - 1]["DIF"] > 0 &&
    // Macd9[data.length - 1]["MACD9"] > 0 &&
    // Macd9[data.length - 1]["OSC"] > Macd9[data.length - 2]["OSC"] &&
    // Macd9[data.length - 1]["OSC"] > Macd9[data.length - 3]["OSC"] &&
    // Macd9[data.length - 1]["OSC"] > Macd9[data.length - 4]["OSC"] &&
    // data[data.length - 1]["c"] > ma10Data[ma10Data.length - 1]["ma10"] &&
    // ma5Data[ma5Data.length - 1]["ma5"] >
    //   ma20Data[ma20Data.length - 1]["ma20"] &&
    // ma20Data[ma20Data.length - 1]["ma20"] >
    //   ma60Data[ma60Data.length - 1]["ma60"] &&
    // ma5Data[ma5Data.length - 1]["ma5"] >
    //   ma60Data[ma60Data.length - 1]["ma60"] &&
    // rsiData[rsiData.length - 1]["rsi6"] < 75 &&
    // rsiData[rsiData.length - 1]["rsi6"] > 30
  ) {
    res.status = true;
    res.detail = `no message`;
  }
  return res;
}

function customSellMethod(data) {
  let rsi = new Rsi();
  let williams = new Williams();
  let stockData = rsi.getAllRsi(data);
  stockData = williams.getAllWillams(stockData);

  let res = {
    status: false,
    detail: "Not up to standard",
  };
  if (
    stockData[stockData.length - 1]["l"] >
      stockData[stockData.length - 2]["l"] &&
    (stockData[stockData.length - 1]["rsi6"] > 80 ||
      stockData[stockData.length - 2]["rsi6"] > 80)
  ) {
    res.status = true;
    res.detail = `rsi減弱＋股價破低`;
  }
  return res;
}

function App() {
  const context = useRef(
    new Context(data, {
      hightLoss: 0.15,
      customBuyMethod,
      customSellMethod,
      // startDate: 20221201,
      // endDate: 20230218,
    })
  );
  let [show, setShow] = useState("");
  let [profit, setProfit] = useState("");
  let [capital, setCapital] = useState("");
  let [win, setWin] = useState("");
  let [lose, setLose] = useState("");
  let [unSoldProfit, setUnSoldProfit] = useState("");
  let [inventory, setInventory] = useState("");

  const handleClick = () => {
    for (let i = 0; i < 100; i++) {
      context.current.run();
      console.log(context.current.dateSequence.currentDate);
    }
    console.log("end");
    setCapital(context.current.capital);
    setProfit(context.current.record.profit);
    setWin(context.current.record.win);
    setLose(context.current.record.lose);
    setUnSoldProfit(context.current.unSoldProfit);
    setShow(JSON.stringify(context.current.record.history, 0, 2));
  };

  const handleHistory = () => {
    console.log(context.current.dateSequence.historyDates);
  };

  const handleShowInventory = () => {
    setInventory(JSON.stringify(context.current.record.inventory, 0, 2));
  };

  return (
    <div>
      <button onClick={handleClick}>Run</button>
      <button onClick={handleShowInventory}>Show inventory</button>
      <button onClick={handleHistory}>Show history</button>
      <p>capital:{capital}</p>
      <p>profit:{profit}</p>
      <p>win:{win}</p>
      <p>lose:{lose}</p>
      <p>unSoldProfit:{unSoldProfit}</p>
      <pre>inventory:{inventory}</pre>
      <br />
      <pre>{show}</pre>
    </div>
  );
}
