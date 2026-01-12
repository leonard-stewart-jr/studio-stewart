import { useEffect, useState, useCallback, useRef } from "react";

/**
 * PortfolioViewer (type-aware fit-to-height)
 * - Detects page type inside the iframe (InDesign vs ai2html spread)
 * - Measures natural page width/height, then scales the whole page to fit viewer height
 * - No cropping; scales text, images, and blocks uniformly
 * - Navigation: left/right, keyboard, click zones
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
  const [pageSize, setPageSize] = useState({ width: 1224, height: 792 }); // default spread size
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

  function isInDesignPage(doc) {
    const body = doc?.body;
    const id = body?.id || "";
    return /^publication-/i.test(id);
  }

  function parsePx(value) {
    const n = parseFloat(String(value || "").replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }

  // Measure page's natural size inside the iframe (type-aware)
  const measureIframePage = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc =
        iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
      if (!doc || !doc.body) return;

      // InDesign export pages (intro/backcover)
      if (isInDesignPage(doc)) {
        let w = doc.body.offsetWidth || 612;
        let h = doc.body.offsetHeight || 792;

        const inlineStyle = doc.body.getAttribute("style") || "";
        const wMatch = inlineStyle.match(/width:\s*([0-9.]+)px/i);
        const hMatch = inlineStyle.match(/height:\s*([0-9.]+)px/i);
        if (wMatch) w = parseFloat(wMatch[1]) || w;
        if (hMatch) h = parseFloat(hMatch[1]) || h;

        // Some exports wrap everything in a first absolute container with explicit size
        const firstDiv = doc.body.firstElementChild;
        if (firstDiv && firstDiv instanceof HTMLElement) {
          const w2 = parsePx(firstDiv.style.width) || firstDiv.offsetWidth || w;
          const h2 = parsePx(firstDiv.style.height) || firstDiv.offsetHeight || h;
          if (w2 && h2) {
            w = w2;
            h = h2;
          }
        }

        setPageSize({ width: Math.max(1, w), height: Math.max(1, h) });
        return;
      }

      // ai2html spread pages
      // Strategy: try artboard styles first, then image natural size
      let w = 1224; // typical spread width
      let h = 792;  // typical height

      const artboards = doc.querySelectorAll(".ai2html .g-artboard");
      if (artboards && artboards.length > 0) {
        // If multiple artboards existed, we pick the largest by max-height/width.
        let bestW = 0;
        let bestH = 0;
        artboards.forEach((el) => {
          const styleAttr = el.getAttribute("style") || "";
          const mwMatch = styleAttr.match(/max-width:\s*([0-9.]+)px/i);
          const mhMatch = styleAttr.match(/max-height:\s*([0-9.]+)px/i);
          const mw = mwMatch ? parseFloat(mwMatch[1]) : 0;
          const mh = mhMatch ? parseFloat(mhMatch[1]) : 0;
          if (mw > bestW) bestW = mw;
          if (mh > bestH) bestH = mh;
        });
        if (bestW > 0) w = bestW;
        if (bestH > 0) h = bestH;
      }

      // Fallback: use the first ai2html image's natural size
      if (!w || !h || w <= 0 || h <= 0) {
        const img = doc.querySelector(".ai2html .g-aiImg, img.g-aiImg");
        if (img && img instanceof HTMLImageElement) {
          const nw = img.naturalWidth || img.width;
          const nh = img.naturalHeight || img.height;
          if (nw && nh) {
            w = nw;
            h = nh;
          }
        }
      }

      // Last fallback defaults
      if (!w || w <= 0) w = 1224;
      if (!h || h <= 0) h = 792;

      setPageSize({ width: Math.max(1, w), height: Math.max(1, h) });
    } catch {
      // silently ignore timing issues; keep defaults
    }
  }, []);

  // Compute scale to fit viewer height (no cropping)
  const recomputeScale = useCallback(() => {
    if (!viewerRef.current) return;
    const viewerEl = viewerRef.current;
    const availableHeight = viewerEl.clientHeight; // excludes site header via container style
    const naturalHeight = pageSize.height || 792;
    const s = availableHeight > 0 ? availableHeight / naturalHeight : 1;
    setScale(s);
  }, [pageSize.height]);

  // Recompute scale when page changes, iframe loads, or window resizes
  useEffect(() => {
    function onResize() {
      // Re-measure then scale
      measureIframePage();
      setTimeout(recomputeScale, 0);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureIframePage, recomputeScale]);

  // After iframe load, measure and scale
  const handleIframeLoad = useCallback(() => {
    measureIframePage();
    // Allow images/fonts to settle, then scale
    setTimeout(recomputeScale, 0);
    // Re-check once more shortly after, in case images finalize later
    setTimeout(() => {
      measureIframePage();
      recomputeScale();
    }, 200);
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
    background: "transparent",
  };

  return (
    <div
      ref={viewerRef}
      style={{
        width: "100%",
        height: viewerHeight,
        position: "relative",
        background: "#fff",
        overflow: "hidden",
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
            display: "block",
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
