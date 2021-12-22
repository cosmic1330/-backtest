import React from "react";
import ReactDOM from "react-dom";
import  DateSequence from "./src/dateSequence";
import data from "./data/data.json";

ReactDOM.render(
  <App/>,
  document.getElementById("root")
);

function App(){
  let dateSequence = new DateSequence({data});
  let {futureDates} = dateSequence.show();
  return <pre>
    {JSON.stringify(futureDates,0,2)}
  </pre>
}