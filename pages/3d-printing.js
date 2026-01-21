import React, { useState, useEffect, useRef } from "react";

import SectionTabs from "../components/section-tabs";

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

// Local categories — three items
const CATEGORIES = [
  { key: "sports", label: "SPORTS" },
  { key: "lithophanes", label: "LITHOPHANES" },
  { key: "other", label: "OTHER" }
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

  // Use half width: original 180 -> now 90
  const DROPDOWN_WIDTH = 90;
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0, width: DROPDOWN_WIDTH });

  // compute dropdown position aligned under SPORTS tab
  useEffect(() => {
    function updatePosition() {
      const btn = sportsTabRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const width = DROPDOWN_WIDTH;
      // Use viewport coords (no scroll offsets) and fixed positioning so dropdown sits correctly
      const left = rect.left + rect.width / 2 - width / 2;
      const top = rect.bottom + 6; // rect.bottom is viewport-relative
      setDropdownPos({ left, top, width });
    }
    if (sportsOpen) updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition); // keep it updated while scrolling
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
  if (activeCategory === "other") filteredPrints = [CUSTOM_CAD];
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

  // Handlers for subnav changes (LEAGUE_FILTER_BUTTONS items)
  function handleFilterChange(key) {
    // find the button that matches key
    const btn = LEAGUE_FILTER_BUTTONS.find((b) => b.value === key);
    if (!btn) return;
    if (btn.type === "conference") {
      // When changing conference reset division to ALL to avoid stale (now-hidden) division
      setConference(btn.value);
      setDivision("ALL");
    } else {
      setDivision(btn.value);
    }
  }

  // --- NBA-specific hiding logic for divisions when a conference is selected ---
  // Confirmed: hide the opposite-conference divisions only for NBA.
  const NBA_EAST_DIVS = new Set(["ATLANTIC", "CENTRAL", "SOUTHEAST"]);
  const NBA_WEST_DIVS = new Set(["PACIFIC", "NORTHWEST", "SOUTHWEST"]);

  // Build a filtered copy of the league filter buttons that removes divisions not part of the selected conference (NBA only).
  let filteredLeagueFilterButtons = LEAGUE_FILTER_BUTTONS;

  if (leagueIsNBA && conference !== "ALL") {
    if (conference === "EAST") {
      filteredLeagueFilterButtons = LEAGUE_FILTER_BUTTONS.filter((b) => {
        // keep conference controls and the universal ALL, and keep east divisions
        if (!b || !b.value) return false;
        if (b.type === "conference") return true;
        if (b.value === "ALL") return true;
        return NBA_EAST_DIVS.has(b.value);
      });
    } else if (conference === "WEST") {
      filteredLeagueFilterButtons = LEAGUE_FILTER_BUTTONS.filter((b) => {
        if (!b || !b.value) return false;
        if (b.type === "conference") return true;
        if (b.value === "ALL") return true;
        return NBA_WEST_DIVS.has(b.value);
      });
    }
  }

  // Convert filtered buttons to items for SectionTabs (key/label)
  const leagueFilterItems = filteredLeagueFilterButtons.map((b) => ({ key: b.value, label: b.label }));

  // Helper to compute active key for the subnav SectionTabs:
  // - If a division is selected (not "ALL") use division so that division gets highlighted.
  // - Otherwise use conference so conference (ALL/EAST/WEST) can appear active.
  const subnavActiveKey = division && division !== "ALL" ? division : conference || "ALL";

  // Render helpers
  function LogoRow() {
    if (!leagueIsSupported || !showConferenceLogos) return null;
    const leftLogo = LEAGUE_CONFERENCE_LOGOS[0];
    const rightLogo = LEAGUE_CONFERENCE_LOGOS[1];

    // horizontal nudge values (you requested 34px)
    const leftNudge = 34; // pixels to move left logo to the right
    const rightNudge = -34; // pixels to move right logo to the left

    const logoStyle = (nudge) => ({
      width: 200,
      height: 140,
      objectFit: "contain",
      cursor: "pointer",
      transform: `translateX(${nudge}px)`,
      transition: "transform 0.18s"
    });

    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center", marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={leftLogo?.image}
            alt={leftLogo?.name || "left"}
            style={logoStyle(leftNudge)}
            onClick={() => {
              if (leagueIsNFL) setConference("AFC");
              else setConference("EAST");
              setDivision("ALL");
              setShowFilterBar(true);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") { if (leagueIsNFL) setConference("AFC"); else setConference("EAST"); setDivision("ALL"); setShowFilterBar(true); } }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={rightLogo?.image}
            alt={rightLogo?.name || "right"}
            style={logoStyle(rightNudge)}
            onClick={() => {
              if (leagueIsNFL) setConference("NFC");
              else setConference("WEST");
              setDivision("ALL");
              setShowFilterBar(true);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") { if (leagueIsNFL) setConference("NFC"); else setConference("WEST"); setDivision("ALL"); setShowFilterBar(true); } }}
          />
        </div>
      </div>
    );
  }

  function CenteredLogo() {
    if (!leagueIsSupported || !showCenteredLogo) return null;
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
        <img
          src={showCenteredLogo?.image}
          alt={showCenteredLogo?.name || "center"}
          style={{ width: 220, height: 160, objectFit: "contain", cursor: "pointer" }}
          onClick={() => {
            setConference("ALL");
            setDivision("ALL");
            setShowFilterBar(true);
          }}
          role="button"
          tabIndex={0}
        />
      </div>
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
    } else if (league === "lithophanes" || league === "other" || league === "more") {
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
          <img src={imgSrc} alt={print.name} style={{ width: imageSize, height: "auto" }} />
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
          <div key={`row-${idx}`} style={{ display: "flex", gap: 12, width: "100%", justifyContent: "center", marginBottom: 12 }}>
            {left ? <PrintCard print={left} isMobile={isMobile} league={currentLeague} /> : <div style={{ width: 120 }} />}
            {right ? <PrintCard print={right} isMobile={isMobile} league={currentLeague} /> : <div style={{ width: 120 }} />}
          </div>
        ));
      }
      return gridData.flat().map((item, idx) => {
        if (!item) return <div key={`gap-${idx}`} />;
        return <div key={item.name || idx}><PrintCard print={item} isMobile={isMobile} league={currentLeague} /></div>;
      });
    }

    if (leagueIsSupported && Array.isArray(gridData)) {
      return gridData.map((item, idx) => {
        if (!item) return null;
        return <div key={item.name || idx}><PrintCard print={item} isMobile={isMobile} league={currentLeague} /></div>;
      });
    }

    // non-sports categories
    if (activeCategory !== "sports") {
      if (filteredPrints.length === 0) {
        return <div>No prints yet in this category.</div>;
      }
      return filteredPrints.map((p, i) => <div key={i}><PrintCard print={p} isMobile={isMobile} league={activeCategory} /></div>);
    }

    return null;
  }

  return (
    <div style={pageStyle}>
      {/* nav-card-mid containing main category tabs */}
      <div className="nav-card nav-card-mid" style={{ boxSizing: "border-box" }}>
        <div style={{ width: "min(1600px, 95vw)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SectionTabs
            items={CATEGORIES}
            active={activeCategory}
            onChange={(key) => {
              if (key === "sports") {
                setActiveCategory("sports");
                setSportsOpen((s) => !s);
              } else {
                setActiveCategory(key);
                setSportsOpen(false);
              }
              setConference("ALL");
              setDivision("ALL");
              setShowFilterBar(true);
            }}
            variant="top"
            tabRefMap={{ sports: sportsTabRef }}
            ariaLabel="3D printing categories"
          />
        </div>
      </div>

      {/* Logo area */}
      <div style={contentBleedContainer(12)}>
        {showConferenceLogos ? <LogoRow /> : showCenteredLogo ? <CenteredLogo /> : null}
      </div>

      {/* Subnav / Filters */}
      <div style={contentBleedContainer(8)}>
        {leagueIsSupported && showFilterBar && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <SectionTabs
              items={leagueFilterItems}
              active={subnavActiveKey}
              onChange={handleFilterChange}
              variant="top"
              ariaLabel="League filters"
            />
          </div>
        )}
      </div>

      {/* Sports dropdown anchored to SPORTS tab */}
      {sportsOpen && activeCategory === "sports" && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
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
            gap: 2,
            alignItems: "stretch",
            pointerEvents: "auto",
            transform: "translateZ(0)"
          }}
        >
          {[
            { key: "nfl", label: "NFL", enabled: true },
            { key: "nba", label: "NBA", enabled: true },
            { key: "mlb", label: "MLB", enabled: false },
            { key: "nhl", label: "NHL", enabled: false },
            { key: "ncaa", label: "NCAA", enabled: false }
          ].map((l) => {
            const isActive = currentLeague === l.key && activeCategory === "sports";
            return (
              <button
                key={l.key}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "8px 10px",
                  textAlign: "center",
                  fontSize: 12,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  cursor: l.enabled ? "pointer" : "default",
                  color: isActive ? "#e6dbb9" : "#6c6c6a",
                  fontWeight: isActive ? 350 : 280,
                  opacity: l.enabled ? 1 : 0.6
                }}
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
                tabIndex={0}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      <div style={{ ...contentBleedContainer(8), marginTop: 8 }}>
        <div ref={gridRef} style={gridWrapStyle}>
          {renderGridItems()}
        </div>
      </div>
    </div>
  );
}
