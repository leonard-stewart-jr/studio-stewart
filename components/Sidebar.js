// NOTE: this is your existing Sidebar.js with the portfolio link block updated
// to programmatically set window.location.hash when already on the viewer page.
// This guarantees PortfolioViewer's hashchange listener runs reliably.
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

  // Helper to navigate to the portfolio viewer with a hash and close the sidebar.
  // Behavior:
  // - If already on /undergraduate-portfolio, set window.location.hash = hash (always fires hashchange).
  // - Otherwise, navigate with router.push to /undergraduate-portfolio#hash (shallow).
  // - Fallback to location.href if router push fails.
  const navigateToPortfolioHash = (hash) => {
    const url = `/undergraduate-portfolio#${hash}`;
    try {
      if (typeof window !== "undefined") {
        // If we're already on the viewer page, setting location.hash ensures the browser fires a hashchange event
        // even when there's no full navigation — this is the most reliable behavior for in-place viewer updates.
        if (window.location.pathname === "/undergraduate-portfolio") {
          // If the hash is already identical, force a small history push so hashchange triggers:
          const currentHash = (window.location.hash || "").replace(/^#/, "");
          if (currentHash === hash) {
            // Force a new history entry with pushState so hashchange handlers run predictably.
            try {
              const newUrl = `${window.location.pathname}#${hash}`;
              window.history.pushState({}, "", newUrl);
              // Manually dispatch a hashchange event to be 100% certain listeners run.
              window.dispatchEvent(new HashChangeEvent("hashchange"));
            } catch {
              // fallback
              window.location.hash = hash;
            }
          } else {
            // Normal case: different hash — set it (triggers hashchange)
            window.location.hash = hash;
          }
        } else {
          // Not currently on the viewer page — navigate there with shallow push so page routing is minimal.
          router.push(url, undefined, { shallow: true }).catch(() => {
            // As a robust fallback, do a full navigation
            window.location.href = url;
          });
        }
      } else {
        // Server-side or unknown environment — attempt router navigation
        router.push(url, undefined, { shallow: true }).catch(() => {});
      }
    } catch (err) {
      // Final fallback: set hash directly
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
            gap: 8, // reduced global gap; .topNavGroup will preserve large spacing for top nav
            marginTop: logoSize,
            paddingLeft: sidebarPaddingLeft,
            paddingRight: sidebarPaddingLeft,
          }}
        >
          {/* Top nav links grouped so we can preserve larger spacing for them only */}
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
            {/* Oldest first mapping — these ids correspond exactly to your manifest page ids.
                We use direct hash updates when already on the viewer page so PortfolioViewer responds in-place. */}

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

            {/* Two internal route projects — converted to two-line layout to match the portfolio links */}
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

          <div className={styles.sidebarSectionTitle}>Step 2: Even more content</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {[...Array(10)].map((_, i) => (
              <li key={`more-${i}`}>
                <a href="#" style={{ color: "#b1b1ae", fontSize: 13 }}>
                  Item {i + 1}
                </a>
              </li>
            ))}
          </ul>

          <div className={styles.sidebarSectionTitle}>Step 3: Placeholder Section</div>
          <p style={{ fontSize: 13, color: "#888" }}>
            This section exists to make the sidebar content long enough to require scrolling on mobile and desktop. You can add or remove items as needed.
          </p>

          <div className={styles.sidebarSectionTitle}>Step 4: Final Section</div>
          <p style={{ fontSize: 13, color: "#888" }}>
            If you can scroll this sidebar, the overflow-y: auto is working as intended.
          </p>
        </nav>

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
        >
          <h3>Other Links</h3>
          <ul>
            {socialLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </motion.aside>
    </>
  );
}
