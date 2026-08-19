import * as React from "react";

export default function TinSnSingle(props) {
  return (
    <svg viewBox="0 0 63.59 63.59" width="100%" height="100%" {...props}>
      <rect
        x="1.5"
        y="1.5"
        width="60.59"
        height="60.59"
        fill="rgba(192,57,43,.35)"
        stroke="#54b948"
        strokeWidth="3"
        strokeLinejoin="bevel"
      />

      <text
        x="4.46"
        y="12.64"
        fontSize="11"
        fontWeight="300"
        fill="#181818"
        fontFamily='OpenSans-Light, "Open Sans"'
      >
        50
      </text>

      <text
        x="17.19"
        y="35.37"
        fontSize="24"
        fontWeight="700"
        fill="#181818"
        fontFamily='OpenSans-Bold, "Open Sans"'
      >
        Sn
      </text>

      <text
        x="26.5"
        y="45.71"
        fontSize="9"
        fontWeight="300"
        fill="#181818"
        fontFamily='OpenSans-Light, "Open Sans"'
      >
        Tin
      </text>

      <text
        x="18.16"
        y="57.17"
        fontSize="8"
        fontWeight="300"
        fill="#181818"
        fontFamily='OpenSans-Light, "Open Sans"'
      >
        118.711
      </text>
    </svg>
  );
}
