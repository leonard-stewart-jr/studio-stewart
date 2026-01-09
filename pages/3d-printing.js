import { useState, useEffect, useRef } from "react";

import {
  DIVISIONS,
  divisionNames,
  CATEGORIES,
  AFC_LOGO,
  NFC_LOGO,
  LITHOPHANE,
  CUSTOM_CAD,
  MORE_SAMPLE,
  FILTER_BUTTONS
} from "../data/nfl-logos";

export default function ThreeDPrinting() {
  // Categories: "hueforge" (NFL logos), "lithophanes", "custom cad", "more"
  const [activeCategory, setActiveCategory] = useState("hueforge");

  // Filters
  const [conference, setConference] = useState("ALL"); // ALL, AFC, NFC
  const [division, setDivision] = useState("ALL");     // ALL, EAST, WEST, SOUTH, NORTH

  // Show filter bar by default on page load
  const [showFilterBar, setShowFilterBar] = useState(true);

  // Grid controls
  const gridRef = useRef(null);
  const [columns, setColumns] = useState(4);

  // Responsive
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function handleResize() {
      const w = typeof window !== "undefined" ? window.innerWidth : 1200;
      setColumns(w < 700 ? 2 : w < 1100 ? 2 : 4);
      setIsMobile(w < 700);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Build grid data and logo states
  let gridData = [];
  let showAfcNfcLogos = false; // show both logos row (AFC + NFC)
  let showCenteredLogo = null; // show one centered logo (AFC or NFC)

  if (activeCategory === "hueforge") {
    if (conference === "ALL" && division === "ALL") {
      // Show both logos above the filter bar and interleave AFC/NFC teams in the grid
      showAfcNfcLogos = true;
      const afcTeams = [];
      const nfcTeams = [];
      for (let divIdx = 0; divIdx < 4; divIdx++) {
        for (let teamIdx = 0; teamIdx < 4; teamIdx++) {
          afcTeams.push(DIVISIONS.AFC[divisionNames[divIdx]][teamIdx]);
          nfcTeams.push(DIVISIONS.NFC[divisionNames[divIdx]][teamIdx]);
        }
      }
      gridData = [];
      for (let i = 0; i < afcTeams.length; i++) {
        gridData.push([afcTeams[i], nfcTeams[i]]);
      }
    } else if (conference !== "ALL" && division === "ALL") {
      // A conference selected, all divisions
      showCenteredLogo = conference === "AFC" ? AFC_LOGO : NFC_LOGO;
      gridData = divisionNames.flatMap((div) => DIVISIONS[conference][div]);
    } else if (conference === "ALL" && division !== "ALL") {
      // All conferences, specific division
      gridData = [
        ...DIVISIONS.AFC[division],
        ...DIVISIONS.NFC[division]
      ];
    } else if (conference !== "ALL" && division !== "ALL") {
      // Specific conference and division
      showCenteredLogo = conference === "AFC" ? AFC_LOGO : NFC_LOGO;
      gridData = DIVISIONS[conference][division];
    }
  }

  // Non-Hueforge categories
  let filteredPrints = [];
  if (activeCategory === "lithophanes") filteredPrints = [LITHOPHANE];
  if (activeCategory === "custom cad") filteredPrints = [CUSTOM_CAD];
  if (activeCategory === "more") filteredPrints = [MORE_SAMPLE];

  // Styles
  const pageStyle = {
    width: "min(1600px, 95vw)",
    margin: "0 auto",
    padding: "0 0 48px 0", // remove top padding so the subnav touches the main nav
    boxSizing: "border-box"
  };

  const fullBleedBarStyle = {
    width: "100vw",
    marginLeft: "calc(50% - 50vw)",
    marginRight: "calc(50% - 50vw)",
    marginTop: 0,         // override .nav-card-mid negative margin
    marginBottom: 8
  };

  const categoryTabsStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: isMobile ? 16 : 26,
    padding: "0",
    minHeight: "44px",
    height: "44px",
    margin: "0",
    background: "transparent"
  };

  const categoryBtnBase = {
    background: "none",
    border: "none",
    fontFamily: "Inter, sans-serif",
    fontWeight: 280,
    fontSize: isMobile ? 13 : 14,
    letterSpacing: ".035em",
    color: "#6c6c6a",
    textTransform: "uppercase",
    padding: "6px 14px",
    margin: "0 8px",
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
    textDecoration: "none",
    outline: "none",
    borderRadius: 0,
    transition: "color 0.18s, font-weight 0.16s",
    position: "relative"
  };

  const logoRowStyle = {
    display: "grid",
    gridTemplateColumns: showAfcNfcLogos ? "1fr 1fr" : "1fr",
    alignItems: "center",
    justifyItems: "center",
    minHeight: "120px",           // dedicated logo row height
    marginTop: "-6px",            // nudge up toward the horizontal line
    marginBottom: isMobile ? "6px" : "4px",
    width: "100%"
  };

  const filterRowStyle = {
    display: activeCategory === "hueforge" && showFilterBar ? "flex" : "none",
    justifyContent: "center",
    alignItems: "center",
    gap: isMobile ? 10 : 16,
    minHeight: "40px",
    height: "40px",
    margin: "0",
    background: "transparent",
    width: "100%"
  };

  const filterBtnBase = {
    background: "none",
    border: "none",
    fontFamily: "Inter, sans-serif", // Inter for consistency
    fontWeight: 280,
    fontSize: isMobile ? "13px" : "15px", // +2px on desktop
    letterSpacing: ".06em",
    textTransform: "uppercase",
    padding: "6px 18px",
    margin: "0 4px",
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
    textDecoration: "none",
    outline: "none",
    borderRadius: "6px",
    boxShadow: "none",
    transition: "color 0.18s, font-weight 0.16s, text-decoration 0.18s",
    position: "relative",
    color: "#bcbcb6"
  };

  const gridWrapStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: isMobile ? 14 : 18,
    alignItems: "start",
    justifyItems: "center",
    marginTop: isMobile ? 12 : 14
  };

  function FilterRow() {
    if (activeCategory !== "hueforge" || !showFilterBar) return null;
    // No white bar wrapper here (divisions row stays transparent)
    return (
      <div style={filterRowStyle}>
        {FILTER_BUTTONS.map((btn) => {
          const isActive =
            btn.type === "conference" ? conference === btn.value : division === btn.value;

          const style = {
            ...filterBtnBase,
            color: isActive ? "#e6dbb9" : filterBtnBase.color,
            textDecoration: isActive ? "underline" : "none",
            textUnderlineOffset: "3px",
            textDecorationThickness: "1.5px",
            fontWeight: isActive ? 350 : 280
          };

          return (
            <button
              key={`${btn.type}-${btn.value}`}
              style={style}
              onClick={() => {
                if (btn.type === "conference") {
                  setConference(btn.value);
                  if (btn.value === "ALL") setDivision("ALL");
                } else {
                  setDivision(btn.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (btn.type === "conference") {
                    setConference(btn.value);
                    if (btn.value === "ALL") setDivision("ALL");
                  } else {
                    setDivision(btn.value);
                  }
                }
              }}
              aria-current={isActive ? "page" : undefined}
            >
              {btn.label}
            </button>
          );
        })}
      </div>
    );
  }

  function LogoRow() {
    if (activeCategory !== "hueforge" || !showAfcNfcLogos) return null;
    return (
      <div style={logoRowStyle}>
        <ConferenceLogo
          logo={AFC_LOGO}
          style={{ height: isMobile ? 66 : 84 }}
          onClick={() => {
            setConference("AFC");
            setDivision("ALL");
            setShowFilterBar(true);
          }}
        />
        <ConferenceLogo
          logo={NFC_LOGO}
          style={{ height: isMobile ? 66 : 84 }}
          onClick={() => {
            setConference("NFC");
            setDivision("ALL");
            setShowFilterBar(true);
          }}
        />
      </div>
    );
  }

  function CenteredLogo() {
    if (activeCategory !== "hueforge" || !showCenteredLogo) return null;
    return (
      <div style={{ ...logoRowStyle, gridTemplateColumns: "1fr" }}>
        <ConferenceLogo
          logo={showCenteredLogo}
          style={{ height: isMobile ? 72 : 96 }}
          onClick={() => {
            // Clicking the centered logo returns to ALL
            setConference("ALL");
            setDivision("ALL");
            setShowFilterBar(true);
          }}
        />
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Category tabs inside full-bleed white bar touching the main nav */}
      <div className="nav-card-mid" style={fullBleedBarStyle}>
        <nav style={categoryTabsStyle} aria-label="3D Printing categories">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setActiveCategory(cat.value);
                  setConference("ALL");
                  setDivision("ALL");
                  setShowFilterBar(true); // persist visible bar
                }}
                aria-current={isActive ? "page" : undefined}
                tabIndex={0}
                style={{
                  ...categoryBtnBase,
                  fontSize: isActive ? (isMobile ? 14 : 16) : categoryBtnBase.fontSize,
                  fontWeight: isActive ? 350 : 280,
                  color: isActive ? "#e6dbb9" : "#6c6c6a",
                  textDecoration: isActive ? "underline" : "none",
                  textUnderlineOffset: "3px",
                  textDecorationThickness: "1.5px"
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logo rows and filter row */}
      <LogoRow />
      <CenteredLogo />
      <FilterRow />

      {/* Grid */}
      <div ref={gridRef} style={gridWrapStyle}>
        {activeCategory === "hueforge" && conference === "ALL" && division === "ALL" && isMobile
          ? gridData.map(([afc, nfc], idx) => (
              <div key={`pair-${idx}`} style={{ display: "contents" }}>
                {afc && <PrintCard print={afc} isMobile={isMobile} />}
                {nfc && <PrintCard print={nfc} isMobile={isMobile} />}
              </div>
            ))
          : activeCategory === "hueforge" &&
            conference === "ALL" &&
            division === "ALL" &&
            !isMobile
            ? gridData.flat().map((item, idx) => {
                if (!item) return null;
                return <PrintCard key={`all-${idx}`} print={item} isMobile={isMobile} />;
              })
          : activeCategory === "hueforge" && gridData.map((item, idx) => {
              if (!item) return null;
              return <PrintCard key={`hf-${idx}`} print={item} isMobile={isMobile} />;
            })}

        {activeCategory !== "hueforge" && filteredPrints.map((print, idx) => (
          <PrintCard key={`other-${idx}`} print={print} isMobile={isMobile} />
        ))}

        {activeCategory !== "hueforge" && filteredPrints.length === 0 && (
          <div
            style={{
              gridColumn: `span ${columns}`,
              textAlign: "center",
              color: "#888",
              fontFamily: "Inter, sans-serif",
              fontWeight: 280,
              fontSize: isMobile ? 13 : 14
            }}
          >
            No prints yet in this category.
          </div>
        )}
      </div>
    </div>
  );
}

