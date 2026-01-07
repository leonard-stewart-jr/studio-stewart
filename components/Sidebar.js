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

export default function Sidebar({
  open,
  onClose,
  logoSize = 60,
  sidebarPaddingLeft = 22,
  headerHeight = 60,
}) {
  const router = useRouter();

  function isActive(href) {
    if (href === "/") return router.pathname === "/";
    return router.pathname === href || router.pathname.startsWith(href + "/");
  }

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const sidebarVariants = {
    closed: { x: "-100%", transition: { duration: 0.7, ease: [0.7, 0.2, 0.3, 1] } },
    open: { x: 0, transition: { duration: 0.7, ease: [0.7, 0.2, 0.3, 1] } },
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="sidebar-overlay open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            className={styles.sidebar}
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            {/* Top row: logo control on the RIGHT (replaces old X) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                height: headerHeight,
                paddingRight: 18, // where the X used to be
              }}
            >
              <LogoHamburger
                size={logoSize}
                hoverMode="x"      // logo by default, X on hover (sidebar only)
                title="Close menu"
                onClick={onClose}
              />
            </div>

            {/* Nav links */}
            <nav
              className="sidebar-nav"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 22,
                paddingLeft: sidebarPaddingLeft,
              }}
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`${styles.sidebarNavLink} ${
                    isActive(item.href) ? styles.active : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Optional extra content to preserve scroll behavior (leave or remove) */}
            <div className="sidebar-info" style={{ marginTop: 18, paddingLeft: sidebarPaddingLeft }}>
              <h3 style={{ margin: "10px 0 6px 0" }}>Step 1: Extra Links</h3>
              {[...Array(15)].map((_, i) => (
                <a key={i} href="#" className={styles.sidebarNavLink}>
                  Example Link {i + 1}
                </a>
              ))}

              <h3 style={{ margin: "18px 0 6px 0" }}>Step 2: Even more content</h3>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {[...Array(10)].map((_, i) => (
                  <li key={i}>
                    <a href="#" className={styles.sidebarNavLink}>
                      Item {i + 1}
                    </a>
                  </li>
                ))}
              </ul>

              <h3 style={{ margin: "18px 0 6px 0" }}>Step 3: Placeholder Section</h3>
              <p>
                This section exists to make the sidebar content long enough to require scrolling on
                mobile and desktop. You can add or remove items as needed.
              </p>

              <h3 style={{ margin: "18px 0 6px 0" }}>Step 4: Final Section</h3>
              <p>If you can scroll this sidebar, the overflow-y behavior is working as intended.</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}