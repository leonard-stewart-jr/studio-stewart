import { useState } from "react";

// ---- Sample Data ----
const nflTeams = [
  { id: "bears", name: "Chicago Bears" },
  { id: "packers", name: "Green Bay Packers" },
  { id: "vikings", name: "Minnesota Vikings" },
  { id: "lions", name: "Detroit Lions" },
  { id: "cowboys", name: "Dallas Cowboys" },
  { id: "giants", name: "New York Giants" },
  { id: "eagles", name: "Philadelphia Eagles" },
  { id: "commanders", name: "Washington Commanders" },
  { id: "49ers", name: "San Francisco 49ers" },
  { id: "seahawks", name: "Seattle Seahawks" },
  { id: "rams", name: "Los Angeles Rams" },
  { id: "cardinals", name: "Arizona Cardinals" },
  { id: "buccaneers", name: "Tampa Bay Buccaneers" },
  { id: "falcons", name: "Atlanta Falcons" },
  { id: "panthers", name: "Carolina Panthers" },
  { id: "saints", name: "New Orleans Saints" },
  { id: "ravens", name: "Baltimore Ravens" },
  { id: "steelers", name: "Pittsburgh Steelers" },
  { id: "browns", name: "Cleveland Browns" },
  { id: "bengals", name: "Cincinnati Bengals" },
  { id: "chiefs", name: "Kansas City Chiefs" },
  { id: "broncos", name: "Denver Broncos" },
  { id: "raiders", name: "Las Vegas Raiders" },
  { id: "chargers", name: "Los Angeles Chargers" },
  { id: "bills", name: "Buffalo Bills" },
  { id: "dolphins", name: "Miami Dolphins" },
  { id: "patriots", name: "New England Patriots" },
  { id: "jets", name: "New York Jets" },
  { id: "colts", name: "Indianapolis Colts" },
  { id: "jaguars", name: "Jacksonville Jaguars" },
  { id: "titans", name: "Tennessee Titans" },
  { id: "texans", name: "Houston Texans" },
];

const SAMPLE_PRINTS = [
  // HUEFORGE (NFL logos)
  ...nflTeams.map(team => ({
    id: `nfl-${team.id}`,
    image: `/images/prints/nfl/${team.id}.png`,
    name: `${team.name} NFL Circle Logo`,
    category: "hueforge"
  })),
  // LITHOPHANES (just one for now)
  {
    id: "litho-family",
    image: "/images/prints/litho-family.png",
    name: "Family Portrait Lithophane",
    category: "lithophanes"
  },
  // CUSTOM CAD
  {
    id: "chessboard",
    image: "/images/prints/chessboard.png",
    name: "Custom Chessboard",
    category: "custom cad"
  },
  // MORE
  {
    id: "misc-keychain",
    image: "/images/prints/keychain.png",
    name: "Studio Keychain",
    category: "more"
  }
];

// ---- Category Tabs ----
const CATEGORIES = [
  { label: "HUEFORGE", value: "hueforge" },
  { label: "LITHOPHANES", value: "lithophanes" },
  { label: "CUSTOM CAD", value: "custom cad" },
  { label: "MORE", value: "more" }
];

export default function ThreeDPrinting() {
  const [activeCategory, setActiveCategory] = useState("hueforge");

  // Filter prints based on active category
  const filteredPrints = SAMPLE_PRINTS.filter(
    (p) => p.category === activeCategory
  );

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#f9f9f7",
        paddingTop: 0,
      }}
    >
      {/* Sticky Category Nav Tabs */}
      <div
        className="nav-card nav-card-mid"
        style={{
          position: "sticky",
          top: 76, // below main header
          zIndex: 1200,
          width: "100vw",
          background: "#fff",
          boxShadow: "0 3px 14px 0 rgba(0,0,0,0.10)",
          minHeight: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <nav
          className="isp-section-tabs"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 22,
            background: "transparent",
            padding: 0,
            minHeight: 44,
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`isp-tab-btn${activeCategory === cat.value ? " active" : ""}`}
              onClick={() => setActiveCategory(cat.value)}
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
              }}
              aria-current={activeCategory === cat.value ? "page" : undefined}
              tabIndex={0}
            >
              {cat.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Print Grid */}
      <section
        style={{
          maxWidth: 1200,
          margin: "42px auto 0 auto",
          width: "100%",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "38px",
            justifyItems: "center",
            alignItems: "center",
            width: "100%",
            minHeight: 320,
            margin: "0 auto",
          }}
        >
          {filteredPrints.map((print) => (
            <PrintCard key={print.id} print={print} />
          ))}

          {/* If no prints in category, show placeholder */}
          {filteredPrints.length === 0 && (
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

// ---- Print Card ----
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
        border: "2px solid #e6dbb9",
        borderRadius: 18,
        boxShadow: "0 2px 18px rgba(32,32,32,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.18s, border-color 0.18s",
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
          filter: hovered ? "brightness(0.85)" : "none",
          transition: "filter 0.18s",
          pointerEvents: "none",
          userSelect: "none",
        }}
        draggable={false}
      />
      {/* Hover Overlay */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            background: "rgba(32,32,32,0.74)",
            color: "#e6dbb9",
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: ".04em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 18px",
            lineHeight: 1.22,
            opacity: 1,
            borderRadius: 18,
            transition: "opacity 0.18s",
            pointerEvents: "none",
            zIndex: 2,
            userSelect: "none",
          }}
        >
          {print.name}
        </div>
      )}
    </div>
  );
}
