import * as React from "react";

export default function TungstenTSingle(props) {
  return (
    <svg viewBox="0 0 63.59 63.59" width="100%" height="100%" {...props}>
      <rect
        x="1.5"
        y="1.5"
        width="60.59"
        height="60.59"
        fill="rgba(192,57,43,.35)"
        stroke="#f5db12"
        strokeWidth="3"
        strokeLinejoin="bevel"
      />

      <text
        x="3.59"
        y="12.76"
        fontSize="11"
        fontWeight="300"
        fill="#181818"
        fontFamily='OpenSans-Light, "Open Sans"'
      >
        74
      </text>

      <text
        x="20.21"
        y="35.49"
        fontSize="24"
        fontWeight="700"
        fill="#181818"
        fontFamily='OpenSans-Bold, "Open Sans"'
      >
        W
      </text>

      <text
        x="12.91"
        y="45.82"
        fontSize="9"
        fontWeight="300"
        fill="#181818"
        fontFamily='OpenSans-Light, "Open Sans"'
      >
        Tungsten
      </text>

      <text
        x="19.57"
        y="57.29"
        fontSize="8"
        fontWeight="300"
        fill="#181818"
        fontFamily='OpenSans-Light, "Open Sans"'
      >
        183.84
      </text>
    </svg>
  );
}
