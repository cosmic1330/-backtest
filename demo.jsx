import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Context } from "./dist/esm/index";
import data from "./data/data.json";

ReactDOM.render(<App />, document.getElementById("root"));

// 客製化
// function customBuyMethod(data) {
//   let res = {
//     status: false,
//     detail: "Not up to standard",
//   };
//   if (data[data.length - 1].l < 150) {
//     res.status = true;
//     res.detail = `l:${data[data.length - 1].l} < 150`;
//   }
//   return res;
// }

// function customSellMethod(data) {
//   let res = {
//     status: false,
//     detail: "Not up to standard",
//   };
//   if (data[data.length - 1].l < 150) {
//     res.status = true;
//     res.detail = `l:${data[data.length - 1].l} > 150`;
//   }
//   return res;
// }

function App() {
  const context = useRef(new Context(data, { hightLoss: 0.15 }));
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
