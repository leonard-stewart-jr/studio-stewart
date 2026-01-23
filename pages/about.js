import Head from "next/head";
import styles from "../styles/about.module.css";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About — Studio Stewart</title>
        <meta
          name="description"
          content="Studio Stewart — portfolio, independent studio, and 3D printing practice founded by Leonard Stewart. Architecture, research, and digital fabrication."
        />
      </Head>

      <main className={styles.container}>
        {/* Header: H1 on the left */}
        <header className={styles.headerRow}>
          <h1 className={styles.pageTitle}>ABOUT</h1>
        </header>

        {/* LOGO: Pin to top-right INSIDE container */}
        <figure className={styles.introLogoFigure}>
          <img
            src="/images/about/logo.png"
            alt="Studio Stewart logo"
            className={styles.introLogo}
          />
        </figure>

        {/* Intro: left = lead paragraph */}
        <section className={styles.intro} aria-labelledby="about-intro">
          <div className={styles.introText}>
            <p className={styles.lead}>
              Founded in 2025 when Leonard set out to learn web development for a school project.
              He hand-coded the site to keep complete control over hosting and content and to combine
              work and 3D prints into a single, presentable hub. What started as a technical exercise
              is now a portfolio, research hub, and an emerging 3D printing shop.
            </p>
          </div>
        </section>

        {/* Tagline row: full-bleed container with centered inner wrapper. Right-aligned and clamped to up to two lines. */}
        <section className={styles.taglineRow} aria-hidden>
          <div className={styles.taglineInner}>
            <p className={styles.small}>
              Studio Stewart is a small studio working at the intersection of architecture, research, and digital fabrication.
            </p>
          </div>
        </section>

        {/* METHOD (H2 right-aligned, paragraph right-aligned, max-width 740px) */}
        <section className={styles.methodSection}>
          <h2 className={`${styles.sectionHeading} ${styles.h2Right}`}>METHOD</h2>
          <div className={styles.methodRow}>
            <div className={styles.methodInner}>
              <p className={styles.methodText}>
                Studio Stewart adapts its approach to each project, testing ideas quickly with sketches, mass models, and test 3D prints.
                <br /><br />
                Iteration is central. Many problems only become visible through making, so ideas are tested, revised, and tested again. The tools used let the studio move between digital design, physical making, and web presentation without losing control of the outcome.
              </p>
            </div>
          </div>
        </section>

        {/* SERVICES (H2 left-aligned) */}
        <section className={styles.servicesSection}>
          <h2 className={`${styles.sectionHeading} ${styles.h2Left}`}>SERVICES</h2>

          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <h4 className={styles.serviceTitle}>DESIGN</h4>
              <p className={styles.serviceText}>
                Studio projects and academic proposals are developed through sketches, drawings, and models and presented with clear visuals that show idea and intent.
             </p>
            </div>
            <div className={styles.serviceCard}>
              <h4 className={styles.serviceTitle}>RESEARCH</h4>
              <p className={styles.serviceText}>
                Independent research looks at how architecture affects environmental sustainability, political systems, and human wellbeing using diagrams, illustrated essays, and speculative proposals.
              </p>
            </div>
            <div className={styles.serviceCard}>
              <h4 className={styles.serviceTitle}>3D PRINTING</h4>
              <p className={styles.serviceText}>
                3D printing shop for sports logos and coasters, lithophanes <b>(image to print w/ color)</b>, architectural models, and custom modular prints such as a travel chessboard.
              </p>
            </div>
          </div>

          {/* Full-bleed banner */}
          <figure className={styles.fullBleedBanner} aria-hidden="true">
            <img
              src="/images/about/banner.png"
              alt="Studio Stewart — banner of sample prints and logos"
              className={styles.fullBleedImage}
            />
          </figure>
        </section>

        {/* FIRM SKILLS (H2 right-aligned) */}
        <section className={styles.skillsSection}>
          <h2 className={`${styles.sectionHeading} ${styles.h2Right}`}>FIRM SKILLS</h2>

          <div className={styles.skillsGrid}>
            <div className={styles.skillColumn}>
              <h4 className={styles.skillHeading}>TOOLS</h4>
              <ul className={styles.skillList}>
                <li>Rhino</li>
                <li>Revit</li>
                <li>Enscape</li>
                <li>Fusion 360</li>
                <li>Blender</li>
                <li>Adobe Creative Cloud</li>
                <ul>
                  <li>Adobe Photoshop</li>
                  <li>Adobe Illustrator</li>
                  <li>Adobe InDesign</li>
                  <li>Adobe Premiere Pro</li>
                </ul>
              </ul>
            </div>

            <div className={styles.skillColumn}>
              <h4 className={styles.skillHeading}>DESIGN</h4>
              <ul className={styles.skillList}>
                <li>Conceptual design</li>
                <li>Visual communication &amp; diagramming</li>
                <li>Site analysis</li>
                <li>Program &amp; massing</li>
                <li>Modelmaking</li>
              </ul>
            </div>

            <div className={styles.skillColumn}>
              <h4 className={styles.skillHeading}>TECHNICAL</h4>
              <ul className={styles.skillList}>
                <li>Construction documentation</li>
                <li>Detailing</li>
                <li>Revit documentation</li>
                <li>Drawing sets &amp; schedules</li>
              </ul>
            </div>

            <div className={styles.skillColumn}>
              <h4 className={styles.skillHeading}>BUILD</h4>
              <ul className={styles.skillList}>
                <li>FDM &amp; Resin 3D printing</li>
                <li>Processing &amp; finishing metal &amp; wood</li>
                <li>Laser cutting</li>
                <li>Carpentry (framing to finishing)</li>
              </ul>
            </div>
            <div className={styles.skillColumn}>
              <h4 className={styles.skillHeading}>OTHER</h4>
              <ul className={styles.skillList}>
                <li>Lithophanes &amp; image prints</li>
                <li>Restroation</li>
                <li>Shoe Customizing</li>
                <li>Basic electronics (soldering / Arduino)</li>
                <li>Basic coding <small>(HTML / JS)</small></li>
              </ul>
            </div>
          </div>
        </section>

        {/* TEAM (H2 left-aligned) */}
        <section className={styles.teamSection}>
          <h2 className={`${styles.sectionHeading} ${styles.h2Left}`}>TEAM</h2>

          <div className={styles.teamGrid}>
            {/* Kobe / studio mascot */}
            <figure className={styles.kobeCard}>
              <img
                src="/images/about/kobe.png"
                alt="Kobe — studio mascot"
                className={styles.kobeImage}
              />
              <figcaption className={styles.kobeCaption}>KOBE</figcaption>
            </figure>

            {/* Bio and portraits */}
            <div className={styles.bioCard}>
              <div className={styles.portraits}>
                <img
                  src="/images/about/me-young.jpeg"
                  alt="Leonard young portrait"
                  className={styles.portraitImage}
                />
                <img
                  src="/images/about/me-now.jpg"
                  alt="Leonard current portrait"
                  className={styles.portraitImage}
                />
              </div>
              <div className={styles.bioText}>
                <h4 className={styles.name}>LEONARD STEWART</h4>
                <p>
                  Leonard Stewart earned a Master of Architecture from South Dakota State University and is the principal behind Studio Stewart. His work
                  spans architecture, research, and digital fabrication — balancing
                  design with hands-on making and web presentation.
                </p>
                <p className={styles.contactNote}>
                  For commissions, prints, or collaboration:{" "}
                  <a href="mailto:leonard.stewart@studio-stewart.com">
                    leonard.stewart@studio-stewart.com
                  </a>
                </p>
              </div>
            </div>
            {/* Firm logo (right) */}
            <figure className={styles.logoCard}>
              <img
                src="/images/about/logo.png"
                alt="Studio Stewart logo"
                className={styles.logoImage}
              />
            </figure>
          </div>
        </section>
      </main>
    </>
  );
}
