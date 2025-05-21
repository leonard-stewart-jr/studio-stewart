export default function SplashScreen({ onFinish }) {
  // Optional: add swipe logic with touch events if you want!
  return (
    <div
      onClick={onFinish}
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        flexDirection: "column",
        cursor: "pointer"
      }}
      title="Click or tap to enter"
    >
      <img src="/logo.png" alt="Logo" style={{ width: 180, marginBottom: 32 }} />
      <span style={{ color: "#333", fontWeight: "bold", fontSize: 26 }}>Tap anywhere to enter Studio Stewart</span>
    </div>
  );
}
