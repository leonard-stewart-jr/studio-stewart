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
  // Category tab ("hueforge", ...)
  const [activeCategory, setActiveCategory] = useState("hueforge");
  // Conference filter: "ALL", "AFC", "NFC"
  const [conference, setConference] = useState("ALL");
  // Division filter: "ALL", "EAST", "WEST", "SOUTH", "NORTH"
  const [division, setDivision] = useState("ALL");
  // Show filter bar after logo click
  const [showFilterBar, setShowFilterBar] = useState(false);

  const gridRef = useRef(null);
  const [columns, setColumns] = useState(4);

  // Mobile check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function handleResize() {
      const win = typeof window !== "undefined" ? window : {};
      setColumns(win.innerWidth < 700 ? 1 : win.innerWidth < 1100 ? 2 : 4);
      setIsMobile(win.innerWidth < 700);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Filtering Logic ---
  let gridData = [];
  let showAfcNfcLogos = false;
  let showCenteredLogo = null;

  if (activeCategory === "hueforge") {
    if (conference === "ALL" && division === "ALL") {
      showAfcNfcLogos = true;
      gridData = [];
      for (let divIdx = 0; divIdx < 4; divIdx++) {
        for (let teamIdx = 0; teamIdx < 4; teamIdx++) {
          gridData.push(
            DIVISIONS.AFC[divisionNames[divIdx]][teamIdx],
            DIVISIONS.NFC[divisionNames[divIdx]][teamIdx]
          );
        }
      }
    } else if (conference !== "ALL" && division === "ALL") {
      showCenteredLogo = conference === "AFC" ? AFC_LOGO : NFC_LOGO;
      gridData = divisionNames.flatMap(div =>
        DIVISIONS[conference][div]
      );
    } else if (conference === "ALL" && division !== "ALL") {
      gridData = [
        ...DIVISIONS.AFC[division],
        ...DIVISIONS.NFC[division]
      ];
    } else if (conference !== "ALL" && division !== "ALL") {
      showCenteredLogo = conference === "AFC" ? AFC_LOGO : NFC_LOGO;
      gridData = DIVISIONS[conference][division];
    }
  }

  let filteredPrints = [];
  if (activeCategory === "lithophanes") filteredPrints = [LITHOPHANE];
  if (activeCategory === "custom cad") filteredPrints = [CUSTOM_CAD];
  if (activeCategory === "more") filteredPrints = [MORE_SAMPLE];

  // --- Conference/Division Filter Row ---
  function renderFilterRow() {
    if (activeCategory !== "hueforge" || !showFilterBar) return null;
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          margin: "0 auto",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        {FILTER_BUTTONS.map(btn => {
          const isActive =
            btn.type === "conference"
              ? conference === btn.value
              : division === btn.value;
          return (
            <span
              key={btn.value}
              role="button"
              tabIndex={0}
              aria-label={btn.label}
              onClick={() => {
                if (btn.type === "conference") {
                  setConference(btn.value);
                  if (btn.value === "ALL") setDivision("ALL");
                } else {
                  setDivision(btn.value);
                }
              }}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  if (btn.type === "conference") {
                    setConference(btn.value);
                    if (btn.value === "ALL") setDivision("ALL");
                  } else {
                    setDivision(btn.value);
                  }
                }
              }}
              style={{
                fontFamily: "coolvetica, sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: isActive ? "#e6dbb9" : "#bcbcb6",
                background: "none",
                border: "none",
                boxShadow: "none",
                padding: "4px 18px",
                borderRadius: "6px",
                cursor: "pointer",
                outline: "none",
                transition: "color 0.17s, background 0.17s",
                userSelect: "none",
                textDecoration: isActive ? "underline" : "none",
                textUnderlineOffset: "3px",
                textDecorationThickness: "1.3px",
                opacity: isActive ? 1 : 0.8,
                position: "relative"
              }}
            >
              {btn.label}
            </span>
          );
        })}
      </div>
    );
  }

  // AFC/NFC logo row above filter/text
  function renderLogoRow() {
    if (activeCategory !== "hueforge" || !showAfcNfcLogos) return null;
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "120px",
          margin: "40px auto 0 auto",
        }}
      >
        <ConferenceLogo
          logo={AFC_LOGO}
          style={{
            position: "static"
          }}
          rotate={0}
          onClick={() => {
            setConference("AFC");
            setDivision("ALL");
            setShowFilterBar(true);
          }}
        />
        <ConferenceLogo
          logo={NFC_LOGO}
          style={{
            position: "static"
          }}
          rotate={0}
          onClick={() => {
            setConference("NFC");
            setDivision("ALL");
            setShowFilterBar(true);
          }}
        />
      </div>
    );
  }

  // Centered logo above grid for single conference/division view
  function renderCenteredLogo() {
    if (activeCategory !== "hueforge" || !showCenteredLogo) return null;
    return (
      <div style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        marginTop: "40px",
        marginBottom: "0px",
      }}>
        <ConferenceLogo
          logo={showCenteredLogo}
          style={{
            position: "static",
            margin: "0 auto",
            display: "block"
          }}
          rotate={0}
          onClick={() => {
            setConference("ALL");
            setDivision("ALL");
            setShowFilterBar(false);
          }}
        />
      </div>
    );
  }

  // Main Render
  return (
    <main style={{
      width: "100%",
      minHeight: "100vh",
      background: "#f9f9f7",
      paddingTop: 0,
    }}>
      {/* Sticky Main Category Nav */}
      <div className="nav-card nav-card-mid">
        <nav className="isp-section-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`isp-tab-btn${activeCategory === cat.value ? " active" : ""}`}
              onClick={() => {
                setActiveCategory(cat.value);
                setConference("ALL");
                setDivision("ALL");
                setShowFilterBar(false);
              }}
              aria-current={activeCategory === cat.value ? "page" : undefined}
              tabIndex={0}
            >
              {cat.label}
            </button>
          ))}
        </nav>
      </div>
      <section style={{
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
        padding: "0 24px 80px 24px",
        position: "relative",
      }}>
        {/* AFC/NFC logo row */}
        {renderLogoRow()}
        {/* Centered logo for filtered view */}
        {renderCenteredLogo()}
        {/* Conference/Division filter row - styled text/buttons, not nav */}
        {renderFilterRow()}
        <div
          ref={gridRef}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(columns, gridData.length)}, minmax(220px, 1fr))`,
            gap: "38px",
            justifyItems: "center",
            alignItems: "center",
            width: "100%",
            minHeight: 320,
            margin: showAfcNfcLogos && !showFilterBar ? "40px auto 0 auto" : "0px auto 0 auto",
            position: "relative"
          }}
        >
          {/* HUEFORGE GRID */}
          {activeCategory === "hueforge" && gridData.map((item, idx) => {
            if (!item) return <div key={`empty-${idx}`} />;
            return (
              <PrintCard
                key={item.id}
                print={{
                  ...item,
                  image: `/images/prints/nfl/${item.id}.png`,
                  name: `${item.name} Set`
                }}
                isMobile={isMobile}
              />
            );
          })}
          {/* Other categories */}
          {activeCategory !== "hueforge" && filteredPrints.map(print => (
            <PrintCard key={print.id} print={print} isMobile={isMobile} />
          ))}
          {activeCategory !== "hueforge" && filteredPrints.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                color: "#bbb",
                fontSize: 20,
                letterSpacing: "0.04em",
                marginTop: 48,
                opacity: 0.7,
              }}
            >
              No prints yet in this category.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// --- Conference Logo as Image ---
function ConferenceLogo({ logo, style, onClick, rotate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <img
      src={logo.image}
      alt={logo.name}
      draggable={false}
      style={{
        width: hovered ? 136 : 124,
        height: hovered ? 136 : 124,
        objectFit: "contain",
        opacity: hovered ? 0.19 : 1,
        cursor: "pointer",
        userSelect: "none",
        transition: "all 0.18s",
        filter: "drop-shadow(0 2px 8px rgba(32,32,32,0.13))",
        transform: `rotate(${rotate || 0}deg)`,
        ...style
      }}
      tabIndex={0}
      role="button"
      aria-label={`Filter by ${logo.name}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onClick(); }}
    />
  );
}

