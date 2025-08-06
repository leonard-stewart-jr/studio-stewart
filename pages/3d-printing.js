import { useState } from "react";

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

// --- AFC/NFC LOGO CARD DATA ---
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

// --- ALL PRINTS (add non-hueforge samples at the end) ---
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

const CATEGORIES = [
  { label: "HUEFORGE", value: "hueforge" },
  { label: "LITHOPHANES", value: "lithophanes" },
  { label: "CUSTOM CAD", value: "custom cad" },
  { label: "MORE", value: "more" }
];

// --- Division List & AFC/NFC teams flat ---
const divisionNames = ["East", "North", "South", "West"];
const afcTeamsFlat = divisionNames.flatMap(div => DIVISIONS.AFC[div]);
const nfcTeamsFlat = divisionNames.flatMap(div => DIVISIONS.NFC[div]);

export default function ThreeDPrinting() {
  const [activeCategory, setActiveCategory] = useState("hueforge");
  const [conference, setConference] = useState(null); // "AFC", "NFC" or null
  const [division, setDivision] = useState("All"); // "All" or division name

  // --- Handle Grid Data for Hueforge ---
  let gridData = [];
  if (activeCategory === "hueforge") {
    // Only show grid with AFC/NFC logo cards at top row (positions 2 and 4)
    // If no conference selected, show logo cards at top, then all teams in division order
    // If conference selected, show only that conference teams and logo, and division subnav

    // On mobile, logo cards centered at top
    const isMobile = typeof window !== "undefined" && window.innerWidth < 700;

    // --- Build filtered team list based on conference/division ---
    let teams = [];
    if (!conference) {
      // Show all teams, grouped by conference/division, AFC left, NFC right
      teams = {
        AFC: divisionNames.map(div => DIVISIONS.AFC[div]),
        NFC: divisionNames.map(div => DIVISIONS.NFC[div])
      };
    } else {
      // Only show selected conference
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

    // --- Compose grid: 4 columns desktop, 2/1 mobile ---
    // Top row: logo cards in columns 2 and 4 (desktop), centered on mobile
    gridData = [];

    if (!conference) {
      // Top row: AFC/NFC logos in columns 2 and 4
      gridData.push(null, AFC_LOGO, null, NFC_LOGO);
      // Now fill teams, 2 columns AFC, 2 columns NFC, each 2x2 block = division
      for (let divIdx = 0; divIdx < 4; divIdx++) {
        // AFC division: fills cols 0/1, NFC division: fills cols 2/3
        for (let teamIdx = 0; teamIdx < 4; teamIdx++) {
          // Row: 2 rows per division
          if (teamIdx < 2) {
            // First two teams of each division
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
      // Show only conference logo at top, then teams for selected division
      // Top row: logo card in col 2 (AFC) or col 4 (NFC) desktop, centered on mobile
      if (isMobile) {
        gridData.push(conference === "AFC" ? AFC_LOGO : NFC_LOGO);
      } else {
        gridData.push(
          conference === "AFC" ? AFC_LOGO : null,
          null,
          conference === "NFC" ? NFC_LOGO : null,
          null
        );
      }
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

  // --- Filtering for other categories ---
  let filteredPrints = [];
  if (activeCategory === "lithophanes") filteredPrints = [LITHOPHANE];
  if (activeCategory === "custom cad") filteredPrints = [CUSTOM_CAD];
  if (activeCategory === "more") filteredPrints = [MORE_SAMPLE];

  // --- Responsive columns ---
  const columns = typeof window !== "undefined"
    ? window.innerWidth < 700 ? 1 : window.innerWidth < 1100 ? 2 : 4
    : 4;

  // --- Division Subnav for AFC/NFC ---
  function renderDivisionSubnav() {
    if (!conference) return null;
    return (
      <div className="nav-card nav-card-bot" style={{
        position: "sticky",
        top: 120, // below main nav and subnav
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

  // --- Main Render ---
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
      }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(220px, 1fr))`,
            gap: "38px",
            justifyItems: "center",
            alignItems: "center",
            width: "100%",
            minHeight: 320,
            margin: "0 auto",
          }}
        >
          {/* HUEFORGE GRID */}
          {activeCategory === "hueforge" && gridData.map((item, idx) => {
            if (!item) return <div key={`empty-${idx}`} />;
            // AFC/NFC logo cards
            if (item.id === "afc-logo" || item.id === "nfc-logo") {
              return (
                <LogoCard
                  key={item.id}
                  logo={item}
                  active={conference === item.name.split(" ")[0]}
                  onClick={() => {
                    setConference(item.name.split(" ")[0]);
                    setDivision("All");
                  }}
                />
              );
            }
            // Team cards
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

// --- Logo Card Component ---
function LogoCard({ logo, active, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      style={{
        width: "100%",
        maxWidth: 272,
        aspectRatio: "1 / 1",
        background: "#fcfcfa",
        borderRadius: 0,
        boxShadow: active
          ? "0 6px 24px rgba(32,32,32,0.22)"
          : "0 2px 18px rgba(32,32,32,0.14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.18s",
        cursor: "pointer",
      }}
      aria-label={`Filter by ${logo.name}`}
    >
      <img
        src={logo.image}
        alt={logo.name}
        style={{
          maxWidth: "65%",
          maxHeight: "65%",
          objectFit: "contain",
          display: "block",
          margin: "0 auto",
          opacity: active ? 0.68 : 1,
          transition: "opacity 0.18s",
          pointerEvents: "none",
          userSelect: "none",
        }}
        draggable={false}
      />
      <div style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 22,
        textAlign: "center",
        color: "#888",
        fontWeight: 700,
        fontSize: 19,
        fontFamily: "coolvetica, sans-serif",
        letterSpacing: ".04em",
        opacity: 1,
        pointerEvents: "none",
        userSelect: "none",
      }}>
        {logo.name}
      </div>
    </div>
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
        maxWidth: 272,
        aspectRatio: "1 / 1",
        background: "#fcfcfa",
        borderRadius: 0,
        boxShadow: "0 2px 18px rgba(32,32,32,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.18s",
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
          maxWidth: "82%",
          maxHeight: "82%",
          objectFit: "contain",
          display: "block",
          margin: "0 auto",
          opacity: hovered ? 0.7 : 1,
          transition: "opacity 0.18s",
          pointerEvents: "none",
          userSelect: "none",
        }}
        draggable={false}
      />
      {/* Team Name (below image, bold, gray, Coolvetica) */}
      <div style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 22,
        textAlign: "center",
        color: "#888",
        fontWeight: 700,
        fontSize: 19,
        fontFamily: "coolvetica, sans-serif",
        letterSpacing: ".04em",
        opacity: 1,
        pointerEvents: "none",
        userSelect: "none",
      }}>
        {print.name}
      </div>
    </div>
  );
}
