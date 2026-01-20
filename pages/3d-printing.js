import React, { useState, useEffect, useRef } from "react";

import {
  DIVISIONS as NFL_DIVISIONS,
  AFC_LOGO,
  NFC_LOGO,
  LITHOPHANE,
  CUSTOM_CAD,
  MORE_SAMPLE,
  FILTER_BUTTONS as FILTER_BUTTONS_NFL
} from "../data/nfl-logos";

import {
  DIVISIONS as NBA_DIVISIONS,
  EAST_LOGO as NBA_EAST_LOGO,
  WEST_LOGO as NBA_WEST_LOGO,
  FILTER_BUTTONS as FILTER_BUTTONS_NBA
} from "../data/nba-logos";

// Local categories — "SPORTS" parent
const CATEGORIES = [
  { label: "SPORTS", value: "sports" },
  { label: "LITHOPHANES", value: "lithophanes" },
  { label: "CUSTOM CAD", value: "custom cad" },
  { label: "MORE", value: "more" }
];

export default function ThreeDPrinting() {
  const [activeCategory, setActiveCategory] = useState("sports");

  // SPORTS state
  const [sportsOpen, setSportsOpen] = useState(false);
  const [currentLeague, setCurrentLeague] = useState("nfl");

  // filters
  const [conference, setConference] = useState("ALL");
  const [division, setDivision] = useState("ALL");
  const [showFilterBar, setShowFilterBar] = useState(true);

  // responsive/grid
  const [columns, setColumns] = useState(4);
  const [isMobile, setIsMobile] = useState(false);
  const gridRef = useRef(null);

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

  // Reset dropdown when leaving sports
  useEffect(() => {
    if (activeCategory !== "sports") setSportsOpen(false);
  }, [activeCategory]);

  // refs for dropdown anchoring
  const sportsTabRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0, width: 180 });

  // compute dropdown position aligned under SPORTS tab
  useEffect(() => {
    function updatePosition() {
      const btn = sportsTabRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const width = 180;
      const left = rect.left + window.scrollX + rect.width / 2 - width / 2;
      const top = rect.bottom + window.scrollY + 6;
      setDropdownPos({ left, top, width });
    }
    if (sportsOpen) updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [sportsOpen]);

  // click outside & escape to close dropdown
  useEffect(() => {
    if (!sportsOpen) return;

    function handleMousedown(e) {
      const target = e.target;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        sportsTabRef.current &&
        !sportsTabRef.current.contains(target)
      ) {
        setSportsOpen(false);
      }
    }
    function handleKeydown(e) {
      if (e.key === "Escape") setSportsOpen(false);
    }
    document.addEventListener("mousedown", handleMousedown);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("mousedown", handleMousedown);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [sportsOpen]);

  // league helpers
  const leagueIsNFL = activeCategory === "sports" && currentLeague === "nfl";
  const leagueIsNBA = activeCategory === "sports" && currentLeague === "nba";
  const leagueIsSupported = leagueIsNFL || leagueIsNBA;

  const LEAGUE_DIVISIONS = leagueIsNFL ? NFL_DIVISIONS : leagueIsNBA ? NBA_DIVISIONS : null;
  const LEAGUE_FILTER_BUTTONS = leagueIsNFL ? FILTER_BUTTONS_NFL : leagueIsNBA ? FILTER_BUTTONS_NBA : [];
  const LEAGUE_CONFERENCE_LOGOS = leagueIsNFL ? [AFC_LOGO, NFC_LOGO] : leagueIsNBA ? [NBA_EAST_LOGO, NBA_WEST_LOGO] : [];

  // Build gridData depending on conference/division
  let gridData = [];
  let showConferenceLogos = false;
  let showCenteredLogo = null;

  if (activeCategory === "sports" && leagueIsSupported) {
    if (conference === "ALL") {
      showConferenceLogos = true;

      if (division === "ALL") {
        const eastDivs = leagueIsNFL ? Object.keys(LEAGUE_DIVISIONS.AFC) : Object.keys(LEAGUE_DIVISIONS.EAST);
        const westDivs = leagueIsNFL ? Object.keys(LEAGUE_DIVISIONS.NFC) : Object.keys(LEAGUE_DIVISIONS.WEST);

        const eastTeams = [];
        const westTeams = [];

        if (leagueIsNFL) {
          for (let d of eastDivs) for (let t of LEAGUE_DIVISIONS.AFC[d]) eastTeams.push(t);
          for (let d of westDivs) for (let t of LEAGUE_DIVISIONS.NFC[d]) westTeams.push(t);
        } else {
          for (let d of eastDivs) for (let t of LEAGUE_DIVISIONS.EAST[d]) eastTeams.push(t);
          for (let d of westDivs) for (let t of LEAGUE_DIVISIONS.WEST[d]) westTeams.push(t);
        }

        const length = Math.max(eastTeams.length, westTeams.length);
        gridData = [];
        for (let i = 0; i < length; i++) {
          gridData.push([eastTeams[i] || null, westTeams[i] || null]);
        }
      } else {
        if (leagueIsNFL) {
          gridData = [...LEAGUE_DIVISIONS.AFC[division], ...LEAGUE_DIVISIONS.NFC[division]];
        } else {
          gridData = [...(LEAGUE_DIVISIONS.EAST[division] || []), ...(LEAGUE_DIVISIONS.WEST[division] || [])];
        }
      }
    } else {
      showConferenceLogos = false;
      showCenteredLogo = (conference === "AFC" || conference === "EAST") ? LEAGUE_CONFERENCE_LOGOS[0] : LEAGUE_CONFERENCE_LOGOS[1];

      if (division === "ALL") {
        if (leagueIsNFL) {
          gridData = conference === "AFC"
            ? Object.keys(LEAGUE_DIVISIONS.AFC).flatMap(d => LEAGUE_DIVISIONS.AFC[d])
            : Object.keys(LEAGUE_DIVISIONS.NFC).flatMap(d => LEAGUE_DIVISIONS.NFC[d]);
        } else {
          gridData = conference === "EAST"
            ? Object.keys(LEAGUE_DIVISIONS.EAST).flatMap(d => LEAGUE_DIVISIONS.EAST[d])
            : Object.keys(LEAGUE_DIVISIONS.WEST).flatMap(d => LEAGUE_DIVISIONS.WEST[d]);
        }
      } else {
        if (leagueIsNFL) {
          gridData = LEAGUE_DIVISIONS[conference][division];
        } else {
          gridData = conference === "EAST" ? (LEAGUE_DIVISIONS.EAST[division] || []) : (LEAGUE_DIVISIONS.WEST[division] || []);
        }
      }
    }
  }

  // Non-sports categories fallback
  let filteredPrints = [];
  if (activeCategory === "lithophanes") filteredPrints = [LITHOPHANE];
  if (activeCategory === "custom cad") filteredPrints = [CUSTOM_CAD];
  if (activeCategory === "more") filteredPrints = [MORE_SAMPLE];

  // Styles (page-level)
  const pageStyle = {
    width: "min(1600px, 95vw)",
    margin: "0 auto",
    padding: "0 0 48px 0",
    boxSizing: "border-box",
    position: "relative"
  };

  const contentBleedContainer = (extraTop = 0) => ({
    width: "100vw",
    marginLeft: "calc(50% - 50vw)",
    marginRight: "calc(50% - 50vw)",
    boxSizing: "border-box",
    paddingLeft: 80,
    paddingRight: 80,
    marginTop: extraTop,
    background: "transparent"
  });

  const gridWrapStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: isMobile ? 14 : 18,
    alignItems: "start",
    justifyItems: "center",
    marginTop: isMobile ? 12 : 14
  };

  // Top tabs (categories) - render directly inside nav-card-mid center column (no inner wrapper/padding)
  function CategoriesRow() {
    return (
      <div className="isp-section-tabs" role="tablist" aria-label="3D printing categories">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.value;
          const className = `isp-tab-btn${isActive ? " active" : ""}`;
          const ref = cat.value === "sports" ? sportsTabRef : undefined;
          return (
            <button
              key={cat.value}
              ref={ref}
              className={className}
              onClick={() => {
                if (cat.value === "sports") {
                  setActiveCategory("sports");
                  setSportsOpen((s) => !s);
                } else {
                  setActiveCategory(cat.value);
                  setSportsOpen(false);
                }
                setConference("ALL");
                setDivision("ALL");
                setShowFilterBar(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (cat.value === "sports") {
                    setActiveCategory("sports");
                    setSportsOpen((s) => !s);
                  } else {
                    setActiveCategory(cat.value);
                    setSportsOpen(false);
                  }
                  setConference("ALL");
                  setDivision("ALL");
                  setShowFilterBar(true);
                }
              }}
              tabIndex={0}
              aria-current={isActive ? "page" : undefined}
              role="tab"
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Conference logos row (keeps same behavior)
  function LogoRow() {
    if (!leagueIsSupported || !showConferenceLogos) return null;
    const leftLogo = LEAGUE_CONFERENCE_LOGOS[0];
    const rightLogo = LEAGUE_CONFERENCE_LOGOS[1];

    return (
      <div style={{ display: "grid", gridTemplateColumns: showConferenceLogos ? "1fr 1fr" : "1fr", alignItems: "center", justifyItems: "center", minHeight: 120, marginTop: 28, marginBottom: 10, width: "100%" }}>
        <img
          src={leftLogo?.image}
          alt={leftLogo?.name}
          style={{ cursor: "pointer", height: leagueIsNFL ? 140 : 200, width: "auto" }}
          onClick={() => {
            if (leagueIsNFL) setConference("AFC");
            else setConference("EAST");
            setDivision("ALL");
            setShowFilterBar(true);
          }}
        />
        <img
          src={rightLogo?.image}
          alt={rightLogo?.name}
          style={{ cursor: "pointer", height: leagueIsNFL ? 140 : 200, width: "auto" }}
          onClick={() => {
            if (leagueIsNFL) setConference("NFC");
            else setConference("WEST");
            setDivision("ALL");
            setShowFilterBar(true);
          }}
        />
      </div>
    );
  }

  // Centered logo for a selected conference
  function CenteredLogo() {
    if (!leagueIsSupported || !showCenteredLogo) return null;
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
        <img
          src={showCenteredLogo?.image}
          alt={showCenteredLogo?.name}
          style={{ height: leagueIsNFL ? 140 : 200, width: "auto", cursor: "pointer" }}
          onClick={() => {
            setConference("ALL");
            setDivision("ALL");
            setShowFilterBar(true);
          }}
        />
      </div>
    );
  }

  // Subnav / Filters (kept below the logos)
  function DivisionsRow() {
    if (!leagueIsSupported || !showFilterBar) return null;
    return (
      <div className="isp-subnav-row" role="tablist" aria-label="League filters">
        {LEAGUE_FILTER_BUTTONS.map((btn) => {
          const isActive = btn.type === "conference" ? conference === btn.value : division === btn.value;
          return (
            <button
              key={btn.value}
              className={`isp-subnav-btn${isActive ? " active" : ""}`}
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
              tabIndex={0}
              role="tab"
            >
              {btn.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Sports dropdown anchored under SPORTS tab
  function SportsDropdown() {
    if (!sportsOpen || activeCategory !== "sports") return null;

    const leagues = [
      { key: "nfl", label: "NFL", enabled: true },
      { key: "nba", label: "NBA", enabled: true },
      { key: "mlb", label: "MLB", enabled: false },
      { key: "nhl", label: "NHL", enabled: false },
      { key: "ncaa", label: "NCAA", enabled: false }
    ];

    const dropdownStyle = {
      position: "absolute",
      left: dropdownPos.left,
      top: dropdownPos.top,
      zIndex: 2200,
      background: "#fff",
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      borderRadius: 6,
      padding: 6,
      width: dropdownPos.width,
      display: "flex",
      flexDirection: "column",
      gap: 6,
      alignItems: "stretch",
      pointerEvents: "auto"
    };

    const itemStyleBase = {
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

    const [tooltip, setTooltip] = useState({ visible: false, left: 0, top: 0, text: "" });

    function showTooltipFor(el, text) {
      if (!el) return;
      const r = el.getBoundingClientRect();
      setTooltip({
        visible: true,
        left: r.left + window.scrollX + r.width / 2,
        top: r.top + window.scrollY - 8,
        text
      });
    }
    function hideTooltip() {
      setTooltip({ visible: false, left: 0, top: 0, text: "" });
    }

    return (
      <>
        <div ref={dropdownRef} style={dropdownStyle}>
          {leagues.map((l) => {
            const isActive = currentLeague === l.key && activeCategory === "sports";
            const itemStyle = {
              ...itemStyleBase,
              ...(isActive ? { color: "#e6dbb9", fontWeight: 350 } : {}),
              ...(!l.enabled ? { opacity: 0.6 } : {})
            };

            return (
              <button
                key={l.key}
                style={itemStyle}
                onClick={() => {
                  if (!l.enabled) return;
                  setCurrentLeague(l.key);
                  setConference("ALL");
                  setDivision("ALL");
                  setShowFilterBar(true);
                  setSportsOpen(false);
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
                onMouseEnter={(e) => {
                  if (!l.enabled) {
                    showTooltipFor(e.currentTarget, "In progress");
                  }
                }}
                onMouseLeave={() => {
                  hideTooltip();
                }}
                onFocus={(e) => {
                  if (!l.enabled) showTooltipFor(e.currentTarget, "In progress");
                }}
                onBlur={() => hideTooltip()}
                tabIndex={0}
              >
                {l.label}
              </button>
            );
          })}
        </div>

        {typeof document !== "undefined" && (
          <div style={{ position: "absolute", left: tooltip.left, top: tooltip.top, transform: "translate(-50%, -100%)", pointerEvents: "none", zIndex: 2300 }}>
            {tooltip.visible && (
              <div style={{ background: "rgba(0,0,0,0.8)", color: "#fff", padding: "6px 10px", borderRadius: 6, fontSize: 12 }}>
                {tooltip.text}
              </div>
            )}
          </div>
        )}
      </>
    );
  }

  // PrintCard component
  function PrintCard({ print, isMobile, league }) {
    const [hovered, setHovered] = useState(false);
    const cardSize = isMobile ? 120 : hovered ? 320 : 288;
    const imageSize = isMobile ? "70%" : hovered ? "100%" : "90%";

    let baseFolder = "nfl";
    let ext = "png";
    if (league === "nba") {
      baseFolder = "nba";
      ext = "png";
    } else if (league === "sports") {
      baseFolder = "prints";
      ext = "png";
    } else if (league === "lithophanes" || league === "custom cad" || league === "more") {
      baseFolder = "";
      ext = "";
    }

    const imgSrc = print.image ? print.image : baseFolder ? `/images/prints/${baseFolder}/${print.id}.${ext}` : "";

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

    return (
      <div
        style={cardStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        tabIndex={0}
        aria-label={print.name}
        title={print.name}
      >
        {imgSrc ? (
          <img src={imgSrc} alt={print.name} style={{ width: imageSize, height: "auto", display: "block" }} />
        ) : (
          <div>{print.name}</div>
        )}
      </div>
    );
  }

  // Render grid items
  function renderGridItems() {
    if (
      leagueIsSupported &&
      conference === "ALL" &&
      division === "ALL" &&
      Array.isArray(gridData) &&
      gridData.length > 0 &&
      Array.isArray(gridData[0])
    ) {
      if (isMobile) {
        return gridData.map(([left, right], idx) => (
          <div key={idx} style={{ display: "flex", gap: 12, width: "100%" }}>
            {left ? <PrintCard key={left.id} print={left} isMobile={isMobile} league={currentLeague} /> : null}
            {right ? <PrintCard key={right.id} print={right} isMobile={isMobile} league={currentLeague} /> : null}
          </div>
        ));
      }
      return gridData.flat().map((item, idx) => {
        if (!item) return null;
        return <PrintCard key={item.id || idx} print={item} isMobile={isMobile} league={currentLeague} />;
      });
    }

    if (leagueIsSupported && Array.isArray(gridData)) {
      return gridData.map((item, idx) => {
        if (!item) return null;
        return <PrintCard key={item.id || idx} print={item} isMobile={isMobile} league={currentLeague} />;
      });
    }

    // non-sports categories
    if (activeCategory !== "sports") {
      if (filteredPrints.length === 0) {
        return <div>No prints yet in this category.</div>;
      }
      return filteredPrints.map((p, i) => <PrintCard key={p.id || i} print={p} isMobile={isMobile} league={activeCategory} />);
    }

    return null;
  }

  return (
    <div className="three-d-printing-page" style={{ width: "100%", background: "#f9f9f7" }}>
      <div style={pageStyle}>
        {/* Single nav-card-mid containing only the tabs (matches IndependentStudio structure) */}
        <div className="nav-card nav-card-mid" aria-hidden={false}>
          <div style={{ flex: "0 0 auto", width: 88, minWidth: 88 }} />
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxSizing: "border-box"
            }}
          >
            {/* Render tabs directly (no inner padded wrapper) */}
            <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <CategoriesRow />
            </div>
          </div>
          <div style={{ flex: "0 0 auto", width: 66, minWidth: 66 }} />
        </div>

        {/* Logo area — placed below the nav-card-mid and matched to the page bleed/padding */}
        <div style={contentBleedContainer(8)}>
          {showConferenceLogos ? <LogoRow /> : showCenteredLogo ? <CenteredLogo /> : null}
        </div>

        {/* Subnav / Filters — below logos, aligned with same bleed/padding */}
        <div style={contentBleedContainer(0)}>
          <DivisionsRow />
        </div>

        {/* Dropdown anchored to SPORTS tab */}
        <SportsDropdown />

        {/* Grid */}
        <div ref={gridRef} style={gridWrapStyle}>
          {renderGridItems()}
        </div>
      </div>
    </div>
  );
}
