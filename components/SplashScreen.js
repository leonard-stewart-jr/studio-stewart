import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }) {
  const [slideOut, setSlideOut] = useState(false);

  useEffect(() => {
    // Auto slide-out after 2 seconds if not already dismissed
    const timer = setTimeout(() => setSlideOut(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Call onFinish after the slide animation completes (0.6s)
    if (slideOut) {
      const timer = setTimeout(onFinish, 600);
      return () => clearTimeout(timer);
    }
  }, [slideOut, onFinish]);

  function handleClick() {
    if (!slideOut) setSlideOut(true);
  }

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        flexDirection: "column",
        transition: "transform 0.6s cubic-bezier(.75,-0.01,.29,1.01), opacity 0.6s",
        transform: slideOut ? "translateY(-100vh)" : "translateY(0)",
        opacity: slideOut ? 0 : 1,
        pointerEvents: slideOut ? "none" : "auto",
        cursor: "pointer"
      }}
      title="Click or tap to skip"
    >
      <img src="/logo.png" alt="Logo" style={{ width: 180, marginBottom: 32 }} />
      <span style={{ color: "#333", fontWeight: "bold", fontSize: 26 }}>
        Welcome to Studio Stewart
      </span>
      <span style={{ marginTop: 20, fontSize: 14, color: "#aaa" }}>
        (Click or tap to skip)
      </span>
    </div>
  );
}
