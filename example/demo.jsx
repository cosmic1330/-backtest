import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

ReactDOM.render(<App />, document.getElementById("root"));

// 客製化
function buyMethod(data) {
  console.log(data);
  const res = {
    status: true,
    detail: `buyMethod`,
  };
  return res;
}
function sellMethod(data) {
  console.log(data);
  const res = {
    status: true,
    detail: `sellMethod`,
  };
  return res;
}

function App() {
  const [context, setContext] = useState();
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

  useEffect(() => {
    fetch(
      `https://tw.quote.finance.yahoo.net/quote/q?type=ta&perd=d&mkt=10&sym=2330&v=1&callback=`,
    )
      .then((response) => {
        console.log(response);
        return response.json(); // 將回應轉換為 JSON 格式
      })
      .then((data) => console.log(data)) // 處理資料
      .catch((error) =>
        console.error("There was a problem with the fetch operation:", error)
      );
  }, []);

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
