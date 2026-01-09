import { useEffect, useState, useCallback } from "react";

/**
 * PortfolioViewer
 * - Fetches /portfolio/undergraduate/manifest.json
 * - Renders current page in an iframe
 * - Navigation: left/right buttons, keyboard arrows, and click zones
 * - Optional deep-linking via ?page=<id>
 *
 * To add/remove/reorder pages, edit public/portfolio/undergraduate/manifest.json.
 */
export default function PortfolioViewer({
  manifestUrl = "/portfolio/undergraduate/manifest.json"
}) {
  const [manifest, setManifest] = useState(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState(null);

  // Load manifest
  useEffect(() => {
    let isMounted = true;
    fetch(manifestUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load manifest: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (!data || !Array.isArray(data.pages) || data.pages.length === 0) {
          throw new Error("Manifest missing 'pages' array or it is empty.");
        }
        setManifest(data);

        // Optional: read ?page=<id> to start at a specific page
        const params =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : null;
        const startId = params ? params.get("page") : null;
        if (startId) {
          const startIndex = data.pages.findIndex((p) => p.id === startId);
          setIndex(startIndex >= 0 ? startIndex : 0);
        } else {
          setIndex(0);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Error loading manifest.");
      });
    return () => {
      isMounted = false;
    };
  }, [manifestUrl]);

  const total = manifest?.pages?.length || 0;
  const headerHeight = manifest?.headerHeight ?? 60;

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setIndex((i) => Math.min(total - 1, i + 1)),
    [total]
  );

  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "Home") {
        e.preventDefault();
        setIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setIndex(total > 0 ? total - 1 : 0);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext, total]);

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h2 style={{ margin: 0 }}>Error</h2>
        <p style={{ color: "#a33" }}>{error}</p>
      </div>
    );
  }
  if (!manifest) {
    return (
      <div style={{ padding: "20px" }}>
        <p>Loading portfolio…</p>
      </div>
    );
  }

  const page = manifest.pages[index];
  const viewerHeight = `calc(100vh - ${headerHeight}px)`;

  return (
    <div
      style={{
        width: "100%",
        height: viewerHeight,
        position: "relative",
        background: "#fff",
      }}
    >
      {/* Top info bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          background: "rgba(255,255,255,0.9)",
          borderBottom: "1px solid #eee",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: "coolvetica, sans-serif",
            fontSize: 14,
            color: "#6c6c6a",
            textTransform: "uppercase",
            letterSpacing: ".04em",
          }}
        >
          {manifest.title || "Undergraduate Portfolio"}
        </div>
        <div
          style={{
            fontFamily: "coolvetica, sans-serif",
            fontSize: 12,
            color: "#6c6c6a",
            letterSpacing: ".02em",
          }}
        >
          {page?.id || `Page ${index + 1}`} • {index + 1}/{total}
        </div>
      </div>

      {/* Iframe viewer */}
      <iframe
        key={page?.src || index}
        src={page?.src}
        title={page?.id || `Page ${index + 1}`}
        style={{
          position: "absolute",
          top: 44,
          left: 0,
          width: "100%",
          height: `calc(100% - 44px)`,
          border: "none",
          background: "#fff",
        }}
      />

      {/* Click zones for navigation */}
      <button
        aria-label="Previous page"
        onClick={goPrev}
        disabled={index <= 0}
        style={{
          position: "absolute",
          left: 0,
          top: 44,
          width: "50%",
          height: "calc(100% - 44px)",
          background: "transparent",
          border: "none",
          cursor: index > 0 ? "pointer" : "not-allowed",
          zIndex: 1,
        }}
      />
      <button
        aria-label="Next page"
        onClick={goNext}
        disabled={index >= total - 1}
        style={{
          position: "absolute",
          right: 0,
          top: 44,
          width: "50%",
          height: "calc(100% - 44px)",
          background: "transparent",
          border: "none",
          cursor: index < total - 1 ? "pointer" : "not-allowed",
          zIndex: 1,
        }}
      />

      {/* Arrow controls */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          display: "flex",
          gap: 8,
          zIndex: 2,
        }}
      >
        <button
          onClick={() => setIndex(0)}
          disabled={index === 0}
          style={arrowBtnStyle}
          aria-label="First page"
          title="First"
        >
          ⏮
        </button>
        <button
          onClick={goPrev}
          disabled={index === 0}
          style={arrowBtnStyle}
          aria-label="Previous page"
          title="Previous"
        >
          ←
        </button>
        <button
          onClick={goNext}
          disabled={index >= total - 1}
          style={arrowBtnStyle}
          aria-label="Next page"
          title="Next"
        >
          →
        </button>
        <button
          onClick={() => setIndex(total - 1)}
          disabled={index >= total - 1}
          style={arrowBtnStyle}
          aria-label="Last page"
          title="Last"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}

const arrowBtnStyle = {
  background: "#fff",
  color: "#181818",
  border: "1px solid #ddd",
  borderRadius: 6,
  padding: "8px 10px",
  cursor: "pointer",
  fontFamily: "coolvetica, sans-serif",
  fontSize: 14,
};
