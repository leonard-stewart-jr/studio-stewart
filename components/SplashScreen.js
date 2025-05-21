import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }) {
  const [slideOut, setSlideOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlideOut(true), 6000); // 6 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
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
        cursor: "pointer",
        fontFamily: "'Futura', 'Open Sans', Arial, sans-serif"
      }}
      title="Click or tap to skip"
    >
      <img
        src="/logo.png"
        alt="Logo"
        style={{
          width: 280,            // smaller logo size
          height: "auto",
          marginBottom: 32,
          filter: "grayscale(1)", // make logo grayscale
        }}
      />
      <span style={{
        color: "#181818",
        fontWeight: 800,
        fontSize: 32, // new size, change as you wish
        fontFamily: "'Futura', 'Open Sans', Arial, sans-serif",
        textTransform: "uppercase",
        letterSpacing: "0.10em",
        textAlign: "center",
        lineHeight: 1.2,
        marginBottom: 8,
      }}>
        {/* Change your greeting text here */}
        Discover the Creative World<br />of Studio Stewart
      </span>
      <span style={{
        color: "#888",
        fontWeight: 400,
        fontSize: 20, // change secondary text size here
        letterSpacing: "0.03em",
        textAlign: "center",
        marginTop: 8,
      }}>
        Portfolio &mdash; Architecture, Coding, Design, and Making
      </span>
      <span style={{ marginTop: 28, fontSize: 14, color: "#aaa" }}>
        (Click or tap to skip)
      </span>
    </div>
  );
}
