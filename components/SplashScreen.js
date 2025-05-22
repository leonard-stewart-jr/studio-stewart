import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }) {
  const [mounted, setMounted] = useState(false);
  const [slideOut, setSlideOut] = useState(false);

  // Ensure this runs only on the client to fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => setSlideOut(true), 6000); // 6 seconds
    return () => clearTimeout(timer);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (slideOut) {
      const timer = setTimeout(onFinish, 600);
      return () => clearTimeout(timer);
    }
  }, [slideOut, onFinish, mounted]);

  function handleClick() {
    if (!slideOut) setSlideOut(true);
  }

  if (!mounted) {
    // Render a static fallback to match SSR
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          fontFamily: "'Futura', 'Open Sans', Arial, sans-serif",
          overflow: "hidden",
        }}
        title="Click or tap to skip"
      >
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
              textTransform: "uppercase",
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
            textTransform: "uppercase",
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
