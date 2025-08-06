import { useState, useEffect, useRef } from "react";

// --- NFL DIVISION DATA ---
const DIVISIONS = {
  AFC: {
    EAST: [
      { id: "bills", name: "Buffalo Bills" },
      { id: "dolphins", name: "Miami Dolphins" },
      { id: "patriots", name: "New England Patriots" },
      { id: "jets", name: "New York Jets" }
    ],
    NORTH: [
      { id: "ravens", name: "Baltimore Ravens" },
      { id: "bengals", name: "Cincinnati Bengals" },
      { id: "browns", name: "Cleveland Browns" },
      { id: "steelers", name: "Pittsburgh Steelers" }
    ],
    SOUTH: [
      { id: "texans", name: "Houston Texans" },
      { id: "colts", name: "Indianapolis Colts" },
      { id: "jaguars", name: "Jacksonville Jaguars" },
      { id: "titans", name: "Tennessee Titans" }
    ],
    WEST: [
      { id: "broncos", name: "Denver Broncos" },
      { id: "chiefs", name: "Kansas City Chiefs" },
      { id: "raiders", name: "Las Vegas Raiders" },
      { id: "chargers", name: "Los Angeles Chargers" }
    ]
  },
  NFC: {
    EAST: [
      { id: "cowboys", name: "Dallas Cowboys" },
      { id: "giants", name: "New York Giants" },
      { id: "eagles", name: "Philadelphia Eagles" },
      { id: "commanders", name: "Washington Commanders" }
    ],
    NORTH: [
      { id: "bears", name: "Chicago Bears" },
      { id: "lions", name: "Detroit Lions" },
      { id: "packers", name: "Green Bay Packers" },
      { id: "vikings", name: "Minnesota Vikings" }
    ],
    SOUTH: [
      { id: "buccaneers", name: "Tampa Bay Buccaneers" },
      { id: "falcons", name: "Atlanta Falcons" },
      { id: "panthers", name: "Carolina Panthers" },
      { id: "saints", name: "New Orleans Saints" }
    ],
    WEST: [
      { id: "49ers", name: "San Francisco 49ers" },
      { id: "seahawks", name: "Seattle Seahawks" },
      { id: "rams", name: "Los Angeles Rams" },
      { id: "cardinals", name: "Arizona Cardinals" }
    ]
  }
};

const divisionNames = ["EAST", "WEST", "SOUTH", "NORTH"];
const CATEGORIES = [
  { label: "HUEFORGE", value: "hueforge" },
  { label: "LITHOPHANES", value: "lithophanes" },
  { label: "CUSTOM CAD", value: "custom cad" },
  { label: "MORE", value: "more" }
];

const AFC_LOGO = {
  id: "afc-logo",
  image: "/images/prints/nfl/afc.png",
  name: "AFC Conference"
};
const NFC_LOGO = {
  id: "nfc-logo",
  image: "/images/prints/nfl/nfc.png",
  name: "NFC Conference"
};

const LITHOPHANE = {
  id: "litho-family",
  image: "/images/prints/litho-family.png",
  name: "Family Portrait Lithophane",
  category: "lithophanes"
};
const CUSTOM_CAD = {
  id: "chessboard",
  image: "/images/prints/chessboard.png",
  name: "Custom Chessboard",
  category: "custom cad"
};
const MORE_SAMPLE = {
  id: "misc-keychain",
  image: "/images/prints/keychain.png",
  name: "Studio Keychain",
  category: "more"
};

const FILTERS = [
  { label: "ALL", value: "ALL" },
  { label: "AFC", value: "AFC" },
  { label: "NFC", value: "NFC" }
];

