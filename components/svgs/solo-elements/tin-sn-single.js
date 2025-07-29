import * as React from "react";
const SvgTinSnSingle = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 2"
    viewBox="0 0 64 64"
    {...props}
  >
    <rect
      x="1.5"
      y="1.5"
      width="61"
      height="61"
      style={{
        fill: "rgba(192,57,43,.35)",
        stroke: "#54b948",
        strokeLinejoin: "bevel",
        strokeWidth: 3,
      }}
    />
    <text
      data-name="ATOMIC NUMBER"
      style={{
        fontSize: 11,
        fontFamily: "OpenSans-Light,&quot",
        fontWeight: 300,
        isolation: "isolate",
      }}
      transform="translate(4.46 12.64)"
    >
      <tspan x={0} y={0}>
        {"50"}
      </tspan>
    </text>
    <text
      style={{
        fontFamily: "OpenSans-Light,&quot",
        fontWeight: 300,
        isolation: "isolate",
        fontSize: 9,
      }}
      transform="translate(26.5 45.71)"
    >
      <tspan x={0} y={0}>
        {"Tin"}
      </tspan>
    </text>
    <text
      style={{
        isolation: "isolate",
        fontFamily: "OpenSans-Bold,&quot",
        fontSize: 24,
        fontWeight: 700,
      }}
      transform="translate(17.19 35.37)"
    >
      <tspan x={0} y={0}>
        {"Sn"}
      </tspan>
    </text>
    <text
      style={{
        fontFamily: "OpenSans-Light,&quot",
        fontWeight: 300,
        isolation: "isolate",
        fontSize: 8,
      }}
      transform="translate(18.16 57.17)"
    >
      <tspan x={0} y={0}>
        {"118.711"}
      </tspan>
    </text>
  </svg>
);
export default SvgTinSnSingle;
