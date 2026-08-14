import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "../../styles/Hangar26.module.css";

const TITLE_BLUE = "#192d4b";
const INTRO_TEXT_STYLE = {
  fontSize: "clamp(18px, 1.35vw, 22px)",
  lineHeight: 1.5,
};
const TECHNICAL_DRAWING_STYLE = {
  width: "100%",
  height: "auto",
  objectFit: "contain",
  display: "block",
  boxSizing: "border-box",
  border: "1px solid #deddd7",
  background: "linear-gradient(rgba(229,193,159,.04), rgba(229,193,159,.04)), repeating-linear-gradient(0deg, transparent 0 31px, rgba(24,24,24,.025) 31px 32px), repeating-linear-gradient(90deg, transparent 0 31px, rgba(24,24,24,.025) 31px 32px), #f3f2ee",
};
const PROJECT_RENDER_STYLE = {
  width: "100%",
  height: "auto",
  display: "block",
  boxSizing: "border-box",
  border: "1px solid #deddd7",
  background: "#f3f2ee",
};

const phases = [
  { number: "01", label: "PRELIMINARY DESIGN", status: "IN REVIEW", href: "#phase-01" },
  { number: "02", label: "DESIGN DEVELOPMENT", status: "IN PROGRESS", href: "#phase-02" },
  { number: "03", label: "SITE ACQUISITION", status: "UPCOMING", href: "#phase-03" },
  { number: "04", label: "DOCUMENTATION + CONSTRUCTION", status: "FUTURE", href: "#phase-04" },
];

function PhaseHeader({ number, eyebrow, title, status, children }) {
  return (
    <div className={styles.phaseHeader}>
      <div className={styles.phaseIndex}>{number}</div>
      <div className={styles.phaseHeadingText}>
        <div className={styles.phaseMetaRow}>
          <span>{eyebrow}</span>
          <span className={styles.status}>{status}</span>
        </div>
        <h2 style={{ color: TITLE_BLUE }}>{title}</h2>
        {children && <div className={styles.phaseIntro}>{children}</div>}
      </div>
    </div>
  );
}

function Placeholder({ label, ratio = "wide", muted = false, style }) {
  return (
    <div
      className={`${styles.placeholder} ${styles[ratio]} ${muted ? styles.placeholderMuted : ""}`}
      style={style}
    >
      <span>{label}</span>
    </div>
  );
}

function TechnicalDrawing({ src, alt }) {
  return <img src={src} alt={alt} loading="lazy" decoding="async" style={TECHNICAL_DRAWING_STYLE} />;
}

function ProjectRender({ src, alt, priority = false }) {
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={PROJECT_RENDER_STYLE}
    />
  );
}

