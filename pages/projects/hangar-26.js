import Head from "next/head";
import styles from "../../styles/Hangar26.module.css";

const TITLE_BLUE = "#192d4b";

const phases = [
  { number: "01", label: "PRELIMINARY DESIGN", status: "IN REVIEW", href: "#phase-01" },
  { number: "02", label: "DESIGN DEVELOPMENT", status: "COMPLETE", href: "#phase-02" },
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

function Placeholder({ label, ratio = "wide", muted = false }) {
  return (
    <div className={`${styles.placeholder} ${styles[ratio]} ${muted ? styles.placeholderMuted : ""}`}>
      <span>{label}</span>
    </div>
  );
}

export default function Hangar26ProjectPage() {
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
        <section className={styles.hero}>
          <div className={styles.heroTopline}>ONGOING PROJECT · 2026</div>
          <h1 style={{ fontSize: "clamp(42px, 5.4vw, 90px)", lineHeight: 0.96, maxWidth: 1250, color: TITLE_BLUE }}>
            FSD COMMERCIAL HANGAR
          </h1>
          <div className={styles.heroGrid}>
            <div className={styles.heroStatement}>
              <p>
                This page documents the ongoing development of a real aviation project planned for Sioux Falls Regional Airport (FSD). The work began with preliminary building design and airport review, and will continue through site acquisition, site specific development, professional coordination, and construction.
              </p>
            </div>
            <div className={styles.heroFacts}>
              <div><span>LOCATION</span><strong>SIOUX FALLS AREA, SOUTH DAKOTA</strong></div>
              <div><span>TYPE</span><strong>AVIATION</strong></div>
              <div><span>OWNER</span><strong>PJ AVIATION</strong></div>
              <div><span>STATUS</span><strong>PHASE 01 IN REVIEW</strong></div>
            </div>
          </div>

          <nav className={styles.phaseNav} aria-label="Project phases">
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
            <p>
              The first phase established the building geometry, primary dimensions, aircraft clearances, office program and overall spatial organization. Plans, elevations and sections were prepared as the first coordinated architectural package and submitted to the airport for engineering review.
            </p>
          </PhaseHeader>

          <div className={styles.statsGrid}>
            <div><span>HANGAR AREA</span><strong>12,823 SF</strong></div>
            <div><span>HANGAR WIDTH</span><strong>110 FT</strong></div>
            <div><span>BUILDING LENGTH</span><strong>145 FT 4 IN</strong></div>
            <div><span>ROOF APEX</span><strong>32 FT 8 IN</strong></div>
          </div>

          <div className={styles.drawingBlock}>
            <Placeholder label="PHASE 01 · FIRST FLOOR PLAN" ratio="plan" />
            <div className={styles.captionRow}>
              <span>ARCHITECTURAL FLOOR PLAN</span>
              <span>BASE MODEL + DIMENSIONAL COORDINATION</span>
            </div>
          </div>

          <div className={styles.twoColumnMedia}>
            <div>
              <Placeholder label="BUILDING ELEVATION" ratio="wide" />
              <div className={styles.captionRow}><span>EXTERIOR ELEVATION</span><span>ENVELOPE + PROPORTION</span></div>
            </div>
            <div>
              <Placeholder label="BUILDING SECTION" ratio="wide" />
              <div className={styles.captionRow}><span>BUILDING SECTION</span><span>VERTICAL CLEARANCE + OFFICE LEVELS</span></div>
            </div>
          </div>

          <div className={styles.phaseClose}>
            <span>MAY 2026</span>
            <h3 style={{ color: TITLE_BLUE }}>PRELIMINARY DESIGN COMPLETE</h3>
            <p>Initial drawings and dimensions submitted for engineering review.</p>
          </div>
        </section>

        <section id="phase-02" className={`${styles.phaseSection} ${styles.phaseTwo}`}>
          <PhaseHeader
            number="02"
            eyebrow="MATERIAL + VISUAL DEVELOPMENT"
            title="DESIGN DEVELOPMENT"
            status="COMPLETE"
          >
            <p>
              With the primary geometry established, the model was developed into a more complete architectural proposal. Exterior cladding, glazing, lighting, materials, office furnishings and aircraft scale were added to clarify the intended character and use of the building.
            </p>
          </PhaseHeader>

          <div className={styles.heroRenderWrap}>
            <Placeholder label="PHASE 02 · HERO EXTERIOR RENDER" ratio="heroRender" />
          </div>

          <div className={styles.developmentNotes}>
            <div><span>01</span><h3 style={{ color: TITLE_BLUE }}>ENVELOPE</h3><p>Metal siding, glazing, trim, CMU base and drainage elements.</p></div>
            <div><span>02</span><h3 style={{ color: TITLE_BLUE }}>LIGHTING</h3><p>Hangar fixtures, office lighting and interior atmosphere.</p></div>
            <div><span>03</span><h3 style={{ color: TITLE_BLUE }}>INTERIOR</h3><p>Office, lounge, planning and support spaces furnished for scale and use.</p></div>
            <div><span>04</span><h3 style={{ color: TITLE_BLUE }}>AVIATION SCALE</h3><p>Aircraft integrated into the model to test clearance, proportion and visual character.</p></div>
          </div>

          <div className={styles.imageMosaic}>
            <Placeholder label="HANGAR INTERIOR" ratio="portraitWide" />
            <Placeholder label="OFFICE INTERIOR" ratio="portraitWide" />
            <Placeholder label="SECONDARY EXTERIOR" ratio="portraitWide" />
          </div>

          <div className={styles.detailBand}>
            <Placeholder label="MATERIAL / DETAIL VIEW" ratio="detail" />
          </div>
        </section>

        <section id="phase-03" className={`${styles.phaseSection} ${styles.futurePhase}`}>
          <PhaseHeader
            number="03"
            eyebrow="SITE SELECTION + ADAPTATION"
            title="SITE ACQUISITION"
            status="UPCOMING"
          >
            <p>
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
            <p>
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
    </>
  );
}