function ConferenceLogo({ logo, style, onClick }) {
  const [hovered, setHovered] = useState(false);
  const base = {
    display: "block",
    height: style?.height || 84,
    width: "auto",
    cursor: "pointer",
    filter: hovered ? "drop-shadow(0 6px 18px rgba(0,0,0,0.12))" : "drop-shadow(0 3px 12px rgba(0,0,0,0.10))",
    transition: "filter 0.18s, transform 0.18s",
    transform: hovered ? "translateY(-2px)" : "none",
    userSelect: "none"
  };
  return (
    <img
      src={logo.image}
      alt={logo.name}
      style={base}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      tabIndex={0}
      aria-label={`Filter by ${logo.name}`}
    />
  );
}

function PrintCard({ print, isMobile }) {
  const [hovered, setHovered] = useState(false);
  const cardSize = isMobile ? 120 : hovered ? 320 : 288;
  const imageSize = isMobile ? "70%" : hovered ? "100%" : "90%";

  const cardStyle = {
    width: cardSize,
    height: cardSize,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    borderRadius: 8,
    boxShadow: hovered ? "0 6px 18px rgba(0,0,0,0.12)" : "0 3px 12px rgba(0,0,0,0.10)",
    border: hovered ? "1px solid #e6dbb9" : "1px solid #eee",
    transition: "box-shadow 0.18s, border-color 0.18s, transform 0.18s",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden"
  };

  const nameStyle = {
    position: "absolute",
    left: 10,
    bottom: 8,
    padding: "4px 10px",
    background: "rgba(0,0,0,0.35)",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
    fontWeight: 280,
    fontSize: 12,
    letterSpacing: ".06em",
    textTransform: "uppercase",
    borderRadius: 4,
    userSelect: "none",
    opacity: hovered ? 1 : 0,
    transition: "opacity 0.18s"
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      aria-label={print.name}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setHovered((h) => !h); }}
      title={print.name}
    >
      <img
        src={print.image}
        alt={print.name}
        style={{ width: imageSize, height: "auto", display: "block" }}
      />
      <div style={nameStyle}>{print.name}</div>
    </div>
  );
}