// --- Print Card Component ---
function PrintCard({ print, isMobile }) {
  const [hovered, setHovered] = useState(false);

  // Use smaller card size for mobile
  const cardSize = isMobile ? 180 : hovered ? 320 : 288;
  const imageSize = isMobile ? "80%" : hovered ? "100%" : "90%";

  return (
    <div
      className="print-card"
      style={{
        width: "100%",
        maxWidth: cardSize,
        aspectRatio: "1 / 1",
        background: "#fcfcfa",
        borderRadius: 0,
        boxShadow: "0 2px 18px rgba(32,32,32,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.18s, max-width 0.18s",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      aria-label={print.name}
    >
      {/* Print Image */}
      <img
        src={print.image}
        alt={print.name}
        style={{
          maxWidth: imageSize,
          maxHeight: imageSize,
          objectFit: "contain",
          display: "block",
          margin: "0 auto",
          opacity: hovered ? 0.12 : 1,
          transition: "opacity 0.18s, max-width 0.18s, max-height 0.18s",
          pointerEvents: "none",
          userSelect: "none",
        }}
        draggable={false}
      />
      {/* Hover text overlay, centered */}
      {hovered && (
        <div style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#888",
          fontWeight: 700,
          fontSize: isMobile ? 15 : 21,
          fontFamily: "coolvetica, sans-serif",
          letterSpacing: ".04em",
          opacity: 1,
          pointerEvents: "none",
          userSelect: "none",
          textTransform: "uppercase",
          margin: isMobile ? 14 : 20,
        }}>
          {print.name}
        </div>
      )}
    </div>
  );
}
