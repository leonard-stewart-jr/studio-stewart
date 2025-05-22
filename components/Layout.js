import HeaderBar from "./HeaderBar";

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#fff" }}>
      <HeaderBar />
      <main style={{ width: "100%", margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}
