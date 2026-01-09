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
    padding: "0 0 48px 0", // subnav touches main nav
    boxSizing: "border-box"
  };

  // Full-bleed white banner touching main nav (matches ISP)
  const fullBleedBarStyle = {
    width: "100vw",
    marginLeft: "calc(50% - 50vw)",
    marginRight: "calc(50% - 50vw)",
    marginTop: 0,
    marginBottom: 8
  };

  // Row between the two navs for AFC/NFC logos; centered vertically with equal margins
  const logoRowStyle = {
    display: "grid",
    gridTemplateColumns: showAfcNfcLogos ? "1fr 1fr" : "1fr",
    alignItems: "center",
    justifyItems: "center",
    minHeight: "120px",
    marginTop: "10px",
    marginBottom: "10px",
    width: "100%"
  };

  const gridWrapStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: isMobile ? 14 : 18,
    alignItems: "start",
    justifyItems: "center",
    marginTop: isMobile ? 12 : 14
  };

  // ISP-matching divisions row (transparent, no white bar)
  function DivisionsRow() {
    if (activeCategory !== "hueforge" || !showFilterBar) return null;
    return (
      <nav className="isp-subnav-row" aria-label="NFL divisions filter">
        {FILTER_BUTTONS.map((btn) => {
          const isActive =
            btn.type === "conference" ? conference === btn.value : division === btn.value;

          const className = `isp-subnav-btn${isActive ? " active" : ""}`;

          return (
            <button
              key={`${btn.type}-${btn.value}`}
              className={className}
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
      </nav>
    );
  }

  function LogoRow() {
    if (activeCategory !== "hueforge" || !showAfcNfcLogos) return null;
    return (
      <div style={logoRowStyle}>
        <ConferenceLogo
          logo={AFC_LOGO}
          style={{ height: isMobile ? 72 : 106 }} // updated to 106 on desktop, 72 on mobile
          onClick={() => {
            setConference("AFC");
            setDivision("ALL");
            setShowFilterBar(true);
          }}
        />
        <ConferenceLogo
          logo={NFC_LOGO}
          style={{ height: isMobile ? 72 : 106 }} // updated to 106 on desktop, 72 on mobile
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
          style={{ height: isMobile ? 72 : 96 }} // single centered logo unchanged
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
    <div className="three-d-printing-page" style={pageStyle}>
      {/* Category tabs inside full-bleed white banner to match ISP */}
      <div className="nav-card-mid" style={fullBleedBarStyle}>
        <nav className="isp-section-tabs" aria-label="3D Printing categories">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            const className = `isp-tab-btn${isActive ? " active" : ""}`;
            return (
              <button
                key={cat.value}
                className={className}
                onClick={() => {
                  setActiveCategory(cat.value);
                  setConference("ALL");
                  setDivision("ALL");
                  setShowFilterBar(true); // keep visible
                }}
                aria-current={isActive ? "page" : undefined}
                tabIndex={0}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logo rows and divisions row */}
      <LogoRow />
      <CenteredLogo />
      <DivisionsRow />

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

  // Derive image path from team id if no image provided in data
  const imgSrc = print.image || `/images/prints/nfl/${print.id}.png`;

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
        src={imgSrc}
        alt={print.name}
        style={{ width: imageSize, height: "auto", display: "block" }}
      />
      <div style={nameStyle}>{print.name}</div>
    </div>
  );
}
