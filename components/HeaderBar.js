import LogoHamburger from "./LogoHamburger";
import NavBar from "./NavBar";
// Import other components you may have, such as sidebar toggles or right-aligned icons.

export default function HeaderBar({ headerHeight = 76 }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", // Space between logo and nav bar
        height: headerHeight,
        width: "100%",
        padding: "0 32px",
        background: "#fff",
        boxShadow: "0 2px 10px 0 rgba(0,0,0,0.04)",
        position: "sticky",
        top: 0,
        zIndex: 2000,
      }}
    >
      {/* Left: Logo */}
      <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center" }}>
        <LogoHamburger />
      </div>
      {/* Center: NavBar */}
      <div style={{ flex: "1 1 auto", display: "flex", justifyContent: "center" }}>
        <NavBar headerHeight={headerHeight} />
      </div>
      {/* Right: Placeholder for future icons or menu */}
      <div style={{ flex: "0 0 40px" }} />
    </header>
  );
}
