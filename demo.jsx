import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Context } from "./src/index";
import data from "./data/data.json";

ReactDOM.render(<App />, document.getElementById("root"));

// 客製化
function customBuyMethod(data) {
  let res = {
    status: false,
    detail: "Not up to standard",
  };
  if (data[data.length - 1].l < 150) {
    res.status = true;
    res.detail = `l:${data[data.length - 1].l} < 150`;
  }
  return res;
}

function customSellMethod(data) {
  let res = {
    status: false,
    detail: "Not up to standard",
  };
  if (data[data.length - 1].l < 150) {
    res.status = true;
    res.detail = `l:${data[data.length - 1].l} > 150`;
  }
  return res;
}

function App() {
  const context = useRef(
    new Context(data, { customBuyMethod, customSellMethod })
  );
  let [show, setShow] = useState("");

  const handleClick = () => {
    context.current.run();
    setShow(JSON.stringify(context.current.record.history, 0, 2));
    // setShow(context.current.capital)
  };

  const handleHistory = () => {
    console.log(context.current.dateSequence.historyDates);
  };

  useEffect(() => {
    for (let i = 0; i < 400; i++) {
      handleClick();
    }
  }, []);

  return (
    <div>
      <button onClick={handleClick}>Run</button>
      <button onClick={handleHistory}>Show history</button>
      <pre>{show}</pre>
    </div>
  );
}
