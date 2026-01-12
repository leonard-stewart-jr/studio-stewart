import { useEffect, useState, useCallback, useRef } from "react";

/**
 * PortfolioViewer
 * - Fetches /portfolio/undergraduate/manifest.json
 * - Renders current page in an iframe
 * - Scales the entire page to fit the viewer height (no cropping)
 * - Navigation: left/right buttons, keyboard arrows, and click zones
 * - Optional deep-linking via ?page=<id>
 *
 * To add/remove/reorder pages, edit public/portfolio/undergraduate/manifest.json.
 *
 * Props:
 * - manifestUrl: string (default "/portfolio/undergraduate/manifest.json")
 * - showInfoBar: boolean (default false) — when true, shows the top info bar
 */
export default function PortfolioViewer({
  manifestUrl = "/portfolio/undergraduate/manifest.json",
  showInfoBar = false
}) {
  const [manifest, setManifest] = useState(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState(null);

  // Scaling state
  const iframeRef = useRef(null);
  const viewerRef = useRef(null);
  const [pageSize, setPageSize] = useState({ width: 612, height: 792 }); // default letter
  const [scale, setScale] = useState(1);

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
  const headerHeight = manifest?.headerHeight ?? 60; // site header above viewer

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

  // Measure the page's natural size inside the iframe
  const measureIframePage = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc =
        iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
      if (!doc || !doc.body) return;

      // Try to read explicit width/height set by InDesign export
      let w = doc.body.offsetWidth || 612;
      let h = doc.body.offsetHeight || 792;

      // If body has inline style width/height (e.g., "width:612px;height:792px")
      const style = doc.body.getAttribute("style") || "";
      const wMatch = style.match(/width:\s*([0-9.]+)px/i);
      const hMatch = style.match(/height:\s*([0-9.]+)px/i);
      if (wMatch) w = parseFloat(wMatch[1]) || w;
      if (hMatch) h = parseFloat(hMatch[1]) || h;

      // Some exports use an absolute first container with explicit width/height
      const firstDiv = doc.body.firstElementChild;
      if (firstDiv) {
        const cs = (firstDiv as HTMLElement).style || {};
        const w2 = (cs.width && parseFloat(cs.width)) || (firstDiv as HTMLElement).offsetWidth;
        const h2 = (cs.height && parseFloat(cs.height)) || (firstDiv as HTMLElement).offsetHeight;
        if (w2 && h2) {
          // Pick the larger reliable measurement
          if (h2 > 0) h = h2;
          if (w2 > 0) w = w2;
        }
      }

      setPageSize({ width: Math.max(1, w), height: Math.max(1, h) });
    } catch {
      // silently ignore cross-origin or timing issues; keep defaults
    }
  }, []);

  // Compute scale to fit viewer height
  const recomputeScale = useCallback(() => {
    if (!viewerRef.current) return;
    const viewerEl = viewerRef.current;
    const availableHeight = viewerEl.clientHeight; // already excludes site header via container style
    const naturalHeight = pageSize.height || 792;
    const s = availableHeight > 0 ? availableHeight / naturalHeight : 1;
    setScale(s);
  }, [pageSize.height]);

  // Recompute scale when page changes, iframe loads, or window resizes
  useEffect(() => {
    function onResize() {
      measureIframePage();
      // allow layout to settle, then scale
      setTimeout(recomputeScale, 0);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureIframePage, recomputeScale]);

  // After index changes, re-measure on next load
  const handleIframeLoad = useCallback(() => {
    measureIframePage();
    // let fonts/layout settle
    setTimeout(recomputeScale, 0);
  }, [measureIframePage, recomputeScale]);

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
  const TOP_BAR_HEIGHT = 44; // optional info bar height
  const topOffset = showInfoBar ? TOP_BAR_HEIGHT : 0;

  // Wrapper for the scaled iframe: center horizontally, scale to fit height
  const canvasWrapStyle = {
    position: "absolute",
    top: topOffset,
    left: "50%",
    transform: `translateX(-50%) scale(${scale})`,
    transformOrigin: "top center",
    width: `${pageSize.width}px`,
    height: `${pageSize.height}px`,
    willChange: "transform",
    zIndex: 0,
    pointerEvents: "auto",
    background: "transparent"
  };

  return (
    <div
      ref={viewerRef}
      style={{
        width: "100%",
        height: viewerHeight,
        position: "relative",
        background: "#fff",
        overflow: "hidden"
      }}
    >
      {/* Top info bar (optional; default hidden) */}
      {showInfoBar && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: TOP_BAR_HEIGHT,
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
      )}

      {/* Scaled iframe canvas */}
      <div style={canvasWrapStyle}>
        <iframe
          ref={iframeRef}
          key={page?.src || index}
          src={page?.src}
          title={page?.id || `Page ${index + 1}`}
          onLoad={handleIframeLoad}
          style={{
            width: `${pageSize.width}px`,
            height: `${pageSize.height}px`,
            border: "none",
            background: "#fff",
            display: "block"
          }}
        />
      </div>

      {/* Click zones for navigation (full viewer area) */}
      <button
        aria-label="Previous page"
        onClick={goPrev}
        disabled={index <= 0}
        style={{
          position: "absolute",
          left: 0,
          top: topOffset,
          width: "50%",
          height: `calc(100% - ${topOffset}px)`,
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
          top: topOffset,
          width: "50%",
          height: `calc(100% - ${topOffset}px)`,
          background: "transparent",
          border: "none",
          cursor: index < total - 1 ? "pointer" : "not-allowed",
          zIndex: 1,
        }}
      />

      {/* Arrow controls (unchanged) */}
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
