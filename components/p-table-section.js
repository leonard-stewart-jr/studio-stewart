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

  // Responsive: measure rendered width/height for overlays
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

  // Utility for scaling SVG coords to container
  function svgToContainer(x, y, w, h) {
    return {
      left: (x / SVG_WIDTH) * containerDims.width,
      top: (y / SVG_HEIGHT) * containerDims.height,
      width: (w / SVG_WIDTH) * containerDims.width,
      height: (h / SVG_HEIGHT) * containerDims.height,
    };
  }

  // Responsive scroll wrapper min width
  const minTableWidth = 700;

  return (
    <section
      className="matter-matters-section"
      style={{
        width: "100%",
        maxWidth: 1400,
        margin: "54px auto 0 auto",
        background: "#f9f9f7",
        borderRadius: 16,
        boxShadow: "0 1.5px 24px rgba(32,32,32,0.08)",
        padding: "8px 0 28px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "visible",
      }}
    >
      {/* --- SCROLL WRAPPER --- */}
      <div
        style={{
          width: "100vw",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 18,
        }}
      >
        {/* --- TABLE CONTAINER (responsive, aspect-ratio) --- */}
        <div
          ref={tableRef}
          style={{
            width: "100%",
            minWidth: minTableWidth,
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
          {/* Full Periodic Table SVG */}
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

          {/*
            Legend block lives in the table's intentional empty center area.
            Element Risk gets a little more visual weight than the other two,
            while tighter gaps make the three SVGs read as one legend system.
            The whole band is centered between the left and right element blocks
            so the visual margins on each side stay balanced.
          */}
          <div
            style={{
              position: "absolute",
              left: "12.65%",
              top: "0.2%",
              width: "52%",
              display: "grid",
              gridTemplateColumns: "283.23fr 161.56fr 179.04fr",
              gap: 14,
              alignItems: "start",
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <TableKey style={{ width: "100%", height: "auto", display: "block" }} />
            <RiskKey
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                transform: "translateY(-1.2%)",
                transformOrigin: "top center",
              }}
            />
            <TypeKey style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* Interactive cells use the original Illustrator cell geometry. */}
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

      {/* MATERIAL ICONS ROW */}
      <div
        style={{
          marginTop: 24,
          width: "100%",
          maxWidth: 1160,
          height: 120,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          padding: "0 14px",
          userSelect: "none",
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
                outline: isActive
                  ? "2.5px solid #e6dbb9"
                  : "2px solid transparent",
                borderRadius: 13,
                padding: "4px 12px 0 12px",
                margin: "0 6px",
                minWidth: 100,
                minHeight: 80,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isActive
                  ? "0 1px 12px #e6dbb9aa"
                  : "0 1.5px 10px rgba(32,32,32,0.09)",
                cursor: "pointer",
                opacity: isActive ? 1 : 0.58,
                transition: "box-shadow 0.14s, border 0.13s, opacity 0.13s",
                position: "relative",
                zIndex: 3,
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              <IconComponent style={{ height: 65, width: "auto", display: "block" }} />
              <div
                style={{
                  marginTop: 7,
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#181818",
                  opacity: isActive ? 1 : 0.42,
                  letterSpacing: ".03em",
                  textShadow: isActive ? "0 1px 4px #fff9" : "none",
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
