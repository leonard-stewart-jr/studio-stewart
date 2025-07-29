import * as React from "react";

export default function TungstenTSingle({ style, title }) {
  return (
    <svg
      viewBox="0 0 52.65 52.65"
      style={style}
      aria-label={title}
      role="img"
    >
      <rect
        x="0"
        y="0"
        width="52.65"
        height="52.65"
        rx="7"
        fill="rgba(192,57,43,.35)"
        stroke="#f5db12"
        strokeWidth="3"
        strokeLinejoin="bevel"
      />
      <text
        x="6.2"
        y="12"
        fontSize="8"
        fontWeight="300"
        fill="#181818"
        fontFamily="Open Sans, Arial, sans-serif"
      >
        74
      </text>
      <text
        x="26.33"
        y="32"
        textAnchor="middle"
        fontSize="18"
        fontWeight="700"
        fill="#181818"
        fontFamily="Open Sans, Arial, sans-serif"
      >
        W
      </text>
      <text
        x="26.33"
        y="43"
        textAnchor="middle"
        fontSize="8"
        fontWeight="300"
        fill="#181818"
        fontFamily="Open Sans, Arial, sans-serif"
      >
        Tungsten
      </text>
      <text
        x="20"
        y="50"
        fontSize="7"
        fontWeight="300"
        fill="#181818"
        fontFamily="Open Sans, Arial, sans-serif"
      >
        183.84
      </text>
    </svg>
  );
}
