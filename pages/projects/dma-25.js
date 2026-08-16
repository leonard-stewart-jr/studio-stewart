import Head from "next/head";
import styles from "../../styles/DMA25.module.css";

const floorGroups = [
  {
    title: "TEACHER HOUSING",
    count: "02 FLOORS",
    floors: [
      { number: "15", name: "TEACHER HOUSING 02", area: "AREA PENDING", program: "housing" },
      { number: "14", name: "TEACHER HOUSING 01", area: "AREA PENDING", program: "housing" },
    ],
  },
  {
    title: "ACADEMY",
    count: "09 FLOORS",
    floors: [
      { number: "13", name: "ACADEMY LEVEL 09", area: "AREA PENDING", program: "academy" },
      { number: "12", name: "ACADEMY LEVEL 08", area: "AREA PENDING", program: "academy" },
      { number: "11", name: "ACADEMY LEVEL 07", area: "AREA PENDING", program: "academy" },
      { number: "10", name: "ACADEMY LEVEL 06", area: "AREA PENDING", program: "academy" },
      { number: "09", name: "ACADEMY LEVEL 05", area: "AREA PENDING", program: "academy" },
      { number: "08", name: "ACADEMY LEVEL 04", area: "AREA PENDING", program: "academy" },
      { number: "07", name: "ACADEMY LEVEL 03", area: "AREA PENDING", program: "academy" },
      { number: "06", name: "ACADEMY LEVEL 02", area: "AREA PENDING", program: "academy" },
      { number: "05", name: "ACADEMY LEVEL 01", area: "AREA PENDING", program: "academy" },
    ],
  },
  {
    title: "PARKING",
    count: "04 FLOORS",
    floors: [
      { number: "04", name: "PARKING 04", area: "AREA PENDING", program: "parking" },
      { number: "03", name: "PARKING 03", area: "AREA PENDING", program: "parking" },
      { number: "02", name: "PARKING 02", area: "AREA PENDING", program: "parking" },
      { number: "01", name: "PARKING 01", area: "AREA PENDING", program: "parking" },
    ],
  },
];

const allFloors = floorGroups.flatMap((group) => group.floors);

const snapshot = [
  ["LOCATION", "DES MOINES, IOWA"],
  ["FLOORS", "15"],
  ["PROGRAM", "MIXED USE"],
  ["YEAR", "2025 →"],
  ["PARKING", "04 FLOORS"],
  ["ACADEMY", "09 FLOORS"],
  ["TEACHER HOUSING", "02 FLOORS"],
  ["AREA", "PENDING REVIT EXPORT"],
];

function Placeholder({ label, className = "" }) {
  return (
    <div className={className}>
      <span className={styles.placeholderLabel}>{label}</span>
    </div>
  );
}

function ProgramNote({ title, detail, color }) {
  return (
    <div className={styles.programNote}>
      <span className={styles.programSwatch} style={{ background: color }} aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <p>{detail}</p>
      </div>
    </div>
  );
}

