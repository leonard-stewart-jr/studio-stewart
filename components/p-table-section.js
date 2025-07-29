import React, { useState } from "react";

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

// --- GRID CONSTANTS ---
const DIV_WIDTH = 1160;
const DIV_HEIGHT = 470;
const COLS = 18;
const ROWS = 7;
const boxWidth = DIV_WIDTH / COLS;
const boxHeight = DIV_HEIGHT / ROWS;

// W and Sn positions (zero-indexed, from left/top)
const tungstenCol = 5, tungstenRow = 4;
const snCol = 13, snRow = 4;

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

  const sectionMaxHeight = 880;
  const keyRowHeight = 70;
  const iconRowHeight = 120;
  const gap = 22;

  return (
    <section
      className="matter-matters-section"
      style={{
        width: "100%",
        maxWidth: 1400,
        margin: "54px auto 0 auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 1.5px 24px rgba(32,32,32,0.08)",
        padding: "32px 0 28px 0",
        minHeight: sectionMaxHeight,
        maxHeight: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "visible",
      }}
    >
      {/* KEYS ROW */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 68,
          width: "100%",
          minHeight: keyRowHeight,
          marginBottom: gap,
        }}
      >
        <TableKey style={{ height: 64, width: "auto" }} />
        <RiskKey style={{ height: 64, width: "auto" }} />
        <TypeKey style={{ height: 64, width: "auto" }} />
      </div>

      {/* PERIODIC TABLE + TIN/TUNGSTEN OVERLAYS */}
      <div
        style={{
          position: "relative",
          width: DIV_WIDTH,
          height: DIV_HEIGHT,
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Full Periodic Table */}
        <FullTable
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 1,
          }}
        />
        {/* Tungsten overlay */}
        <TungstenTSingle
          style={{
            position: "absolute",
            left: tungstenCol * boxWidth,
            top: tungstenRow * boxHeight,
            width: boxWidth,
            height: boxHeight,
            zIndex: 2,
            pointerEvents: "auto",
            cursor: "pointer",
          }}
          title="Tungsten (W)"
        />
        {/* Tin overlay */}
        <TinSnSingle
          style={{
            position: "absolute",
            left: snCol * boxWidth,
            top: snRow * boxHeight,
            width: boxWidth,
            height: boxHeight,
            zIndex: 2,
            pointerEvents: "auto",
            cursor: "pointer",
          }}
          title="Tin (Sn)"
        />
      </div>

      {/* MATERIAL ICONS ROW */}
      <div
        style={{
          marginTop: gap * 1.1,
          width: "100%",
          maxWidth: 1160,
          height: iconRowHeight,
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