export default function Hangar26ProjectPage() {
  const [exteriorTime, setExteriorTime] = useState("day");

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const timer = window.setTimeout(() => {
      setExteriorTime((current) => (current === "day" ? "dusk" : "day"));
    }, 7000);

    return () => window.clearTimeout(timer);
  }, [exteriorTime]);

  return (
    <>
      <Head>
        <title>FSD Commercial Hangar | Studio Stewart</title>
        <meta
          name="description"
          content="FSD Commercial Hangar project development for PJ Aviation from preliminary design through construction."
        />
      </Head>

      <main className={styles.page}>
        <section
          className={styles.hero}
          style={{
            paddingTop: "clamp(36px, 4vw, 64px)",
            minHeight: "auto",
            justifyContent: "flex-start",
          }}
        >
          <div style={{ display: "grid", gap: "clamp(100px, 8vw, 140px)" }}>
            <div>
              <div className={styles.heroTopline}>ONGOING PROJECT · 2026</div>
              <h1 style={{ fontSize: "clamp(42px, 5.4vw, 90px)", lineHeight: 0.96, maxWidth: 1250, color: TITLE_BLUE, margin: 0 }}>
                FSD COMMERCIAL HANGAR
              </h1>
            </div>

            <div className={styles.heroGrid} style={{ alignItems: "start", marginTop: 0 }}>
              <div className={styles.heroStatement}>
                <p style={INTRO_TEXT_STYLE}>
                  This project began as a collaboration with a former college roommate who was looking to develop a commercial hangar for his company at Sioux Falls Regional Airport (FSD). What started with preliminary building design and airport review will continue through site acquisition, site specific development, professional coordination, and construction.
                </p>
              </div>
              <div className={styles.heroFacts}>
                <div><span>LOCATION</span><strong>SIOUX FALLS AREA, SOUTH DAKOTA</strong></div>
                <div><span>TYPE</span><strong>AVIATION</strong></div>
                <div><span>OWNER</span><strong>PJ AVIATION</strong></div>
                <div><span>STATUS</span><strong>PHASE 01 IN REVIEW</strong></div>
              </div>
            </div>
          </div>

          <nav
            className={styles.phaseNav}
            aria-label="Project phases"
            style={{ marginTop: "clamp(100px, 8vw, 140px)" }}
          >
            {phases.map((phase) => (
              <a href={phase.href} key={phase.number}>
                <span className={styles.phaseNavNumber}>{phase.number}</span>
                <span className={styles.phaseNavLabel} style={{ color: TITLE_BLUE }}>{phase.label}</span>
                <span className={styles.phaseNavStatus}>{phase.status}</span>
              </a>
            ))}
          </nav>
        </section>

        <section id="phase-01" className={styles.phaseSection}>
          <PhaseHeader
            number="01"
            eyebrow="BASE MODEL + ENGINEERING REVIEW"
            title="PRELIMINARY DESIGN"
            status="IN REVIEW"
          >
            <p style={INTRO_TEXT_STYLE}>
              Phase 01 focused on developing the base design of the hangar, including the overall dimensions, aircraft clearances, and office layout. From there, I created the plans, elevations, and sections that made up the first drawing set sent to the airport for review.
            </p>
          </PhaseHeader>

          <div className={styles.statsGrid}>
            <div><span>HANGAR AREA</span><strong>12,823 SF</strong></div>
            <div><span>HANGAR WIDTH</span><strong>110 FT</strong></div>
            <div><span>BUILDING LENGTH</span><strong>145 FT 4 IN</strong></div>
            <div><span>ROOF APEX</span><strong>32 FT 8 IN</strong></div>
          </div>

          <div className={styles.drawingBlock}>
            <TechnicalDrawing
              src="/fsd26/phase01-floorplan.svg"
              alt="Phase 01 architectural first floor plan for the FSD Commercial Hangar"
            />
            <div className={styles.captionRow}>
              <span>ARCHITECTURAL FLOOR PLAN</span>
              <span>BASE MODEL + DIMENSIONAL COORDINATION</span>
            </div>
          </div>

          <div className={`${styles.twoColumnMedia} phaseOneSupportRow`}>
            <div>
              <TechnicalDrawing
                src="/fsd26/phase01-elevation.svg"
                alt="South elevation of the FSD Commercial Hangar"
              />
              <div className={styles.captionRow}>
                <span>SOUTH ELEVATION</span>
                <span>HANGAR DOOR + FRONT ELEVATION</span>
              </div>
            </div>
            <div>
              <TechnicalDrawing
                src="/fsd26/phase01-floorplan_officecallout.svg"
                alt="Enlarged first floor office plan for the FSD Commercial Hangar"
              />
              <div className={styles.captionRow}>
                <span>OFFICE PLAN</span>
                <span>ENTRY + OFFICE SUPPORT SPACES</span>
              </div>
            </div>
          </div>

          <div className={styles.drawingBlock} style={{ marginTop: "clamp(56px, 8vw, 120px)" }}>
            <TechnicalDrawing
              src="/fsd26/phase01-section.svg"
              alt="Long building section through the FSD Commercial Hangar"
            />
            <div className={styles.captionRow}>
              <span>BUILDING SECTION</span>
              <span>HANGAR VOLUME + OFFICE LEVELS</span>
            </div>
          </div>

          <div className="phaseOneClose">
            <div className="phaseOneCloseMeta">
              <span>PHASE 01</span>
              <strong>MAY 2026</strong>
            </div>
            <div className="phaseOneCloseStatus">
              <span>CURRENT STATUS</span>
              <h3>SUBMITTED FOR REVIEW</h3>
            </div>
            <p>
              Initial plans, elevations, sections, and dimensions were submitted to Sioux Falls Regional Airport for engineering review in May 2026. The drawings shown here have continued to develop since that submission and will continue to be updated as the project progresses.
            </p>
          </div>
        </section>

        <section id="phase-02" className={`${styles.phaseSection} ${styles.phaseTwo}`}>
          <PhaseHeader
            number="02"
            eyebrow="MATERIAL + VISUAL DEVELOPMENT"
            title="DESIGN DEVELOPMENT"
            status="IN PROGRESS"
          >
            <p style={INTRO_TEXT_STYLE}>
              Phase 02 began after the preliminary design was submitted and focuses on developing the model in more detail. I added the exterior siding, glazing, lighting, office furnishings, and aircraft to better understand how the building would look and function. This phase is still ongoing and will continue to develop as the project moves forward.
            </p>
          </PhaseHeader>

          <div className={styles.heroRenderWrap}>
            <div className="exteriorToggleStage">
              <img
                src="/fsd26/render-hero-day.png"
                alt="Daylight exterior rendering of the FSD Commercial Hangar and PJ Aviation hangar door"
                loading="lazy"
                decoding="async"
                className={`exteriorToggleImage ${exteriorTime === "day" ? "isActive" : ""}`}
              />
              <img
                src="/fsd26/render-hero-dusk.png"
                alt="Dusk exterior rendering of the FSD Commercial Hangar with illuminated interior and facade lighting"
                loading="lazy"
                decoding="async"
                className={`exteriorToggleImage ${exteriorTime === "dusk" ? "isActive" : ""}`}
              />
              <div className="exteriorToggleControls" aria-label="Exterior lighting view">
                <button
                  type="button"
                  className={exteriorTime === "day" ? "isActive" : ""}
                  aria-pressed={exteriorTime === "day"}
                  onClick={() => setExteriorTime("day")}
                >
                  DAY
                </button>
                <span aria-hidden="true">/</span>
                <button
                  type="button"
                  className={exteriorTime === "dusk" ? "isActive" : ""}
                  aria-pressed={exteriorTime === "dusk"}
                  onClick={() => setExteriorTime("dusk")}
                >
                  DUSK
                </button>
              </div>
            </div>
            <div className={styles.captionRow}>
              <span>EXTERIOR LIGHTING STUDY</span>
              <span>{exteriorTime === "day" ? "DAYLIGHT + AIRPORT CONTEXT" : "DUSK + LIGHTING"}</span>
            </div>
          </div>

          <div className={styles.developmentNotes}>
            <div><span>01</span><h3 style={{ color: TITLE_BLUE }}>ENVELOPE</h3><p>Metal siding, glazing, trim, CMU base and drainage elements.</p></div>
            <div><span>02</span><h3 style={{ color: TITLE_BLUE }}>LIGHTING</h3><p>Hangar fixtures, office lighting and interior atmosphere.</p></div>
            <div><span>03</span><h3 style={{ color: TITLE_BLUE }}>INTERIOR</h3><p>Office, lounge, planning and support spaces furnished for scale and use.</p></div>
            <div><span>04</span><h3 style={{ color: TITLE_BLUE }}>AVIATION SCALE</h3><p>Aircraft integrated into the model to test clearance, proportion and visual character.</p></div>
          </div>

          <div className="renderRows">
            <div>
              <ProjectRender
                src="/fsd26/render-hangar-interior.png"
                alt="Interior rendering of the main aircraft hangar showing the aircraft, steel frame and support spaces"
              />
              <div className={styles.captionRow}>
                <span>HANGAR INTERIOR</span>
                <span>AIRCRAFT SCALE + MAINTENANCE</span>
              </div>
            </div>

            <div className="renderPair">
              <div>
                <ProjectRender
                  src="/fsd26/render-office-exterior.png"
                  alt="Exterior rendering of the PJ Aviation office entrance attached to the FSD Commercial Hangar"
                />
                <div className={styles.captionRow}>
                  <span>OFFICE ENTRANCE</span>
                  <span>HUMAN SCALE + ACCESS</span>
                </div>
              </div>
              <div>
                <ProjectRender
                  src="/fsd26/render-office-interior.png"
                  alt="Interior rendering of the PJ Aviation office reception and support spaces"
                />
                <div className={styles.captionRow}>
                  <span>OFFICE INTERIOR</span>
                  <span>RECEPTION + WORKPLACE</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="phase-03" className={`${styles.phaseSection} ${styles.futurePhase}`}>
          <PhaseHeader
            number="03"
            eyebrow="SITE SELECTION + ADAPTATION"
            title="SITE ACQUISITION"
            status="UPCOMING"
          >
            <p style={INTRO_TEXT_STYLE}>
              The current building establishes the baseline design. Once a site is secured, the project will be adapted to its specific orientation, access, utilities, aircraft movement, grading, setbacks and surrounding conditions.
            </p>
          </PhaseHeader>

          <div className={styles.sitePending}>
            <div className={styles.sitePendingGrid} aria-hidden="true" />
            <div className={styles.sitePendingLabel}>
              <span>03 / SITE</span>
              <h3 style={{ color: TITLE_BLUE }}>SITE PENDING</h3>
              <p>Future site plan, access, taxiway relationship and site specific revisions will be added here.</p>
            </div>
          </div>
        </section>

        <section id="phase-04" className={`${styles.phaseSection} ${styles.futurePhase} ${styles.lastPhase}`}>
          <PhaseHeader
            number="04"
            eyebrow="PROFESSIONAL COORDINATION + DELIVERY"
            title="DOCUMENTATION + CONSTRUCTION"
            status="FUTURE"
          >
            <p style={INTRO_TEXT_STYLE}>
              Following site selection and professional coordination, the project will move through technical documentation, engineering, permitting and construction. This phase will continue to evolve as the project advances toward completion.
            </p>
          </PhaseHeader>

          <div className={styles.deliveryPath}>
            <div><span>01</span><strong>PROFESSIONAL COORDINATION</strong></div>
            <div><span>02</span><strong>TECHNICAL DOCUMENTATION</strong></div>
            <div><span>03</span><strong>PERMITTING + CONSTRUCTION</strong></div>
            <div><span>04</span><strong>COMPLETED BUILDING</strong></div>
          </div>

          <div className={styles.builtFuture}>
            <Placeholder label="FUTURE · COMPLETED BUILDING PHOTOGRAPH" ratio="built" muted />
            <div className={styles.builtOverlay}>
              <span>TO BE CONTINUED</span>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .phaseOneSupportRow {
          grid-template-columns: minmax(0, 2.16fr) minmax(0, 1fr);
          align-items: start;
        }

        .phaseOneClose {
          margin-top: clamp(56px, 8vw, 120px);
          padding: clamp(24px, 3vw, 40px) 0;
          border-top: 1px solid #deddd7;
          border-bottom: 1px solid #deddd7;
          display: grid;
          grid-template-columns: .6fr 1.45fr 1fr;
          gap: clamp(28px, 4vw, 72px);
          align-items: end;
        }

        .phaseOneCloseMeta,
        .phaseOneCloseStatus {
          display: grid;
          gap: 10px;
        }

        .phaseOneClose span {
          font-size: 10px;
          line-height: 1.2;
          letter-spacing: .11em;
          color: #b0afa9;
        }

        .phaseOneCloseMeta strong {
          font-size: 13px;
          font-weight: 280;
          letter-spacing: .035em;
          color: #4f4f4c;
        }

        .phaseOneCloseStatus h3 {
          margin: 0;
          color: ${TITLE_BLUE};
          font-size: clamp(24px, 2.5vw, 40px);
          line-height: 1;
          font-weight: 280;
          letter-spacing: -.01em;
        }

        .phaseOneClose p {
          margin: 0;
          color: #8a8a86;
          font-size: 13px;
          line-height: 1.55;
          max-width: 430px;
        }

        .exteriorToggleStage {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          box-sizing: border-box;
          border: 1px solid #deddd7;
          background: #f3f2ee;
        }

        .exteriorToggleImage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0;
          transition: opacity 1.5s ease;
        }

        .exteriorToggleImage.isActive {
          opacity: 1;
        }

        .exteriorToggleControls {
          position: absolute;
          right: clamp(12px, 1.6vw, 24px);
          bottom: clamp(12px, 1.6vw, 24px);
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 7px 9px;
          border: 1px solid rgba(222, 221, 215, .85);
          background: rgba(249, 249, 247, .88);
          backdrop-filter: blur(8px);
        }

        .exteriorToggleControls button {
          appearance: none;
          border: 0;
          background: transparent;
          padding: 3px 5px;
          color: #8a8a86;
          font: inherit;
          font-size: 10px;
          line-height: 1;
          letter-spacing: .11em;
          cursor: pointer;
          transition: color .18s ease;
        }

        .exteriorToggleControls button:hover,
        .exteriorToggleControls button:focus-visible,
        .exteriorToggleControls button.isActive {
          color: ${TITLE_BLUE};
        }

        .exteriorToggleControls button:focus-visible {
          outline: 1px solid ${TITLE_BLUE};
          outline-offset: 2px;
        }

        .exteriorToggleControls span {
          color: #b0afa9;
          font-size: 10px;
        }

        .renderRows {
          display: grid;
          gap: clamp(56px, 8vw, 120px);
          margin-top: clamp(70px, 9vw, 140px);
        }

        .renderPair {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: clamp(20px, 3vw, 46px);
          align-items: start;
        }

        @media (prefers-reduced-motion: reduce) {
          .exteriorToggleImage {
            transition: none;
          }
        }

        @media (max-width: 680px) {
          .phaseOneSupportRow,
          .phaseOneClose,
          .renderPair {
            grid-template-columns: 1fr;
          }

          .phaseOneClose {
            align-items: start;
          }

          .renderPair {
            gap: clamp(40px, 8vw, 64px);
          }

          .exteriorToggleControls {
            right: 10px;
            bottom: 10px;
          }
        }
      `}</style>
    </>
  );
}
