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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        transition: "transform 0.6s cubic-bezier(.75,-0.01,.29,1.01), opacity 0.6s",
        transform: slideOut ? "translateY(-100vh)" : "translateY(0)",
        opacity: slideOut ? 0 : 1,
        pointerEvents: slideOut ? "none" : "auto",
        cursor: "pointer",
        fontFamily: "'Futura', 'Open Sans', Arial, sans-serif",
        overflow: "hidden",
      }}
      title="Click or tap to skip"
    >
      {/* Logo centered and filling most of the screen */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100vw",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            display: "block",
            margin: "0 auto",
            maxWidth: "80vw",
            maxHeight: "80vh",
            width: "auto",
            height: "auto",
            filter: "grayscale(1)",
            objectFit: "contain",
            pointerEvents: "none",
            userSelect: "none",
          }}
          draggable={false}
        />
      </div>
      {/* "WELCOME" at the bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: 0,
          width: "100vw",
          textAlign: "center",
          zIndex: 2,
          pointerEvents: "none",
          fontFamily: "'Futura', 'Open Sans', Arial, sans-serif",
        }}
      >
        <span
          style={{
            display: "block",
            color: "#181818",
            fontWeight: 800,
            fontSize: 46,
            textTransform: "uppercase", // ensures ALL CAPS
            letterSpacing: "0.09em",
            fontFamily: "'Futura', 'Open Sans', Arial, sans-serif",
          }}
        >
          WELCOME
        </span>
      </div>
    </div>
  );
}
