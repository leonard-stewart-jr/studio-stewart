// NOTE: this is your existing Sidebar.js with only the portfolio link block replaced.
// Replace the corresponding section in your file with the block below (or replace the file wholesale).
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
  { label: "ABOUT ME", href: "/about" },
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
            gap: 22,
            marginTop: logoSize,
            paddingLeft: sidebarPaddingLeft,
            paddingRight: sidebarPaddingLeft,
          }}
        >
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref legacyBehavior>
              <a
                className={`${styles.sidebarNavLink} ${isActive(item.href) ? styles.active : ""}`}
                onClick={onClose}
              >
                {item.label}
              </a>
            </Link>
          ))}

          {/* Chronological Portfolio (oldest → newest) */}
          <div style={{ marginTop: 32, fontWeight: "bold" }}>Chronological Portfolio</div>

          <ul style={{ listStyle: "none", margin: 8, padding: 0 }}>
            {/* Oldest first mapping — these ids correspond to the manifest page ids */}
            <li>
              <Link href="/undergraduate-portfolio#spring2021" passHref legacyBehavior>
                <a onClick={onClose} style={{ color: "#888", fontSize: 13, display: "block", margin: "10px 0" }}>
                  Project 01 — [Spring 2021]
                </a>
              </Link>
            </li>

            <li>
              <Link href="/undergraduate-portfolio#fall2021" passHref legacyBehavior>
                <a onClick={onClose} style={{ color: "#888", fontSize: 13, display: "block", margin: "10px 0" }}>
                  Project 02 — [Fall 2021]
                </a>
              </Link>
            </li>

            <li>
              <Link href="/undergraduate-portfolio#spring2022-1" passHref legacyBehavior>
                <a onClick={onClose} style={{ color: "#888", fontSize: 13, display: "block", margin: "10px 0" }}>
                  Project 03 — [Spring 2022]
                </a>
              </Link>
            </li>

            <li>
              <Link href="/undergraduate-portfolio#spring2023-1" passHref legacyBehavior>
                <a onClick={onClose} style={{ color: "#888", fontSize: 13, display: "block", margin: "10px 0" }}>
                  Project 04 — [Spring 2023]
                </a>
              </Link>
            </li>

            <li>
              <Link href="/undergraduate-portfolio#spring2024-1" passHref legacyBehavior>
                <a onClick={onClose} style={{ color: "#888", fontSize: 13, display: "block", margin: "10px 0" }}>
                  Project 05 — [Spring 2024]
                </a>
              </Link>
            </li>

            <li>
              <Link href="/undergraduate-portfolio#fall2024-1" passHref legacyBehavior>
                <a onClick={onClose} style={{ color: "#888", fontSize: 13, display: "block", margin: "10px 0" }}>
                  Project 06 — [Fall 2024]
                </a>
              </Link>
            </li>

            {/* Two internal route projects */}
            <li>
              <Link href="/projects/dma-25" passHref legacyBehavior>
                <a onClick={onClose} style={{ color: "#888", fontSize: 13, display: "block", margin: "14px 0 10px 0" }}>
                  DMA-25 — Des Moines Academy (route)
                </a>
              </Link>
            </li>

            <li>
              <Link href="/independent-studio" passHref legacyBehavior>
                <a onClick={onClose} style={{ color: "#888", fontSize: 13, display: "block", margin: "10px 0" }}>
                  Independent Studio — (route)
                </a>
              </Link>
            </li>
          </ul>

          <div style={{ marginTop: 32, fontWeight: "bold" }}>Step 2: Even more content</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {[...Array(10)].map((_, i) => (
              <li key={`more-${i}`}>
                <a href="#" style={{ color: "#b1b1ae", fontSize: 13 }}>
                  Item {i + 1}
                </a>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 32, fontWeight: "bold" }}>Step 3: Placeholder Section</div>
          <p style={{ fontSize: 13, color: "#888" }}>
            This section exists to make the sidebar content long enough to require scrolling on mobile and desktop. You can add or remove items as needed.
          </p>

          <div style={{ marginTop: 32, fontWeight: "bold" }}>Step 4: Final Section</div>
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
