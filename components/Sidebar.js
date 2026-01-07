import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/sidebar.module.css";

/**
 * Original pattern:
 * - Separate "X" button at top-right inside the sidebar closes it.
 * - The logo is shown on the left and does not act as a close button.
 */
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
    open:   { x: 0,        transition: { duration: 0.7, ease: [0.7, 0.2, 0.3, 1] } }
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
            className={`${styles.sidebar} open`}
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            {/* Top row: logo on the left, dedicated X close button on the right */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: headerHeight,
                paddingLeft: sidebarPaddingLeft,
                paddingRight: 18
              }}
            >
              <div
                style={{
                  width: logoSize,
                  height: logoSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start"
                }}
              >
                <img
                  src="/assets/logo-mark-only.svg"
                  alt="Studio Stewart Logo"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>

              <button
                aria-label="Close menu"
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "#181818",
                  fontSize: 28,
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
                title="Close menu"
              >
                ×
              </button>
            </div>

            {/* Nav links */}
            <nav
              className="sidebar-nav"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 22,
                paddingLeft: sidebarPaddingLeft
              }}
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`${styles.sidebarNavLink} ${isActive(item.href) ? styles.active : ""}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}