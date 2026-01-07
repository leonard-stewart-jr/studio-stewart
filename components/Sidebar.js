/* ====== SIDEBAR STYLES (60px header) ====== */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  max-width: 80vw;
  height: 100vh;
  background: #fff;
  color: #181818;
  box-shadow: 2px 0 24px rgba(0,0,0,0.13);
  z-index: 2100;
  display: flex;
  flex-direction: column;
  padding: 0 22px 22px 22px;
  pointer-events: none;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* Custom Scrollbar Styles */
.sidebar::-webkit-scrollbar {
  width: 8px;
  background: #f0f0ed;
}
.sidebar::-webkit-scrollbar-thumb {
  background: #e6dbb9; /* Matches active nav color */
  border-radius: 6px;
}
.sidebar::-webkit-scrollbar-thumb:hover {
  background: #d6c08e;
}
.sidebar {
  scrollbar-width: thin;
  scrollbar-color: #e6dbb9 #f0f0ed;
}

.sidebar.open {
  pointer-events: auto;
}

@media (max-width: 700px) {
  .sidebar {
    left: 0 !important;
    width: 80vw !important;
    min-width: 0 !important;
    max-width: 100vw !important;
    padding: 0 12px 22px 12px !important;
    position: fixed !important;
    top: 0 !important;
    z-index: 1200 !important;
    height: 100vh !important;
    padding-top: env(safe-area-inset-top, 0);
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
}

/* ====== LOGO-HAMBURGER (60x60 to match header) ====== */
.logo-hamburger-wrap {
  position: relative;
  width: 60px;   /* matches 60px header */
  height: 60px;  /* matches 60px header */
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
}
.logo-hamburger-wrap img,
.logo-hamburger-wrap svg {
  position: absolute;
  inset: 0;
  width: 60px;
  height: 60px;
  transition: opacity 0.18s;
  pointer-events: none;
}

/* ====== SIDEBAR NAVIGATION (match navbar hover logic) ====== */
nav.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 22px;
  font-family: "coolvetica", sans-serif;
}

/* Default: darker gray, thin weight; uppercase; no underline */
.sidebarNavLink {
  color: #6c6c6a;            /* same as navbar default */
  font-family: "coolvetica", sans-serif;
  font-weight: 300;          /* thin to match navbar */
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-decoration: none;
  background: none;
  border: none;
  padding: 4px 0;
  margin: 0;
  transition: color 0.18s, font-weight 0.16s;
  display: inline-block;
  cursor: pointer;
}

/* Active: underline, keep thin, use active color, optional size bump */
.active {
  color: #e6dbb9;           /* same as navbar active */
  text-decoration: underline;
  cursor: default;
  font-size: 16px;          /* match navbar active size */
  font-weight: 300;         /* keep thin even when active */
}

/* Hover/focus (non-active): keep thin, change color, no underline */
.sidebarNavLink:not(.active):hover,
.sidebarNavLink:not(.active):focus {
  font-weight: 300;         /* do not bold on hover */
  color: #e6dbb9;           /* match navbar hover color */
  text-decoration: none;
}

/* Accessibility focus outline */
.sidebarNavLink:focus-visible {
  outline: 2px solid #e6dbb9;
}

/* ====== CLOSE BUTTON (top-right X) ====== */
.sidebar button[aria-label="Close menu"],
.sidebar [aria-label="Close sidebar"] {
  background: none;
  border: none;
  color: #181818;
  font-size: 32px;
  position: absolute;
  top: 16px;
  right: 18px;
  cursor: pointer;
  z-index: 2200;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
}

/* ====== OVERLAY ====== */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.22);
  z-index: 2000;
  display: none;
}
.sidebar-overlay.open {
  display: block;
  pointer-events: auto;
  touch-action: manipulation;
}

/* ====== OPTIONAL CONTENT/FOOTER/SOCIAL (if used) ====== */
.sidebar .sidebar-footer {
  margin-top: auto;
  font-size: 14px;
  color: #888;
}
.sidebar .sidebar-footer h3 {
  font-size: 17px;
  margin: 10px 0 6px 0;
  color: #181818;
}
.sidebar .sidebar-footer ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar .sidebar-footer li {
  margin-bottom: 5px;
}
.sidebar .sidebar-footer a {
  color: #181818;
  text-decoration: underline;
  font-size: 15.5px;
}
.sidebar .sidebar-info {
  margin: 18px 0 8px 0;
  font-size: 17px;
  color: #555;
}
.sidebar .sidebar-info b {
  font-weight: bold;
}
