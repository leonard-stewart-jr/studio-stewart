import React, { useState, useEffect, useRef } from "react";

import {
  DIVISIONS as NFL_DIVISIONS,
  divisionNames as NFL_divisionNames,
  AFC_LOGO,
  NFC_LOGO,
  LITHOPHANE,
  CUSTOM_CAD,
  MORE_SAMPLE,
  FILTER_BUTTONS as FILTER_BUTTONS_NFL
} from "../data/nfl-logos";

import {
  DIVISIONS as NBA_DIVISIONS,
  divisionNames as NBA_divisionNames,
  EAST_LOGO as NBA_EAST_LOGO,
  WEST_LOGO as NBA_WEST_LOGO,
  FILTER_BUTTONS as FILTER_BUTTONS_NBA
} from "../data/nba-logos";

// Local categories override — replace "NFL LOGOS" with "SPORTS" parent
const CATEGORIES = [
  { label: "SPORTS", value: "sports" },
  { label: "LITHOPHANES", value: "lithophanes" },
  { label: "CUSTOM CAD", value: "custom cad" },
  { label: "MORE", value: "more" }
];

export default function ThreeDPrinting() {
  // Categories: "sports" (NFL/NBA), "lithophanes", "custom cad", "more"
  const [activeCategory, setActiveCategory] = useState("sports");

  // For SPORTS: which league is selected (nfl | nba | mlb | nhl | ncaa)
  const [sportsOpen, setSportsOpen] = useState(false); // click-to-open dropbox
  const [currentLeague, setCurrentLeague] = useState("nfl"); // default to nfl

  // Filters
  const [conference, setConference] = useState("ALL"); // ALL, AFC/EAST, NFC/WEST (league mapped)
  const [division, setDivision] = useState("ALL"); // ALL or one of division keys

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

  // Reset sports dropdown when switching away from SPORTS
  useEffect(() => {
    if (activeCategory !== "sports") {
      setSportsOpen(false);
    }
  }, [activeCategory]);

  // Refs for placing the dropbox under the SPORTS tab
  const sportsBtnRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState(null);

  useEffect(() => {
    function updatePosition() {
      const btn = sportsBtnRef.current;
      if (!btn) {
        setDropdownPos(null);
        return;
      }
      const rect = btn.getBoundingClientRect();
      const left = rect.left + rect.width / 2;
      const top = rect.bottom + window.scrollY + 6; // slight gap
      setDropdownPos({ left, top, width: rect.width });
    }
    // Update when dropdown opens and on resize/scroll
    if (sportsOpen) updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [sportsOpen]);

  // Helper: current league data pointers
  const leagueIsNFL = activeCategory === "sports" && currentLeague === "nfl";
  const leagueIsNBA = activeCategory === "sports" && currentLeague === "nba";
  const leagueIsSupported = leagueIsNFL || leagueIsNBA;

  const LEAGUE_DIVISIONS = leagueIsNFL ? NFL_DIVISIONS : leagueIsNBA ? NBA_DIVISIONS : null;
  const LEAGUE_DIVISION_NAMES = leagueIsNFL ? NFL_divisionNames : leagueIsNBA ? NBA_divisionNames : [];
  const LEAGUE_FILTER_BUTTONS = leagueIsNFL ? FILTER_BUTTONS_NFL : leagueIsNBA ? FILTER_BUTTONS_NBA : [];
  const LEAGUE_CONFERENCE_LOGOS = leagueIsNFL ? [AFC_LOGO, NFC_LOGO] : leagueIsNBA ? [NBA_EAST_LOGO, NBA_WEST_LOGO] : [];

  // Build grid data and logo states
  let gridData = [];
  let showConferenceLogos = false; // show both conference logos when conference === 'ALL'
  let showCenteredLogo = null; // show one centered logo (AFC/NFC or EAST/WEST) when specific conference is chosen

  if (activeCategory === "sports" && leagueIsSupported) {
    if (conference === "ALL") {
      // Always show the conference logos row when conference === 'ALL'
      showConferenceLogos = true;

      if (division === "ALL") {
        // Interleave East/West teams across all divisions (zip by index)
        // Flatten East and West teams in canonical division order
        const eastDivs = leagueIsNFL ? Object.keys(LEAGUE_DIVISIONS.AFC) : Object.keys(LEAGUE_DIVISIONS.EAST);
        const westDivs = leagueIsNFL ? Object.keys(LEAGUE_DIVISIONS.NFC) : Object.keys(LEAGUE_DIVISIONS.WEST);

        // Build flat lists preserving division order
        const eastTeams = [];
        const westTeams = [];

        if (leagueIsNFL) {
          for (let d of eastDivs) {
            for (let t of LEAGUE_DIVISIONS.AFC[d]) eastTeams.push(t);
          }
          for (let d of westDivs) {
            for (let t of LEAGUE_DIVISIONS.NFC[d]) westTeams.push(t);
          }
        } else {
          // NBA: EAST and WEST keys
          for (let d of eastDivs) {
            for (let t of LEAGUE_DIVISIONS.EAST[d]) eastTeams.push(t);
          }
          for (let d of westDivs) {
            for (let t of LEAGUE_DIVISIONS.WEST[d]) westTeams.push(t);
          }
        }

        // Zip into pairs for the card grid layout used previously
        const length = Math.max(eastTeams.length, westTeams.length);
        gridData = [];
        for (let i = 0; i < length; i++) {
          gridData.push([eastTeams[i] || null, westTeams[i] || null]);
        }
      } else {
        // conference === ALL, specific division selected
        // For NFL divisions exist in both conferences under same keys.
        // For NBA, a division belongs to either EAST or WEST, so pick whichever contains it.
        if (leagueIsNFL) {
          gridData = [
            ...LEAGUE_DIVISIONS.AFC[division],
            ...LEAGUE_DIVISIONS.NFC[division]
          ];
        } else {
          // NBA: division may belong to EAST or WEST
          gridData = [
            ...(LEAGUE_DIVISIONS.EAST[division] || []),
            ...(LEAGUE_DIVISIONS.WEST[division] || [])
          ];
        }
      }
    } else {
      // Specific conference selected (AFC/NFC) or (EAST/WEST)
      showConferenceLogos = false;
      showCenteredLogo = (conference === "AFC" || conference === "EAST")
        ? LEAGUE_CONFERENCE_LOGOS[0]
        : LEAGUE_CONFERENCE_LOGOS[1];

      if (division === "ALL") {
        // Conference selected, all divisions for that conference
        if (leagueIsNFL) {
          // NFL: conference => AFC/NFC
          gridData = (conference === "AFC")
            ? Object.keys(LEAGUE_DIVISIONS.AFC).flatMap(div => LEAGUE_DIVISIONS.AFC[div])
            : Object.keys(LEAGUE_DIVISIONS.NFC).flatMap(div => LEAGUE_DIVISIONS.NFC[div]);
        } else {
          // NBA: conference => EAST/WEST
          gridData = (conference === "EAST")
            ? Object.keys(LEAGUE_DIVISIONS.EAST).flatMap(div => LEAGUE_DIVISIONS.EAST[div])
            : Object.keys(LEAGUE_DIVISIONS.WEST).flatMap(div => LEAGUE_DIVISIONS.WEST[div]);
        }
      } else {
        // Specific conference and division
        if (leagueIsNFL) {
          gridData = LEAGUE_DIVISIONS[conference][division];
        } else {
          // NBA: division may exist under the selected conference
          if (conference === "EAST") gridData = LEAGUE_DIVISIONS.EAST[division] || [];
          else gridData = LEAGUE_DIVISIONS.WEST[division] || [];
        }
      }
    }
  }

  // Non-sports categories
  let filteredPrints = [];
  if (activeCategory === "lithophanes") filteredPrints = [LITHOPHANE];
  if (activeCategory === "custom cad") filteredPrints = [CUSTOM_CAD];
  if (activeCategory === "more") filteredPrints = [MORE_SAMPLE];

  // Styles (kept from your existing file) — page container is relative so the dropbox can position absolute
  const pageStyle = {
    width: "min(1600px, 95vw)",
    margin: "0 auto",
    padding: "0 0 48px 0",
    boxSizing: "border-box",
    position: "relative" // important for absolute dropbox
  };

  const fullBleedBarStyle = {
    width: "100vw",
    marginLeft: "calc(50% - 50vw)",
    marginRight: "calc(50% - 50vw)",
    marginTop: 0,
    marginBottom: 8
  };

  const logoRowStyle = {
    display: "grid",
    gridTemplateColumns: showConferenceLogos ? "1fr 1fr" : "1fr",
    alignItems: "center",
    justifyItems: "center",
    minHeight: "120px",
    marginTop: "28px",
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

  // Basic accessible button renderer for categories
  function CategoriesRow() {
    return (
      <div className="isp-section-tabs" style={fullBleedBarStyle}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.value;
          const className = `isp-tab-btn${isActive ? " active" : ""}`;
          return (
            <button
              key={cat.value}
              className={className}
              onClick={() => {
                setActiveCategory(cat.value);
                // reset sports dropdown state when switching categories
                if (cat.value !== "sports") {
                  setSportsOpen(false);
                } else {
                  // if user clicks SPORTS category, open dropbox
                  setSportsOpen(true);
                }
                // reset filters
                setConference("ALL");
                setDivision("ALL");
                setShowFilterBar(true);
              }}
              tabIndex={0}
              aria-current={isActive ? "page" : undefined}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Vertical dropbox for SPORTS (click-to-open)
  function SportsDropdown() {
    // only show when sportsOpen and activeCategory === 'sports'
    if (!sportsOpen || activeCategory !== "sports") return null;

    // leagues list — display vertically, same font size as isp-tab-btn by reusing class
    const leagues = [
      { key: "nfl", label: "NFL", enabled: true },
      { key: "nba", label: "NBA", enabled: true },
      { key: "mlb", label: "MLB", enabled: false },
      { key: "nhl", label: "NHL", enabled: false },
      { key: "ncaa", label: "NCAA", enabled: false }
    ];

    // Dropdown positioning computed from dropdownPos state (which uses sportsBtnRef)
    const width = 180;
    const left = dropdownPos ? dropdownPos.left - width / 2 : "50%";
    const top = dropdownPos ? dropdownPos.top : 120;

    const dropdownStyle = {
      position: "absolute",
      left: typeof left === "number" ? left : left,
      top: top,
      transform: "translateX(0)",
      zIndex: 2200,
      background: "#fff",
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      borderRadius: 6,
      padding: 6,
      width: width,
      display: "flex",
      flexDirection: "column",
      gap: 6,
      alignItems: "stretch",
      pointerEvents: "auto"
    };

    const itemStyle = {
      background: "transparent",
      border: "none",
      padding: "10px 12px",
      textAlign: "left",
      fontSize: 12,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      cursor: "pointer",
      color: "#6c6c6a",
      fontFamily: "Inter, sans-serif",
      fontWeight: 280
    };

    const disabledStyle = {
      opacity: 0.5,
      cursor: "not-allowed"
    };

    return (
      <div style={dropdownStyle} role="menu" aria-label="Sports leagues">
        {leagues.map((l) => {
          const isActive = currentLeague === l.key && activeCategory === "sports";
          return (
            <button
              key={l.key}
              ref={l.key === "nfl" ? sportsBtnRef : undefined}
              style={{
                ...itemStyle,
                ...(isActive ? { color: "#e6dbb9", fontWeight: 350 } : {}),
                ...(!l.enabled ? disabledStyle : {})
              }}
              onClick={() => {
                if (!l.enabled) return;
                setCurrentLeague(l.key);
                setConference("ALL");
                setDivision("ALL");
                setShowFilterBar(true);
                setSportsOpen(false); // close dropdown after selection
              }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && l.enabled) {
                  setCurrentLeague(l.key);
                  setConference("ALL");
                  setDivision("ALL");
                  setShowFilterBar(true);
                  setSportsOpen(false);
                }
              }}
              aria-current={isActive ? "page" : undefined}
              aria-disabled={!l.enabled}
              title={!l.enabled ? "In progress" : undefined}
            >
              {l.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Division / conference filter row (varies per league)
  function DivisionsRow() {
    if (!leagueIsSupported || !showFilterBar) return null;
    const buttons = LEAGUE_FILTER_BUTTONS;
    return (
      <div className="isp-subnav-row" aria-label="Filters">
        {buttons.map((btn) => {
          const isActive = btn.type === "conference" ? conference === btn.value : division === btn.value;
          const className = `isp-subnav-btn${isActive ? " active" : ""}`;

          return (
            <button
              key={btn.value}
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
      </div>
    );
  }

  // Conference logos row (two logos when conference === ALL)
  function LogoRow() {
    if (!leagueIsSupported || !showConferenceLogos) return null;
    const leftLogo = LEAGUE_CONFERENCE_LOGOS[0];
    const rightLogo = LEAGUE_CONFERENCE_LOGOS[1];

    return (
      <div style={logoRowStyle}>
        {/* left */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ConferenceLogo
            logo={leftLogo}
            style={{ height: 84 }}
            onClick={() => {
              if (leagueIsNFL) setConference("AFC");
              else setConference("EAST");
              setDivision("ALL");
              setShowFilterBar(true);
            }}
            league={currentLeague}
          />
        </div>

        {/* right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ConferenceLogo
            logo={rightLogo}
            style={{ height: 84 }}
            onClick={() => {
              if (leagueIsNFL) setConference("NFC");
              else setConference("WEST");
              setDivision("ALL");
              setShowFilterBar(true);
            }}
            league={currentLeague}
          />
        </div>
      </div>
    );
  }

  // Centered logo when specific conference selected
  function CenteredLogo() {
    if (!leagueIsSupported || !showCenteredLogo) return null;
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
        <ConferenceLogo
          logo={showCenteredLogo}
          style={{ height: 92 }}
          onClick={() => {
            setConference("ALL");
            setDivision("ALL");
            setShowFilterBar(true);
          }}
          league={currentLeague}
        />
      </div>
    );
  }

  // Render logic for the grid items
  function renderGridItems() {
    // If conference === ALL and division === ALL and we constructed zip pairs
    if (leagueIsSupported && conference === "ALL" && division === "ALL" && Array.isArray(gridData) && gridData.length > 0 && Array.isArray(gridData[0])) {
      // mobile: show two-card rows
      if (isMobile) {
        return gridData.map(([left, right], idx) => (
          <div key={`row-${idx}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
            <div>{left ? <PrintCard print={left} isMobile={isMobile} league={currentLeague} /> : null}</div>
            <div>{right ? <PrintCard print={right} isMobile={isMobile} league={currentLeague} /> : null}</div>
          </div>
        ));
      }
      // desktop: flatten pairs into individual items
      return gridData.flat().map((item, idx) => {
        if (!item) return null;
        return <PrintCard key={`card-${idx}`} print={item} isMobile={isMobile} league={currentLeague} />;
      });
    }

    // Other cases: gridData is flat array of items
    if (leagueIsSupported && Array.isArray(gridData)) {
      return gridData.map((item, idx) => {
        if (!item) return null;
        return <PrintCard key={`card-${idx}`} print={item} isMobile={isMobile} league={currentLeague} />;
      });
    }

    // Non-sports categories
    if (activeCategory !== "sports") {
      if (filteredPrints.length === 0) {
        return <div style={{ padding: 24, color: "#777" }}>No prints yet in this category.</div>;
      }
      return filteredPrints.map((p, i) => <PrintCard key={`p-${i}`} print={p} isMobile={isMobile} league={activeCategory} />);
    }

    return null;
  }

  return (
    <div className="three-d-printing-page" style={pageStyle}>
      {/* Category tabs (full-bleed white banner like ISP) */}
      <div style={fullBleedBarStyle} className="nav-card nav-card-mid">
        <CategoriesRow />
        {/* Sports toggle helper (small controller that sits below the tabs) */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
          {activeCategory === "sports" && (
            <button
              ref={sportsBtnRef}
              className="isp-tab-btn"
              onClick={() => setSportsOpen((s) => !s)}
              aria-expanded={sportsOpen}
              aria-controls="sports-dropdown"
              style={{ marginTop: 6 }}
            >
              Sports {sportsOpen ? "▴" : "▾"}
            </button>
          )}
        </div>
      </div>

      {/* Vertical dropdown (absolutely positioned overlay) */}
      <SportsDropdown />

      {/* Sports area: conference logos + filters */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "min(1200px, 95%)" }}>
          <LogoRow />
          <CenteredLogo />
          <DivisionsRow />
        </div>
      </div>

      {/* Grid */}
      <div style={{ width: "min(1200px, 95%)", margin: "0 auto", paddingTop: 8 }}>
        <div ref={gridRef} style={gridWrapStyle}>
          {renderGridItems()}
        </div>
      </div>
    </div>
  );
}

// ConferenceLogo component (clickable image)
function ConferenceLogo({ logo, style = {}, onClick, league }) {
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
  const src = logo?.image || "";
  return (
    <img
      src={src}
      alt={logo?.name || "Conference Logo"}
      style={{ ...base, ...style }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick && onClick()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (onClick) onClick();
        }
      }}
      tabIndex={0}
      aria-label={`Filter by ${logo?.name || "conference"}`}
    />
  );
}

// PrintCard component — derives image path based on league
function PrintCard({ print, isMobile, league }) {
  const [hovered, setHovered] = useState(false);
  const cardSize = isMobile ? 120 : hovered ? 320 : 288;
  const imageSize = isMobile ? "70%" : hovered ? "100%" : "90%";

  // Determine base image folder and extension from league
  let baseFolder = "nfl";
  let ext = "png";
  if (league === "nba") {
    baseFolder = "nba";
    ext = "png"; // changed to png per your request
  } else if (league === "sports") {
    // fallback
    baseFolder = "prints";
    ext = "png";
  } else if (league === "lithophanes" || league === "custom cad" || league === "more") {
    // if the data item provides a full image path, use it
    baseFolder = "";
    ext = "";
  }

  // Derive image path from print.id or print.image
  const imgSrc = print.image
    ? print.image
    : baseFolder
      ? `/images/prints/${baseFolder}/${print.id}.${ext}`
      : "";

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
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setHovered((h) => !h);
      }}
      title={print.name}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={print.name}
          style={{
            width: imageSize,
            height: "auto",
            display: "block",
            objectFit: "contain",
            transition: "width 0.18s, height 0.18s"
          }}
        />
      ) : (
        <div style={{ padding: 12, color: "#666" }}>{print.name}</div>
      )}

      <div style={nameStyle}>{print.name}</div>
    </div>
  );
}
