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
        {/* Header */}
        <header className={styles.headerRow}>
          <h1 className={styles.pageTitle}>ABOUT</h1>
        </header>

        {/* Intro: left = intro text, right = studio logo (as requested) */}
        <section className={styles.intro}>
          <div className={styles.introText}>
            <p className={styles.lead}>
              Founded in 2025 when Leonard set out to learn web development for a
              school project. He hand-coded the site to keep complete control over
              hosting and content and to combine work and 3D prints into a single,
              presentable hub. What started as a technical exercise is now a
              portfolio, research hub, and an emerging 3D printing shop.
            </p>

            <p className={styles.small}>
              Studio Stewart is a small studio working at the intersection of
              architecture, research, and digital fabrication.
            </p>
          </div>

          <figure className={styles.introLogoFigure}>
            {/* This column now contains the logo (logo.png). */}
            <img
              src="/images/about/logo.png"
              alt="Studio Stewart logo"
              className={styles.introLogo}
            />
          </figure>
        </section>

        {/* Method */}
        <section className={styles.methodSection}>
          <div className={styles.methodInner}>
            <h2 className={styles.methodTitle}>METHOD</h2>
            <p className={styles.methodText}>
              Studio Stewart adapts its approach to each project, iterating
              between quick ideation sketches, mass models, and detailed digital
              fabrication. Ideas become visible through making — physical work and
              clean web presentation sit side-by-side, letting form, material, and
              process be the conversation.
            </p>
          </div>
        </section>

        {/* Services */}
        <section className={styles.servicesSection}>
          <h3 className={styles.sectionHeading}>SERVICES</h3>

          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <h4 className={styles.serviceTitle}>DESIGN</h4>
              <p className={styles.serviceText}>
                Studio projects and academic proposals are developed through
                sketches, drawings, models, and presentable working documents that
                show ideas and intent.
              </p>
            </div>

            <div className={styles.serviceCard}>
              <h4 className={styles.serviceTitle}>RESEARCH</h4>
              <p className={styles.serviceText}>
                Independent research looks at how architecture affects environments,
                boundaries, political systems, and human wellbeing — producing
                visual essays, built proposals, and supporting design research.
              </p>
            </div>

            <div className={styles.serviceCard}>
              <h4 className={styles.serviceTitle}>3D PRINTING</h4>
              <p className={styles.serviceText}>
                3D printing shop for custom objects, lithophanes, and models —
                specializing in sports logos, custom prototypes, and repeatable
                fabrication-ready parts.
              </p>
            </div>
          </div>

          {/* Full-bleed banner that spans the viewport width (replaces the placeholder circles) */}
          <figure className={styles.fullBleedBanner} aria-hidden>
            <img
              src="/images/about/banner.png"
              alt="Studio Stewart — banner of sample prints and logos"
              className={styles.fullBleedImage}
            />
          </figure>
        </section>

        {/* Firm skills */}
        <section className={styles.skillsSection}>
          <h3 className={styles.sectionHeading}>FIRM SKILLS</h3>

          <div className={styles.skillsGrid}>
            <div className={styles.skillColumn}>
              <h4 className={styles.skillHeading}>TOOLS</h4>
              <ul className={styles.skillList}>
                <li>Rhino</li>
                <li>Illustrator</li>
                <li>Fusion 360</li>
                <li>Blender</li>
                <li>Adobe Creative Cloud</li>
              </ul>
            </div>

            <div className={styles.skillColumn}>
              <h4 className={styles.skillHeading}>DESIGN</h4>
              <ul className={styles.skillList}>
                <li>Conceptual design</li>
                <li>Sketching + diagrams</li>
                <li>Physical modeling</li>
              </ul>
            </div>

            <div className={styles.skillColumn}>
              <h4 className={styles.skillHeading}>TECHNICAL</h4>
              <ul className={styles.skillList}>
                <li>Construction documentation</li>
                <li>3D modeling & CAD</li>
                <li>Parametric workflows</li>
              </ul>
            </div>

            <div className={styles.skillColumn}>
              <h4 className={styles.skillHeading}>BUILD</h4>
              <ul className={styles.skillList}>
                <li>FDM & resin 3D prints</li>
                <li>Laser cutting</li>
                <li>Rapid prototyping</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className={styles.teamSection}>
          <h3 className={styles.sectionHeading}>TEAM</h3>

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
                  Leonard Stewart earned a Master of Architecture from South Dakota
                  State University and is the principal behind Studio Stewart. His work
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

            {/* Firm logo (kept here too for larger layout) */}
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
