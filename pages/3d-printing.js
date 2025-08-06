import { useState, useEffect, useRef } from "react";

// --- NFL DIVISION DATA ---
const DIVISIONS = {
  AFC: {
    East: [
      { id: "bills", name: "Buffalo Bills" },
      { id: "dolphins", name: "Miami Dolphins" },
      { id: "patriots", name: "New England Patriots" },
      { id: "jets", name: "New York Jets" }
    ],
    North: [
      { id: "ravens", name: "Baltimore Ravens" },
      { id: "bengals", name: "Cincinnati Bengals" },
      { id: "browns", name: "Cleveland Browns" },
      { id: "steelers", name: "Pittsburgh Steelers" }
    ],
    South: [
      { id: "texans", name: "Houston Texans" },
      { id: "colts", name: "Indianapolis Colts" },
      { id: "jaguars", name: "Jacksonville Jaguars" },
      { id: "titans", name: "Tennessee Titans" }
    ],
    West: [
      { id: "broncos", name: "Denver Broncos" },
      { id: "chiefs", name: "Kansas City Chiefs" },
      { id: "raiders", name: "Las Vegas Raiders" },
      { id: "chargers", name: "Los Angeles Chargers" }
    ]
  },
  NFC: {
    East: [
      { id: "cowboys", name: "Dallas Cowboys" },
      { id: "giants", name: "New York Giants" },
      { id: "eagles", name: "Philadelphia Eagles" },
      { id: "commanders", name: "Washington Commanders" }
    ],
    North: [
      { id: "bears", name: "Chicago Bears" },
      { id: "lions", name: "Detroit Lions" },
      { id: "packers", name: "Green Bay Packers" },
      { id: "vikings", name: "Minnesota Vikings" }
    ],
    South: [
      { id: "buccaneers", name: "Tampa Bay Buccaneers" },
      { id: "falcons", name: "Atlanta Falcons" },
      { id: "panthers", name: "Carolina Panthers" },
      { id: "saints", name: "New Orleans Saints" }
    ],
    West: [
      { id: "49ers", name: "San Francisco 49ers" },
      { id: "seahawks", name: "Seattle Seahawks" },
      { id: "rams", name: "Los Angeles Rams" },
      { id: "cardinals", name: "Arizona Cardinals" }
    ]
  }
};

const divisionNames = ["East", "North", "South", "West"];
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

