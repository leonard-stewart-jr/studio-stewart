import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Link from "next/link";
import LogoHamburger from "./LogoHamburger";
import styles from "../styles/sidebar.module.css";

const navItems = [
  { label: "PROJECTS", href: "/" },
  // Removed "INDEPENDENT STUDIO" to match top nav bar
  { label: "3D PRINTING", href: "/3d-printing" },
  { label: "MATTER MATTERS", href: "/matter-matters" },
  { label: "ABOUT ME", href: "/about" },
];

const socialLinks = [
  { label: "Email", href: "mailto:leonard.stewart@studio-stewart.com" },
  { label: "My Code Here", href: "https://github.com/leonard-stewart-jr" },
  { label: "UNDERGRADUATE PORTFOLIO", href: "https://issuu.com/leonard.stewart/docs/architecture_portfolio" },
];

export default function Sidebar({
  open,
  onClose,
  logoSize = 66,
  sidebarPaddingLeft = 22,
  headerHeight = 76,
}) {
  const router = useRouter();
  const verticalOffset = (headerHeight - logoSize) / 2 - 2;

  function isActive(href) {
    if (href === "/") return router.pathname === "/";
    return router.pathname === href || router.pathname.startsWith(href + "/");
  }

  // Prevent background scroll when sidebar is open
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

  // Sidebar animation variants for framer-motion
  const sidebarVariants = {
    closed: { x: "-100%", transition: { duration: 0.7, ease: [0.7, 0.2, 0.3, 1] } },
    open:   { x: 0,      transition: { duration: 0.7, ease: [0.7, 0.2, 0.3, 1] } }
  };

  return (
    <>
      {/* Overlay uses AnimatePresence for smooth fade in/out */}
      <AnimatePresence>
        {open && (
          <motion.div
            className={`sidebar-overlay ${open ? "open" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`${styles.sidebar} ${open ? "open" : ""}`}
        initial="closed"
        animate={open ? "open" : "closed"}
        variants={sidebarVariants}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {open && (
          <button
            aria-label="Close sidebar"
            onClick={onClose}
          >
            ×
          </button>
        )}

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.sidebarNavLink} ${isActive(item.href) ? "active" : ""}`}
              onClick={onClose}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-info">
          <p>
            <b>Leonard Stewart</b> — Digital portfolio<br/>
            Architecture Student, designer, and maker.<br/>
            Explore my work and reach out to connect!
          </p>
        </div>

        <div className="sidebar-footer">
          <h3>Other Links</h3>
          <ul>
            {socialLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>
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
