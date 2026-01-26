import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Link from "next/link";
import LogoHamburger from "./LogoHamburger";
import styles from "../styles/sidebar.module.css";

const navItems = [
  { label: "PROJECTS", href: "/" },
  { label: "3D PRINTING", href: "/3d-printing" },
  { label: "MATTER MATTERS", href: "/matter-matters" },
  { label: "ABOUT", href: "/about" },
];

const socialLinks = [
  { label: "Email", href: "mailto:leonard.stewart@studio-stewart.com" },
  { label: "My Code Here", href: "https://github.com/leonard-stewart-jr" },
];

export default function Sidebar({
  open,
  onClose,
  logoSize = 60,
  sidebarPaddingLeft = 22,
  headerHeight = 60,
}) {
  const router = useRouter();
  const verticalOffset = (headerHeight - logoSize) / 2 - 2;

  function isActive(href) {
    if (href === "/") return router.pathname === "/";
    return router.pathname === href || router.pathname.startsWith(href + "/");
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const sidebarVariants = {
    closed: { x: "-100%", transition: { duration: 0.7, ease: [0.7, 0.2, 0.3, 1] } },
    open: { x: 0, transition: { duration: 0.7, ease: [0.7, 0.2, 0.3, 1] } }
  };
  const hamburgerTransition = { duration: 0.18, ease: "linear" };

  // Helper to navigate to the portfolio viewer with a hash and close the sidebar
  const navigateToPortfolioHash = (hash) => {
    const url = `/undergraduate-portfolio#${hash}`;
    try {
      if (typeof window !== "undefined") {
        if (window.location.pathname === "/undergraduate-portfolio") {
          const currentHash = (window.location.hash || "").replace(/^#/, "");
          if (currentHash === hash) {
            try {
              const newUrl = `${window.location.pathname}#${hash}`;
              window.history.pushState({}, "", newUrl);
              window.dispatchEvent(new HashChangeEvent("hashchange"));
            } catch {
              window.location.hash = hash;
            }
          } else {
            window.location.hash = hash;
          }
        } else {
          router.push(url, undefined, { shallow: true }).catch(() => {
            window.location.href = url;
          });
        }
      } else {
        router.push(url, undefined, { shallow: true }).catch(() => { });
      }
    } catch (err) {
      if (typeof window !== "undefined") window.location.hash = hash;
    } finally {
      if (typeof onClose === "function") onClose();
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: "easeOut" }}
            onClick={onClose}
            aria-label="Close menu"
            className={styles.sidebarOverlay}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`${styles.sidebar} ${open ? styles.open : ""}`}
        initial={false}
        animate={open ? "open" : "closed"}
        variants={sidebarVariants}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {open && (
          <motion.div
            transition={hamburgerTransition}
            style={{
              position: "absolute",
              top: verticalOffset,
              right: 28,
              zIndex: 2200,
              cursor: "pointer",
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
              transition: "opacity 0.18s",
            }}
          >
            <LogoHamburger
              logoSize={logoSize}
              sidebarPaddingLeft={sidebarPaddingLeft}
              onOpenSidebar={onClose}
            />
          </motion.div>
        )}

        <nav
          className={styles.sidebarNav}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: logoSize,
            paddingLeft: sidebarPaddingLeft,
            paddingRight: sidebarPaddingLeft,
          }}
        >
          {/* Top nav links */}
          <div className={styles.topNavGroup}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.sidebarNavLink} ${isActive(item.href) ? styles.active : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Chronological Portfolio (oldest → newest) */}
          <div className={styles.sidebarSectionTitle}>Chronological Portfolio</div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <li>
              <a
                href="/undergraduate-portfolio#spring2021"
                onClick={(e) => { e.preventDefault(); navigateToPortfolioHash("spring2021"); }}
                className={styles.portfolioLink}
                aria-label="Axonometric Cube Design — Spring 2021"
                title="AXONOMETRIC CUBE DESIGN - SPRING 2021"
              >
                <span className={styles.portfolioLinkYear}>SPRING 2021</span>
                <span className={styles.portfolioLinkTitle}>AXONOMETRIC CUBE DESIGN</span>
              </a>
            </li>
            <li>
              <a
                href="/undergraduate-portfolio#fall2021"
                onClick={(e) => { e.preventDefault(); navigateToPortfolioHash("fall2021"); }}
                className={styles.portfolioLink}
                aria-label='Design Practice "Stickplay" — Fall 2021'
                title='DESIGN PRACTICE "STICKPLAY" - FALL 2021'
              >
                <span className={styles.portfolioLinkYear}>FALL 2021</span>
                <span className={styles.portfolioLinkTitle}>DESIGN PRACTICE "STICKPLAY"</span>
              </a>
            </li>
            <li>
              <a
                href="/undergraduate-portfolio#spring2022-1"
                onClick={(e) => { e.preventDefault(); navigateToPortfolioHash("spring2022-1"); }}
                className={styles.portfolioLink}
                aria-label="Technical Vignettes — Spring 2022"
                title="TECHNICAL VIGNETTES - SPRING 2022"
              >
                <span className={styles.portfolioLinkYear}>SPRING 2022</span>
                <span className={styles.portfolioLinkTitle}>TECHNICAL VIGNETTES</span>
              </a>
            </li>
            <li>
              <a
                href="/undergraduate-portfolio#spring2022-2"
                onClick={(e) => { e.preventDefault(); navigateToPortfolioHash("spring2022-2"); }}
                className={styles.portfolioLink}
                aria-label="SDSU Agricultural Heritage Museum — Spring 2022"
                title="SDSU AGRICULTURAL HERITAGE MUSEUM - SPRING 2022"
              >
                <span className={styles.portfolioLinkYear}>SPRING 2022</span>
                <span className={styles.portfolioLinkTitle}>SDSU AGRICULTURAL HERITAGE MUSEUM</span>
              </a>
            </li>
            <li>
              <a
                href="/undergraduate-portfolio#spring2023-1"
                onClick={(e) => { e.preventDefault(); navigateToPortfolioHash("spring2023-1"); }}
                className={styles.portfolioLink}
                aria-label="SDSU Interfaith Center — Spring 2023"
                title="SDSU INTERFAITH CENTER - SPRING 2023"
              >
                <span className={styles.portfolioLinkYear}>SPRING 2023</span>
                <span className={styles.portfolioLinkTitle}>SDSU INTERFAITH CENTER</span>
              </a>
            </li>
            <li>
              <a
                href="/undergraduate-portfolio#spring2024-1"
                onClick={(e) => { e.preventDefault(); navigateToPortfolioHash("spring2024-1"); }}
                className={styles.portfolioLink}
                aria-label="Brookings Public Library — Spring 2024"
                title="BROOKINGS PUBLIC LIBRARY - SPRING 2024"
              >
                <span className={styles.portfolioLinkYear}>SPRING 2024</span>
                <span className={styles.portfolioLinkTitle}>BROOKINGS PUBLIC LIBRARY</span>
              </a>
            </li>
            <li>
              <a
                href="/undergraduate-portfolio#fall2024-1"
                onClick={(e) => { e.preventDefault(); navigateToPortfolioHash("fall2024-1"); }}
                className={styles.portfolioLink}
                aria-label="Centro de Ciencias Vegetales de Monterrey — Fall 2024"
                title="CENTRO DE CIENCIAS VEGETALES DE MONTERREY - FALL 2024"
              >
                <span className={styles.portfolioLinkYear}>FALL 2024</span>
                <span className={styles.portfolioLinkTitle}>CENTRO DE CIENCIAS VEGETALES DE MONTERREY</span>
              </a>
            </li>
            <li>
              <Link href="/projects/dma-25" passHref legacyBehavior>
                <a
                  onClick={onClose}
                  className={styles.portfolioLink}
                  aria-label="Des Moines Academy of Arts & Athletics — Spring 2025"
                  title="DES MOINES ACADEMY OF ARTS & ATHLETICS - SPRING 2025"
                >
                  <span className={styles.portfolioLinkYear}>SPRING 2025</span>
                  <span className={styles.portfolioLinkTitle}>DES MOINES ACADEMY OF ARTS & ATHLETICS</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/independent-studio" passHref legacyBehavior>
                <a
                  onClick={onClose}
                  className={styles.portfolioLink}
                  aria-label="Investigation into (in)Justice Facilities — Summer 2025"
                  title="INVESTIGATION INTO (IN)JUSTICE FACILITIES - SUMMER 2025"
                >
                  <span className={styles.portfolioLinkYear}>SUMMER 2025</span>
                  <span className={styles.portfolioLinkTitle}>INVESTIGATION INTO (IN)JUSTICE FACILITIES</span>
                </a>
              </Link>
            </li>
          </ul>

          {/* ===== 3D PRINTING SECTION ===== */}
          <div className={styles.sidebarSectionTitle}>3D Printing</div>
          <ul className={styles.sidebarList}>
            <li>
              <div className={styles.sidebarSubtitle}>Sports</div>
              <ul className={styles.sidebarSublist}>
                <li>
                  <Link
                    href={{ pathname: "/3d-printing", query: { tab: "sports", league: "nfl" } }}
                    aria-label="3D Printing NFL"
                    className={styles.sidebarSubLink}
                  >
                    NFL
                  </Link>
                </li>
                <li>
                  <Link
                    href={{ pathname: "/3d-printing", query: { tab: "sports", league: "nba" } }}
                    aria-label="3D Printing NBA"
                    className={styles.sidebarSubLink}
                  >
                    NBA
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link
                href={{ pathname: "/3d-printing", query: { tab: "lithophanes" } }}
                aria-label="3D Printing Lithophanes"
                className={styles.sidebarLink}
              >
                Lithophanes
              </Link>
            </li>
            <li>
              <Link
                href={{ pathname: "/3d-printing", query: { tab: "other" } }}
                aria-label="3D Printing Other"
                className={styles.sidebarLink}
              >
                Other
              </Link>
            </li>
          </ul>
          {/* ===== END 3D PRINTING SECTION ===== */}

        <div className={styles.sidebarSectionTitle}>Contacts</div>
          <ul className={styles.sidebarList}>
            <li>
                <a href="mailto:leonardwaynejr@icloud.com" className={styles.sidebarLink} aria-label="Email">Email</a>
            </li>
             <li>
                <a href="https://www.linkedin.com/in/leonardstewartjr/" className={styles.sidebarLink} aria-label="LinkedIn">LinkedIn</a>
            </li>
            <li>
              <a href="https://makerworld.com/en/@leonardstewart" className={styles.sidebarLink} aria-label="Makerworld">MakerWorld</a>
            </li>
            <li>
              <a href="tel:6053107894" className={styles.sidebarLink} aria-label="Phone">Phone</a>
            </li>
            <li>
              <a href="https://github.com/leonard-stewart-jr/studio-stewart" className={styles.sidebarLink} aria-label="CODE">CODE</a>
            </li>
          </ul>
        <div className={styles.sidebarInfo} style={{ padding: "24px" }}>
          <p>
            <b>Leonard Stewart</b> — Digital portfolio<br />
            Architecture Student, designer, and maker.<br />
            Explore my work and reach out to connect!
          </p>
        </div>

        <div
          className={styles.sidebarFooter}
          style={{
            padding: "0 24px 24px",
            marginBottom: "100px",
          }}
    </nav>

  </motion.aside>
</>
  );
}
