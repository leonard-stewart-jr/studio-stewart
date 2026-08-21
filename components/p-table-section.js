import React, { useRef, useState, useLayoutEffect } from "react";

// KEYS
import RiskKey from "./svgs/keys/riskkey";
import TypeKey from "./svgs/keys/typekey";
import TableKey from "./svgs/keys/tablekey";

// FULL TABLE
import FullTable from "./svgs/fulltable";

// SOLO ELEMENT ICONS
import TinSnSingle from "./svgs/solo-elements/tin-sn-single";
import TungstenTSingle from "./svgs/solo-elements/tungsten-t-single";

// MATERIAL ICONS - colored and bw
import SolarPanelC from "./svgs/material-icons/solarpanel-c";
import SteelC from "./svgs/material-icons/steel-c";
import GlassC from "./svgs/material-icons/glass-c";
import PlasticC from "./svgs/material-icons/plastic-c";
import ConcreteC from "./svgs/material-icons/concrete-c";
import PaintC from "./svgs/material-icons/paint-c";
import SolarPanelBw from "./svgs/material-icons/solarpanel-bw";
import SteelBw from "./svgs/material-icons/steel-bw";
import GlassBw from "./svgs/material-icons/glass-bw";
import PlasticBw from "./svgs/material-icons/plastic-bw";
import ConcreteBw from "./svgs/material-icons/concrete-bw";
import PaintBw from "./svgs/material-icons/paint-bw";

// ICON DATA
const materialIcons = [
  {
    key: "solarpanel",
    label: "Solar Panel",
    ColorIcon: SolarPanelC,
    BwIcon: SolarPanelBw,
  },
  {
    key: "steel",
    label: "Steel",
    ColorIcon: SteelC,
    BwIcon: SteelBw,
  },
  {
    key: "glass",
    label: "Glass",
    ColorIcon: GlassC,
    BwIcon: GlassBw,
  },
  {
    key: "plastic",
    label: "Plastic",
    ColorIcon: PlasticC,
    BwIcon: PlasticBw,
  },
  {
    key: "concrete",
    label: "Concrete",
    ColorIcon: ConcreteC,
    BwIcon: ConcreteBw,
  },
  {
    key: "paint",
    label: "Paint",
    ColorIcon: PaintC,
    BwIcon: PaintBw,
  },
];

// SVG GRID CONSTANTS
const SVG_WIDTH = 1344;
const SVG_HEIGHT = 512;

// The master table's cell paths are 61px square with a centered 3px stroke.
// The original solo-cell exports therefore use a 63.59px viewBox, starting
// 1.5px outside the path coordinate so the visible stroke aligns perfectly.
const SOLO_CELL_SIZE = 63.59;
const STROKE_OFFSET = 1.5;

const tungstenBox = {
  x: 419.13 - STROKE_OFFSET,
  y: 349.29 - STROKE_OFFSET,
  w: SOLO_CELL_SIZE,
  h: SOLO_CELL_SIZE,
};

const snBox = {
  x: 976.14 - STROKE_OFFSET,
  y: 279.82 - STROKE_OFFSET,
  w: SOLO_CELL_SIZE,
  h: SOLO_CELL_SIZE,
};