export default function ThreeDPrinting() {
  const [activeCategory, setActiveCategory] = useState("hueforge");
  // nflConference: "ALL", "AFC", "NFC"
  const [nflConference, setNflConference] = useState("ALL");
  // nflDivision: "ALL", or one of divisionNames
  const [nflDivision, setNflDivision] = useState("ALL");
  const [gridWidth, setGridWidth] = useState(0);
  const gridRef = useRef(null);

  // Responsive columns
  const [columns, setColumns] = useState(4);
  useEffect(() => {
    function handleResize() {
      const win = typeof window !== "undefined" ? window : {};
      setColumns(win.innerWidth < 700 ? 1 : win.innerWidth < 1100 ? 2 : 4);
      setGridWidth(gridRef.current ? gridRef.current.offsetWidth : 0);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Build grid data
  let gridData = [];
  let showAfcNfcLogos = false;
  let showCenteredLogo = null;
  let showDivisionText = null;

  if (activeCategory === "hueforge") {
    if (nflConference === "ALL") {
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
    } else if (nflDivision === "ALL") {
      showCenteredLogo = nflConference === "AFC" ? AFC_LOGO : NFC_LOGO;
      gridData = divisionNames.flatMap(div =>
        DIVISIONS[nflConference][div]
      );
    } else {
      showCenteredLogo = nflConference === "AFC" ? AFC_LOGO : NFC_LOGO;
      showDivisionText = nflDivision;
      gridData = DIVISIONS[nflConference][nflDivision];
    }
  }

  // Filtering for other categories
  let filteredPrints = [];
  if (activeCategory === "lithophanes") filteredPrints = [LITHOPHANE];
  if (activeCategory === "custom cad") filteredPrints = [CUSTOM_CAD];
  if (activeCategory === "more") filteredPrints = [MORE_SAMPLE];

  // AFC/NFC logo absolute positioning between columns
  function getLogoPos(col, gridWidth, columns) {
    if (!gridWidth || columns < 2) return { left: "50%", transform: "translate(-50%,0)" };
    const colWidth = gridWidth / columns;
    // Column 1.5 for AFC, 3.5 for NFC, then shift right as requested
    const afcLeft = colWidth * 0.5 + colWidth * 0.5 + 20;
    const nfcLeft = colWidth * 2.5 + colWidth * 0.5 + 32;
    return {
      afc: { left: afcLeft, transform: "translate(-50%,0)" },
      nfc: { left: nfcLeft, transform: "translate(-50%,0)" }
    };
  }
  const logoPos = getLogoPos(1.5, gridWidth, columns);

  // Subnav filter bar (only AFC/NFC selected)
  function renderDivisionSubnav() {
    if (activeCategory !== "hueforge") return null;
    if (nflConference !== "AFC" && nflConference !== "NFC") return null;
    return (
      <div className="nav-card nav-card-bot" style={{
        position: "sticky",
        top: 120,
        zIndex: 1200,
        width: "100vw",
        background: "#fff",
        boxShadow: "0 2px 6px 0 rgba(0,0,0,0.08)",
        minHeight: 26,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <nav className="isp-subnav-row" style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 14,
          background: "transparent",
          padding: 0,
          minHeight: 26,
        }}>
          <button
            className={`isp-subnav-btn${nflDivision === "ALL" ? " active" : ""}`}
            onClick={() => setNflDivision("ALL")}
            style={{
              fontFamily: "coolvetica, sans-serif",
              fontWeight: 700,
              fontSize: "10px",
              letterSpacing: ".04em",
              textTransform: "uppercase",
              color: nflDivision === "ALL" ? "#e6dbb9" : "#d4d4ce"
            }}
            onMouseEnter={e => e.target.style.color = "#191919"}
            onMouseLeave={e => e.target.style.color = nflDivision === "ALL" ? "#e6dbb9" : "#d4d4ce"}
          >
            ALL
          </button>
          {divisionNames.map(div => (
            <button
              key={div}
              className={`isp-subnav-btn${nflDivision === div ? " active" : ""}`}
              onClick={() => setNflDivision(div)}
              style={{
                fontFamily: "coolvetica, sans-serif",
                fontWeight: 700,
                fontSize: "10px",
                letterSpacing: ".04em",
                textTransform: "uppercase",
                color: nflDivision === div ? "#e6dbb9" : "#d4d4ce"
              }}
              onMouseEnter={e => e.target.style.color = "#191919"}
              onMouseLeave={e => e.target.style.color = nflDivision === div ? "#e6dbb9" : "#d4d4ce"}
            >
              {div}
            </button>
          ))}
        </nav>
      </div>
    );
  }

  // Division label for division filter
  function renderDivisionLabel() {
    if (!showDivisionText) return null;
    return (
      <div
        style={{
          fontFamily: "coolvetica, sans-serif",
          fontWeight: 700,
          fontSize: "10px",
          letterSpacing: ".04em",
          textTransform: "uppercase",
          color: "#888",
          margin: "0 auto 18px auto",
          textAlign: "center",
          width: "100%",
        }}
      >
        {showDivisionText}
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
      <div className="nav-card nav-card-mid" style={{
        position: "sticky",
        top: 76,
        zIndex: 1200,
        width: "100vw",
        background: "#fff",
        boxShadow: "0 3px 14px 0 rgba(0,0,0,0.10)",
        minHeight: 44,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <nav className="isp-section-tabs" style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 22,
          background: "transparent",
          padding: 0,
          minHeight: 44,
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`isp-tab-btn${activeCategory === cat.value ? " active" : ""}`}
              onClick={() => {
                setActiveCategory(cat.value);
                setNflConference("ALL");
                setNflDivision("ALL");
              }}
              style={{
                background: "none",
                border: "none",
                color: activeCategory === cat.value ? "#e6dbb9" : "#dededb",
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                padding: "9px 20px 6px 20px",
                margin: "0 12px",
                cursor: activeCategory === cat.value ? "default" : "pointer",
                textDecoration: activeCategory === cat.value ? "underline" : "none",
                textUnderlineOffset: "3px",
                textDecorationThickness: "1.5px",
                outline: "none",
                borderRadius: 0,
                transition: "color 0.18s, text-decoration 0.18s",
                boxShadow: "none",
                fontFamily: "coolvetica, sans-serif",
              }}
              aria-current={activeCategory === cat.value ? "page" : undefined}
              tabIndex={0}
            >
              {cat.label}
            </button>
          ))}
        </nav>
      </div>
      {/* Conference Filter: ONLY show if AFC/NFC selected */}
      {activeCategory === "hueforge" && nflConference === "ALL" && (
        // AFC/NFC logos above grid, no filter bar
        <></>
      )}
      {activeCategory === "hueforge" && nflConference !== "ALL" && (
        <div className="nav-card nav-card-bot" style={{
          position: "sticky",
          top: 120,
          zIndex: 1200,
          width: "100vw",
          background: "#fff",
          boxShadow: "0 2px 6px 0 rgba(0,0,0,0.08)",
          minHeight: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <nav className="isp-subnav-row" style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 14,
            background: "transparent",
            padding: 0,
            minHeight: 26,
          }}>
            <button
              className={`isp-subnav-btn${nflDivision === "ALL" ? " active" : ""}`}
              onClick={() => setNflDivision("ALL")}
              style={{
                fontFamily: "coolvetica, sans-serif",
                fontWeight: 700,
                fontSize: "10px",
                letterSpacing: ".04em",
                textTransform: "uppercase",
                color: nflDivision === "ALL" ? "#e6dbb9" : "#d4d4ce"
              }}
              onMouseEnter={e => e.target.style.color = "#191919"}
              onMouseLeave={e => e.target.style.color = nflDivision === "ALL" ? "#e6dbb9" : "#d4d4ce"}
            >
              ALL
            </button>
            {divisionNames.map(div => (
              <button
                key={div}
                className={`isp-subnav-btn${nflDivision === div ? " active" : ""}`}
                onClick={() => setNflDivision(div)}
                style={{
                  fontFamily: "coolvetica, sans-serif",
                  fontWeight: 700,
                  fontSize: "10px",
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  color: nflDivision === div ? "#e6dbb9" : "#d4d4ce"
                }}
                onMouseEnter={e => e.target.style.color = "#191919"}
                onMouseLeave={e => e.target.style.color = nflDivision === div ? "#e6dbb9" : "#d4d4ce"}
              >
                {div}
              </button>
            ))}
          </nav>
        </div>
      )}
      {/* Print Grid Section */}
      <section style={{
        maxWidth: 1200,
        margin: showAfcNfcLogos ? "92px auto 0 auto" : "42px auto 0 auto",
        width: "100%",
        padding: "0 24px",
        position: "relative"
      }}>
        {/* AFC/NFC logo absolutely positioned above grid for ALL NFL view */}
        {activeCategory === "hueforge" && showAfcNfcLogos && columns === 4 && (
          <div style={{
            position: "absolute",
            top: -100, // Move up into the gap between nav and grid
            left: 0,
            width: "100%",
            height: 0,
            pointerEvents: "none",
            zIndex: 10,
          }}>
            <ConferenceLogo
              logo={AFC_LOGO}
              style={{
                position: "absolute",
                top: 0,
                ...logoPos.afc,
                zIndex: 10,
                pointerEvents: "auto",
              }}
              rotate={-90}
              onClick={() => {
                setNflConference("AFC");
                setNflDivision("ALL");
              }}
            />
            <ConferenceLogo
              logo={NFC_LOGO}
              style={{
                position: "absolute",
                top: 0,
                ...logoPos.nfc,
                zIndex: 10,
                pointerEvents: "auto",
              }}
              onClick={() => {
                setNflConference("NFC");
                setNflDivision("ALL");
              }}
            />
          </div>
        )}
        {/* AFC/NFC logo centered above grid for filtered view */}
        {activeCategory === "hueforge" && showCenteredLogo && (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <ConferenceLogo
              logo={showCenteredLogo}
              style={{
                position: "static",
                margin: "0 auto",
                display: "block"
              }}
              rotate={showCenteredLogo === AFC_LOGO ? -90 : 0}
              onClick={() => {
                setNflConference("ALL");
                setNflDivision("ALL");
              }}
            />
          </div>
        )}
        {/* Division label above grid */}
        {activeCategory === "hueforge" && renderDivisionLabel()}
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
            margin: "0 auto",
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
                  name: `${item.name} NFL Circle Logo`
                }}
              />
            );
          })}
          {/* Other categories */}
          {activeCategory !== "hueforge" && filteredPrints.map(print => (
            <PrintCard key={print.id} print={print} />
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

// --- Conference Logo as Image Only, Absolutely Positioned ---
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
function PrintCard({ print }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="print-card"
      style={{
        width: "100%",
        maxWidth: hovered ? 320 : 288,
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
          maxWidth: hovered ? "102%" : "92%",
          maxHeight: hovered ? "102%" : "92%",
          objectFit: "contain",
          display: "block",
          margin: "0 auto",
          opacity: hovered ? 0.22 : 1,
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
          color: "#191919",
          fontWeight: 700,
          fontSize: 21,
          fontFamily: "coolvetica, sans-serif",
          letterSpacing: ".04em",
          opacity: 1,
          pointerEvents: "none",
          userSelect: "none",
          background: "none",
          textTransform: "uppercase"
        }}>
          {print.name}
        </div>
      )}
    </div>
  );
}
