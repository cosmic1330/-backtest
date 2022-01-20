import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Context } from "./dist/esm/index";
import data from "./data/data.json";
import { Ma } from "@ch20026103/anysis";

ReactDOM.render(<App />, document.getElementById("root"));

// 客製化
function customBuyMethod(data) {
  let ma = new Ma();
  let stockData = ma.getBoll(data);
  let res = {
    status: false,
    detail: "Not up to standard",
  };
  if (
    stockData[stockData.length - 1]["c"] > 150 &&
    stockData[stockData.length - 1]["bollLb"] <
      stockData[stockData.length - 1]["c"] &&
    stockData[stockData.length - 2]["bollLb"] <
      stockData[stockData.length - 2]["c"] &&
    (stockData[stockData.length - 3]["bollLb"] >
      stockData[stockData.length - 3]["c"] ||
      stockData[stockData.length - 4]["bollLb"] >
        stockData[stockData.length - 4]["c"])
  ) {
    res.status = true;
    res.detail = `bollLb:${stockData[stockData.length - 1].c} > ${
      stockData[stockData.length - 1]["bollLb"]
    }`;
  }
  return res;
}

function customSellMethod(data) {
  let ma = new Ma();
  let stockData = ma.getBoll(data);
  let res = {
    status: false,
    detail: "Not up to standard",
  };
  if (
    stockData[stockData.length - 1]["bollUb"] <
    stockData[stockData.length - 1]["c"]
  ) {
    res.status = true;
    res.detail = `bollUb:${stockData[stockData.length - 1].c} > ${
      stockData[stockData.length - 1]["bollUb"]
    }`;
  }
  return res;
}

function App() {
  const context = useRef(
    new Context(data, { hightLoss: 0.15, customBuyMethod, customSellMethod })
  );
  let [show, setShow] = useState("");
  let [profit, setProfit] = useState("");
  let [capital, setCapital] = useState("");
  let [win, setWin] = useState("");
  let [lose, setLose] = useState("");
  let [unSoldProfit, setUnSoldProfit] = useState("");

  const handleClick = () => {
    context.current.run();
    setCapital(context.current.capital);
    setProfit(context.current.record.profit);
    setWin(context.current.record.win);
    setLose(context.current.record.lose);
    setUnSoldProfit(context.current.unSoldProfit);
    setShow(JSON.stringify(context.current.record.inventory, 0, 2));
    // setShow(JSON.stringify(context.current.record.history, 0, 2));
  };

  const handleHistory = () => {
    console.log(context.current.dateSequence.historyDates);
  };

  useEffect(() => {
    for (let i = 0; i < 300; i++) {
      handleClick();
    }
  }, []);

  return (
    <div>
      <button onClick={handleClick}>Run</button>
      <button onClick={handleHistory}>Show history</button>
      <p>capital:{capital}</p>
      <p>profit:{profit}</p>
      <p>win:{win}</p>
      <p>lose:{lose}</p>
      <p>unSoldProfit:{unSoldProfit}</p>
      <pre>{show}</pre>
    </div>
  );
}