export default function DMA25ProjectPage() {
  return (
    <>
      <Head>
        <title>Des Moines Academy of Arts and Athletics | Studio Stewart</title>
        <meta
          name="description"
          content="Des Moines Academy of Arts and Athletics, a fifteen floor mixed use academy, parking, and teacher housing project."
        />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroTop}>
            <div>
              <div className={styles.eyebrow}>ACADEMIC PROJECT · 2025 →</div>
              <h1
                style={{
                  fontSize: "clamp(40px, 4.7vw, 76px)",
                  lineHeight: 0.94,
                  letterSpacing: "-.025em",
                  maxWidth: 1020,
                }}
              >
                DES MOINES ACADEMY OF ARTS AND ATHLETICS
              </h1>
            </div>

            <div className={styles.heroMeta}>
              <div className={styles.heroMetaRow}>
                <span className={styles.metaLabel}>LOCATION</span>
                <strong>DES MOINES, IOWA</strong>
              </div>
              <div className={styles.heroMetaRow}>
                <span className={styles.metaLabel}>TYPE</span>
                <strong>ACADEMY + HOUSING + PARKING</strong>
              </div>
              <div className={styles.heroMetaRow}>
                <span className={styles.metaLabel}>STATUS</span>
                <strong>REVISITED PROJECT</strong>
              </div>
            </div>
          </div>

          <Placeholder label="FINAL HERO RENDER" className={styles.heroImagePlaceholder} />
        </section>

        <section className={`${styles.section} ${styles.container}`}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionKicker}>PROJECT INTRODUCTION</div>
              <h2>DES MOINES ACADEMY</h2>
            </div>
            <p>
              The Des Moines Academy began during Spring 2025 as my most detailed academic building project. The original model combined Rhino and Revit while I was still learning the Revit workflow. After graduation, I returned to the project and rebuilt nearly every Rhino asset in Revit, using the building as a way to continue developing the design and expand what I could do with the model.
            </p>
          </div>

          <div className={styles.snapshotGrid}>
            {snapshot.map(([label, value]) => (
              <div className={styles.snapshotItem} key={label}>
                <span className={styles.snapshotLabel}>{label}</span>
                <strong className={styles.snapshotValue}>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.container}`}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionKicker}>PROGRAM ORGANIZATION</div>
              <h2>A VERTICAL ACADEMY</h2>
            </div>
            <p>
              Fifteen floors organize three major programs into one vertical building. Four levels of parking form the base, nine academy levels make up the primary building, and two teacher housing levels complete the top of the tower.
            </p>
          </div>

          <div className={styles.programLayout}>
            <div className={styles.programStack} aria-label="Des Moines Academy program stack">
              <div className={`${styles.stackBlock} ${styles.stackHousing}`}>
                <span className={styles.programLabel}>TEACHER HOUSING</span>
                <strong>02</strong>
              </div>
              <div className={`${styles.stackBlock} ${styles.stackAcademy}`}>
                <span className={styles.programLabel}>ACADEMY</span>
                <strong>09</strong>
              </div>
              <div className={`${styles.stackBlock} ${styles.stackParking}`}>
                <span className={styles.programLabel}>PARKING</span>
                <strong>04</strong>
              </div>
            </div>

            <div className={styles.programNotes}>
              <ProgramNote
                title="TEACHER HOUSING"
                detail="Two upper levels dedicated to apartments and shared living spaces for academy teachers."
                color="var(--dma-housing)"
              />
              <ProgramNote
                title="ACADEMY"
                detail="Nine detailed education levels containing the arts, athletics, academic, and shared programs that define the project."
                color="var(--dma-academy)"
              />
              <ProgramNote
                title="PARKING"
                detail="Four structured parking levels form the base of the project and connect the vertical campus to the downtown site."
                color="var(--dma-parking)"
              />
            </div>
          </div>
        </section>

        <section className={styles.explorerSection} id="explore">
          <div className={styles.explorerHeader}>
            <div>
              <div className={styles.sectionKicker}>BUILDING EXPLORER</div>
              <h2>EXPLORE THE BUILDING</h2>
            </div>
            <p>
              Select a floor from the building or floor index to explore its plan, spaces, and views. The interactive model, hover states, floor plans, and render galleries will be added as the Revit and D5 assets are produced.
            </p>
          </div>

          <div className={styles.explorerShell}>
            <div className={styles.buildingStage}>
              <div className={styles.buildingGhost} aria-label="Temporary fifteen floor building placeholder">
                {allFloors.map((floor) => (
                  <div
                    key={floor.number}
                    className={`${styles.ghostFloor} ${
                      floor.program === "housing"
                        ? styles.ghostHousing
                        : floor.program === "academy"
                          ? styles.ghostAcademy
                          : styles.ghostParking
                    }`}
                    title={`Level ${floor.number}`}
                  />
                ))}
              </div>
              <span className={`${styles.placeholderLabel} ${styles.stageNote}`}>MASTER BUILDING AXON PLACEHOLDER</span>
            </div>

            <aside className={styles.floorIndex} aria-label="Des Moines Academy floor index">
              <div className={styles.floorIndexTop}>
                <strong>FLOOR INDEX</strong>
                <strong>15 FLOORS</strong>
              </div>

              {floorGroups.map((group) => (
                <div className={styles.floorGroup} key={group.title}>
                  <div className={styles.floorGroupHeading}>
                    <span className={styles.floorGroupTitle}>{group.title}</span>
                    <span className={styles.floorGroupCount}>{group.count}</span>
                  </div>

                  {group.floors.map((floor) => (
                    <div className={styles.floorRow} key={floor.number}>
                      <span className={styles.floorNumber}>{floor.number}</span>
                      <span className={styles.floorName}>{floor.name}</span>
                      <span className={styles.floorArea}>{floor.area}</span>
                    </div>
                  ))}
                </div>
              ))}
            </aside>
          </div>

          <div className={styles.explorerFutureNote}>
            <span>NEXT PHASE · SYNCHRONIZED BUILDING HOVER + FLOOR SELECTION</span>
            <span>FINAL FLOOR NAMES + AREAS PENDING REVIT REVIEW</span>
          </div>
        </section>

        <section className={`${styles.section} ${styles.container}`}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionKicker}>PROJECT DEVELOPMENT</div>
              <h2>THE REBUILD</h2>
            </div>
            <p>
              The rebuild will compare the original Spring 2025 model with the current Revit model and show how the project changed as the modeling workflow, building systems, families, envelope, interiors, and visualization developed.
            </p>
          </div>

          <div className={styles.rebuildGrid}>
            <div>
              <Placeholder label="ORIGINAL 2025 MODEL" className={styles.mediaPlaceholder} />
              <div className={styles.rebuildLabels}>
                <span>SPRING 2025</span>
                <span>RHINO + REVIT</span>
              </div>
            </div>
            <div>
              <Placeholder label="CURRENT REVIT MODEL" className={styles.mediaPlaceholder} />
              <div className={styles.rebuildLabels}>
                <span>CURRENT MODEL</span>
                <span>REVIT + D5</span>
              </div>
            </div>
          </div>

          <div className={styles.rebuildCopy}>
            <div className={styles.rebuildPath}>
              <div><span>2025</span><span>ORIGINAL MODEL</span></div>
              <div><span>2026</span><span>REVIT REBUILD</span></div>
              <div><span>NEXT</span><span>VISUALIZATION</span></div>
            </div>
            <p>
              This section will document the project as a continuing design process rather than a frozen semester submission. It will show where the original workflow started, what was rebuilt, and how the project became a much more complete architectural model after graduation.
            </p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.container}`}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionKicker}>MODEL DEPTH</div>
              <h2>BUILDING DETAILS</h2>
            </div>
            <p>
              This section will zoom into the pieces that are easy to miss at the scale of the full tower, including facade systems, custom Revit families, interior components, structure, circulation, and major shared spaces.
            </p>
          </div>

          <div className={styles.detailsGrid}>
            <Placeholder label="DETAIL 01" className={styles.detailCard} />
            <Placeholder label="DETAIL 02" className={`${styles.detailCard} ${styles.detailCardTall}`} />
            <Placeholder label="DETAIL 03" className={styles.detailCard} />
          </div>
        </section>

        <section className={`${styles.section} ${styles.container}`}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionKicker}>BUILDING SECTION</div>
              <h2>A VERTICAL CAMPUS</h2>
            </div>
            <p>
              A major building section will connect the individual floor plans back to the full fifteen floor project and show how parking, academy spaces, shared circulation, and teacher housing work together vertically.
            </p>
          </div>

          <Placeholder label="MAJOR BUILDING SECTION" className={styles.sectionDrawing} />
        </section>

        <section className={`${styles.section} ${styles.container}`}>
          <div>
            <div className={styles.sectionKicker}>FINAL PROJECT IMAGERY</div>
            <h2 className={styles.sectionTitle}>DES MOINES ACADEMY</h2>
          </div>

          <div className={styles.finalGallery}>
            <Placeholder label="FINAL RENDER 01" className={styles.finalHeroPlaceholder} />
            <div className={styles.finalGallerySplit}>
              <Placeholder label="FINAL RENDER 02" className={styles.finalSmallPlaceholder} />
              <Placeholder label="FINAL RENDER 03" className={styles.finalSmallPlaceholder} />
            </div>
            <Placeholder label="FINAL RENDER 04" className={styles.finalHeroPlaceholder} />
          </div>
        </section>

        <div className={styles.footerNote}>
          PAGE SHELL · PLACEHOLDER CONTENT WILL BE REPLACED AS REVIT AND D5 ASSETS ARE PRODUCED
        </div>
      </main>
    </>
  );
}
