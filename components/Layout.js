import LogoHamburger from "./LogoHamburger";
// import NavBar from "./NavBar"; // Uncomment if you want to include your NavBar

export default function Layout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        background: "#fff", // or your preferred background
      }}
    >
      <header
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 0 0 8px",
          background: "#fff", // or your preferred background
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.02)",
          zIndex: 1000,
        }}
      >
        <LogoHamburger />
        {/* <NavBar />  // Uncomment to add your navigation bar here */}
      </header>
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {children}
      </main>
    </div>
  );
}
