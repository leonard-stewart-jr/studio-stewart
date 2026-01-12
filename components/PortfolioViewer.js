import { useEffect, useState, useCallback, useRef } from "react";

/**
 * PortfolioViewer (type-aware fit-to-height/width + scroll-hint removal)
 * - Detects page type inside the iframe (InDesign vs ai2html spread)
 * - Measures natural page width/height
 * - Scales to fit viewer HEIGHT (default) or WIDTH (toggle)
 * - No cropping; scales text, images, and blocks uniformly
 * - Removes ai2html internal scrollbars/hints so only the outer viewer scrolls
 * - Navigation: left/right, keyboard arrows, click zones
 * - Optional deep-linking via ?page=<id> and ?fit=height|width
 *
 * Props:
 * - manifestUrl: string (default "/portfolio/undergraduate/manifest.json")
 * - showInfoBar: boolean (default false) — top info bar remains hidden unless enabled
 */
export default function PortfolioViewer({
  manifestUrl = "/portfolio/undergraduate/manifest.json",
  showInfoBar = false
}) {
  const [manifest, setManifest] = useState(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState(null);

  // Page measurement + scaling
  const iframeRef = useRef(null);
  const viewerRef = useRef(null);
  const [pageSize, setPageSize] = useState({ width: 1224, height: 792 }); // default single-spread size
  const [scale, setScale] = useState(1);
  const [fitMode, setFitMode] = useState("height"); // "height" or "width"

  // Load manifest and initialize page/fit from URL
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

        const params =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : null;

        // Page deep-link
        const startId = params ? params.get("page") : null;
        if (startId) {
          const startIndex = data.pages.findIndex((p) => p.id === startId);
          setIndex(startIndex >= 0 ? startIndex : 0);
        } else {
          setIndex(0);
        }

        // Fit deep-link (?fit=width|height)
        const fitParam = params ? params.get("fit") : null;
        if (fitParam === "width" || fitParam === "height") {
          setFitMode(fitParam);
        } else {
          setFitMode("height");
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

  // Keyboard navigation + Fit toggle ("f")
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
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFitMode((m) => (m === "height" ? "width" : "height"));
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

  // Remove right-side scroll hint arrow from ai2html pages (safe selectors + heuristic)
  function removeScrollHints(doc) {
    try {
      const styleEl = doc.createElement("style");
      styleEl.textContent = `
        /* Common scroll hint classes */
        .g-aiScrollArrow,
        .scroll-arrow,
        .scrollHint,
        .scroll-hint,
        [data-role="scroll-hint"],
        [data-scroll="hint"],
        .ai2html-arrow {
          display: none !important;
          visibility: hidden !important;
        }
      `;
      doc.head && doc.head.appendChild(styleEl);

      const candidates = doc.querySelectorAll(
        ".g-aiScrollArrow, .scroll-arrow, .scrollHint, .scroll-hint, [data-role='scroll-hint'], [data-scroll='hint'], .ai2html-arrow"
      );
      candidates.forEach((el) => el.remove());

      // Heuristic: hide tiny fixed/absolute elements pinned near the right edge (possible arrow)
      const allNodes = doc.querySelectorAll("div,span,svg,img,button");
      allNodes.forEach((el) => {
        const win = doc.defaultView || window;
        const cs = win.getComputedStyle ? win.getComputedStyle(el) : null;
        if (!cs) return;
        const pos = cs.position;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const rightPx = parsePx(cs.right);
        const leftPx = parsePx(cs.left);

        const tiny = w <= 40 && h <= 140;
        const pinnedRight =
          (rightPx !== null && rightPx <= 10) ||
          (leftPx !== null && leftPx >= (doc.body.offsetWidth - 10));
        if ((pos === "fixed" || pos === "absolute") && tiny && pinnedRight) {
          el.style.display = "none";
          el.style.visibility = "hidden";
        }
      });
    } catch {
      // ignore failures silently
    }
  }

  // NEW: Disable inner scrollbars in ai2html pages (so only outer viewer scrolls)
  function disableInnerScrollbars(doc) {
    try {
      const styleEl = doc.createElement("style");
      styleEl.textContent = `
        html, body, .ai2html, .g-artboard {
          overflow: hidden !important;
          overscroll-behavior: contain !important;
        }
        /* Hide scrollbars across browsers */
        html, body {
          scrollbar-width: none !important;        /* Firefox */
          -ms-overflow-style: none !important;     /* IE/Edge legacy */
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
          display: none !important;
          background: transparent !important;
        }
      `;
      doc.head && doc.head.appendChild(styleEl);

      // Defensive: inline hide in case author styles override
      doc.documentElement.style.overflow = "hidden";
      doc.body.style.overflow = "hidden";
    } catch {
      // ignore silently
    }
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
        // No inner scrollbars expected on these, but safe to remove hints
        removeScrollHints(doc);
        return;
      }

      // ai2html spread pages (single spread per HTML)
      // Prefer the first ai2html image's natural size; fallback to artboard max-*
      let w = 1224; // typical spread width
      let h = 792;  // typical height

      const img = doc.querySelector(".ai2html .g-aiImg, img.g-aiImg");
      if (img && img instanceof HTMLImageElement) {
        const nw = img.naturalWidth || img.width;
        const nh = img.naturalHeight || img.height;
        if (nw && nh) {
          w = nw;
          h = nh;
        }
      } else {
        const artboard = doc.querySelector(".ai2html .g-artboard");
        if (artboard) {
          const styleAttr = artboard.getAttribute("style") || "";
          const mwMatch = styleAttr.match(/max-width:\s*([0-9.]+)px/i);
          const mhMatch = styleAttr.match(/max-height:\s*([0-9.]+)px/i);
          const mw = mwMatch ? parseFloat(mwMatch[1]) : 0;
          const mh = mhMatch ? parseFloat(mhMatch[1]) : 0;
          if (mw > 0) w = mw;
          if (mh > 0) h = mh;
        }
      }

      if (!w || w <= 0) w = 1224;
      if (!h || h <= 0) h = 792;

      setPageSize({ width: Math.max(1, w), height: Math.max(1, h) });
      // Ensure inner scrollbars and hints are removed for ai2html pages
      removeScrollHints(doc);
      disableInnerScrollbars(doc);
    } catch {
      // keep defaults silently
    }
  }, []);

  // Compute scale to fit viewer HEIGHT or WIDTH (no cropping)
  const recomputeScale = useCallback(() => {
    if (!viewerRef.current) return;
    const viewerEl = viewerRef.current;
    const availableHeight = viewerEl.clientHeight; // excludes site header via container style
    const availableWidth = viewerEl.clientWidth;
    const naturalHeight = pageSize.height || 792;
    const naturalWidth = pageSize.width || 1224;

    let s = 1;
    if (fitMode === "width") {
      s = availableWidth > 0 ? availableWidth / naturalWidth : 1;
    } else {
      s = availableHeight > 0 ? availableHeight / naturalHeight : 1;
    }
    setScale(s);
  }, [pageSize.height, pageSize.width, fitMode]);

  // Recompute when window resizes, page changes, or fit mode toggles
  useEffect(() => {
    function onResize() {
      measureIframePage();
      setTimeout(recomputeScale, 0);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureIframePage, recomputeScale]);

  // Update URL when fitMode changes (without reload)
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("fit", fitMode);
        window.history.replaceState({}, "", url.toString());
      }
    } catch { /* ignore */ }
    // Also recompute scale on mode change
    recomputeScale();
  }, [fitMode, recomputeScale]);

  // After iframe load, measure and scale (with second pass after assets settle)
  const handleIframeLoad = useCallback(() => {
    measureIframePage();
    setTimeout(recomputeScale, 0);
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

  // Wrapper for scaled iframe: center horizontally, scale to fit
  const canvasWrapStyle = {
    position: "relative",
    marginTop: topOffset,
    left: "50%",
    transform: `translateX(-50%) scale(${scale})`,
    transformOrigin: "top center",
    width: `${pageSize.width}px`,
    height: `${pageSize.height}px`,
    willChange: "transform",
    zIndex: 0,
    pointerEvents: "auto",
    background: "#fff"
  };

  const scaledHeight = pageSize.height * scale;
  const allowVerticalScroll = fitMode === "width";

  // Spacer should only add the difference between scaled height and original layout height.
  const spacerHeight = allowVerticalScroll
    ? Math.max(0, Math.round(scaledHeight - pageSize.height))
    : 0;

  return (
    <div
      ref={viewerRef}
      style={{
        width: "100%",
        height: viewerHeight,
        position: "relative",
        background: "#fff",
        overflowX: "hidden",
        overflowY: allowVerticalScroll ? "auto" : "hidden"
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

      {/* Spacer to enable vertical scroll in Fit Width mode (transform doesn't change layout height) */}
      {allowVerticalScroll && spacerHeight > 0 && (
        <div aria-hidden="true" style={{ height: `${spacerHeight}px` }} />
      )}

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

      {/* Controls: Fit toggle + arrows — FIXED to viewport bottom-right */}
      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: "calc(16px + env(safe-area-inset-bottom, 0))",
          display: "flex",
          gap: 8,
          zIndex: 2000,           // Above iframe/click zones
          pointerEvents: "auto",  // Ensure clickable
        }}
      >
        {/* Fit mode toggle */}
        <button
          onClick={() => setFitMode((m) => (m === "height" ? "width" : "height"))}
          style={arrowBtnStyle}
          aria-label="Toggle fit mode"
          title="Toggle fit mode (F)"
        >
          {fitMode === "height" ? "Fit: Height" : "Fit: Width"}
        </button>

        {/* Arrow controls (unchanged) */}
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
