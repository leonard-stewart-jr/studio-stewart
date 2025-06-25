import React from "react";

const subnavs = [
  { key: "world", label: "WORLD" },
  { key: "usa", label: "USA" },
  { key: "sd", label: "SOUTH DAKOTA" },
];

export default function ISPSubNav({ active, onChange }) {
  return (
    <div className="isp-subnav-row">
      {subnavs.map((item) => (
        <button
          key={item.key}
          className={
            "isp-subnav-btn" + (active === item.key ? " active" : "")
          }
          onClick={() => onChange(item.key)}
          aria-current={active === item.key ? "page" : undefined}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