export default function PTableSection() {
  const [activeIcons, setActiveIcons] = useState({
    solarpanel: true,
    steel: true,
    glass: true,
    plastic: true,
    concrete: true,
    paint: true,
  });

  function toggleIcon(key) {
    setActiveIcons((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const tableRef = useRef();
  const [containerDims, setContainerDims] = useState({ width: SVG_WIDTH, height: SVG_HEIGHT });

  useLayoutEffect(() => {
    function updateDims() {
      if (tableRef.current) {
        setContainerDims({
          width: tableRef.current.offsetWidth,
          height: tableRef.current.offsetHeight,
        });
      }
    }
    updateDims();
    window.addEventListener("resize", updateDims);
    return () => window.removeEventListener("resize", updateDims);
  }, []);

  function svgToContainer(x, y, w, h) {
    return {
      left: (x / SVG_WIDTH) * containerDims.width,
      top: (y / SVG_HEIGHT) * containerDims.height,
      width: (w / SVG_WIDTH) * containerDims.width,
      height: (h / SVG_HEIGHT) * containerDims.height,
    };
  }

  return (
    <section
      className="matter-matters-section"
      style={{
        width: "100%",
        maxWidth: 1400,
        margin: "clamp(22px, 7vw, 54px) auto 0 auto",
        background: "#f9f9f7",
        borderRadius: "clamp(0px, 3vw, 16px)",
        boxShadow: "0 1.5px 24px rgba(32,32,32,0.08)",
        padding: "clamp(8px, 2.8vw, 18px) 0 clamp(22px, 6vw, 28px) 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          padding: "0 clamp(4px, 1.8vw, 16px) clamp(10px, 3vw, 18px) clamp(4px, 1.8vw, 16px)",
          boxSizing: "border-box",
        }}
      >
        <div
          ref={tableRef}
          style={{
            width: "100%",
            maxWidth: 1344,
            aspectRatio: `${SVG_WIDTH}/${SVG_HEIGHT}`,
            position: "relative",
            margin: "0 auto",
            background: "#f9f9f7",
            borderRadius: 12,
            boxShadow: "0 2px 18px rgba(32,32,32,0.08)",
            overflow: "visible",
            display: "block",
          }}
        >
          <FullTable
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 1,
              pointerEvents: "none",
            }}
          />

          {/* Keep the legend in the actual open table range, but weight the outer gaps wider
              and the inner gaps tighter so the visible white space feels even. */}
          <div
            style={{
              position: "absolute",
              left: "9.87%",
              top: "0.2%",
              width: "57.58%",
              display: "grid",
              gridTemplateColumns: "25fr 311.553fr 8fr 177.716fr 8fr 216.638fr 25fr",
              gap: 0,
              alignItems: "start",
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <div />
            <TableKey style={{ width: "100%", height: "auto", display: "block" }} />
            <div />
            <RiskKey
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                transform: "translateY(-0.8%)",
                transformOrigin: "top center",
              }}
            />
            <div />
            <TypeKey
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                transform: "translateY(-0.6%)",
                transformOrigin: "top center",
              }}
            />
            <div />
          </div>

          <TungstenTSingle
            style={{
              position: "absolute",
              ...svgToContainer(tungstenBox.x, tungstenBox.y, tungstenBox.w, tungstenBox.h),
              zIndex: 3,
              pointerEvents: "auto",
              cursor: "pointer",
            }}
            title="Tungsten (W)"
          />

          <TinSnSingle
            style={{
              position: "absolute",
              ...svgToContainer(snBox.x, snBox.y, snBox.w, snBox.h),
              zIndex: 3,
              pointerEvents: "auto",
              cursor: "pointer",
            }}
            title="Tin (Sn)"
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "clamp(12px, 4vw, 24px)",
          width: "100%",
          maxWidth: 1160,
          height: "auto",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: "clamp(8px, 3vw, 24px)",
          padding: "0 clamp(8px, 4vw, 14px)",
          userSelect: "none",
          boxSizing: "border-box",
        }}
      >
        {materialIcons.map(({ key, label, ColorIcon, BwIcon }) => {
          const isActive = !!activeIcons[key];
          const IconComponent = isActive ? ColorIcon : BwIcon;
          return (
            <button
              key={key}
              onClick={() => toggleIcon(key)}
              aria-pressed={isActive}
              aria-label={label}
              style={{
                background: "none",
                border: "none",
                outline: isActive ? "2.5px solid #e6dbb9" : "2px solid transparent",
                borderRadius: 13,
                padding: "4px clamp(7px, 2.6vw, 12px) 0 clamp(7px, 2.6vw, 12px)",
                margin: 0,
                flex: "0 1 clamp(86px, 27vw, 124px)",
                minWidth: 0,
                minHeight: "clamp(72px, 22vw, 96px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isActive ? "0 1px 12px #e6dbb9aa" : "0 1.5px 10px rgba(32,32,32,0.09)",
                cursor: "pointer",
                opacity: isActive ? 1 : 0.58,
                transition: "box-shadow 0.14s, border 0.13s, opacity 0.13s",
                position: "relative",
                zIndex: 3,
                fontSize: 17,
                fontWeight: 700,
                boxSizing: "border-box",
              }}
            >
              <IconComponent
                style={{
                  height: "clamp(42px, 14vw, 65px)",
                  width: "auto",
                  maxWidth: "100%",
                  display: "block",
                }}
              />
              <div
                style={{
                  marginTop: "clamp(4px, 1.6vw, 7px)",
                  fontSize: "clamp(11px, 3.8vw, 15px)",
                  fontWeight: 500,
                  color: "#181818",
                  opacity: isActive ? 1 : 0.42,
                  letterSpacing: ".03em",
                  textShadow: isActive ? "0 1px 4px #fff9" : "none",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
