import React from "react";

const Badge = (props) => {
  const raw = props.status ?? "";
  const status = String(raw).toLowerCase();

  let className = "inline-block py-1 px-4 rounded-full text-[11px] capitalize ";

  if (status.includes("fail")) {
    className += "bg-red-500 text-white";
  } else if (status.includes("completed") || status.includes("confirm") || status.includes("delivered") ) {
    className += "bg-green-500 text-white";
  } else if (status.includes("pending") || status.includes("processing")) {
    className += "bg-yellow-400 text-black";
  } else {
    className += "bg-gray-200 text-black";
  }

  return <span className={className}>{raw}</span>;
};

export default Badge;