export default function ThreeDPrinting() {
  const [activeCategory, setActiveCategory] = useState("hueforge");
  const [conference, setConference] = useState(null); // "AFC", "NFC" or null
  const [division, setDivision] = useState("All"); // "All" or division name
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

  // --- Build filtered team list based on conference/division ---
  let gridData = [];
  if (activeCategory === "hueforge") {
    let teams = [];
    if (!conference) {
      teams = {
        AFC: divisionNames.map(div => DIVISIONS.AFC[div]),
        NFC: divisionNames.map(div => DIVISIONS.NFC[div])
      };
    } else {
      if (division === "All") {
        teams = {
          [conference]: divisionNames.map(div => DIVISIONS[conference][div])
        };
      } else {
        teams = {
          [conference]: [DIVISIONS[conference][division]]
        };
      }
    }

    // Compose grid: 4 columns desktop
    gridData = [];
    if (!conference) {
      // Fill teams, 2 columns AFC, 2 columns NFC, each 2x2 block = division
      for (let divIdx = 0; divIdx < 4; divIdx++) {
        // AFC division: fills cols 0/1, NFC division: fills cols 2/3
        for (let teamIdx = 0; teamIdx < 4; teamIdx++) {
          if (teamIdx < 2) {
            gridData.push(
              teams.AFC[divIdx][teamIdx],
              teams.AFC[divIdx][teamIdx + 2],
              teams.NFC[divIdx][teamIdx],
              teams.NFC[divIdx][teamIdx + 2]
            );
          }
        }
      }
    } else {
      // Fill teams for selected division(s)
      const divs = division === "All" ? divisionNames : [division];
      for (let divName of divs) {
        const divTeams = DIVISIONS[conference][divName];
        for (let team of divTeams) {
          gridData.push(team);
        }
      }
    }
  }

  // Filtering for other categories
  let filteredPrints = [];
  if (activeCategory === "lithophanes") filteredPrints = [LITHOPHANE];
  if (activeCategory === "custom cad") filteredPrints = [CUSTOM_CAD];
  if (activeCategory === "more") filteredPrints = [MORE_SAMPLE];

  // Division Subnav for AFC/NFC
  function renderDivisionSubnav() {
    if (!conference) return null;
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
            className={`isp-subnav-btn${division === "All" ? " active" : ""}`}
            onClick={() => setDivision("All")}
            style={{ fontFamily: "coolvetica, sans-serif", fontWeight: 700 }}
          >All</button>
          {divisionNames.map(div => (
            <button
              key={div}
              className={`isp-subnav-btn${division === div ? " active" : ""}`}
              onClick={() => setDivision(div)}
              style={{ fontFamily: "coolvetica, sans-serif", fontWeight: 700 }}
            >
              {div}
            </button>
          ))}
        </nav>
      </div>
    );
  }

  // Conference Logos absolute position calculation
  function getLogoPos(col, gridWidth, columns) {
    // col 1.5: AFC, col 3.5: NFC
    if (!gridWidth || columns < 2) return { left: "50%", transform: "translate(-50%,0)" };
    const colWidth = gridWidth / columns;
    const afcLeft = colWidth * 1.5;
    const nfcLeft = colWidth * 3.5;
    return {
      afc: { left: afcLeft, transform: "translate(-50%,0)" },
      nfc: { left: nfcLeft, transform: "translate(-50%,0)" }
    };
  }
  const logoPos = getLogoPos(1.5, gridWidth, columns);

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
                setConference(null);
                setDivision("All");
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
      {/* Division Subnav: Only for Hueforge/AFC/NFC */}
      {activeCategory === "hueforge" && renderDivisionSubnav()}
      {/* Print Grid */}
      <section style={{
        maxWidth: 1200,
        margin: "42px auto 0 auto",
        width: "100%",
        padding: "0 24px",
        position: "relative"
      }}>
        <div
          ref={gridRef}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(220px, 1fr))`,
            gap: "38px",
            justifyItems: "center",
            alignItems: "center",
            width: "100%",
            minHeight: 320,
            margin: "0 auto",
            position: "relative"
          }}
        >
          {/* Absolutely positioned AFC/NFC logos at top row */}
          {activeCategory === "hueforge" && !conference && columns === 4 && (
            <>
              <ConferenceLogo
                logo={AFC_LOGO}
                style={{
                  position: "absolute",
                  top: -24,
                  ...logoPos.afc,
                  zIndex: 10,
                }}
                onClick={() => {
                  setConference("AFC");
                  setDivision("All");
                }}
                rotate={-90}
              />
              <ConferenceLogo
                logo={NFC_LOGO}
                style={{
                  position: "absolute",
                  top: -24,
                  ...logoPos.nfc,
                  zIndex: 10,
                }}
                onClick={() => {
                  setConference("NFC");
                  setDivision("All");
                }}
              />
            </>
          )}
          {/* On mobile, both logos centered at top */}
          {activeCategory === "hueforge" && !conference && columns < 4 && (
            <>
              <ConferenceLogo
                logo={AFC_LOGO}
                style={{
                  position: "absolute",
                  top: -24,
                  left: "50%",
                  transform: "translate(-70%,0)",
                  zIndex: 10,
                }}
                onClick={() => {
                  setConference("AFC");
                  setDivision("All");
                }}
                rotate={-90}
              />
              <ConferenceLogo
                logo={NFC_LOGO}
                style={{
                  position: "absolute",
                  top: -24,
                  left: "50%",
                  transform: "translate(20%,0)",
                  zIndex: 10,
                }}
                onClick={() => {
                  setConference("NFC");
                  setDivision("All");
                }}
              />
            </>
          )}
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
        width: hovered ? 124 : 112, // 10% bigger on hover
        height: hovered ? 124 : 112,
        objectFit: "contain",
        opacity: hovered ? 0.34 : 1,
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
        maxWidth: hovered ? 300 : 272, // 10% bigger
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
          maxWidth: hovered ? "92%" : "82%",
          maxHeight: hovered ? "92%" : "82%",
          objectFit: "contain",
          display: "block",
          margin: "0 auto",
          opacity: hovered ? 0.44 : 1, // Reduce opacity further
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
          fontSize: 21,
          fontFamily: "coolvetica, sans-serif",
          letterSpacing: ".04em",
          opacity: 1,
          pointerEvents: "none",
          userSelect: "none",
          background: "none"
        }}>
          {print.name}
        </div>
      )}
    </div>
  );
}
