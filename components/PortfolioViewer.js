import { useEffect, useState, useCallback, useRef } from "react";

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

  // Bump this to force iframe reloads (fit toggle or explicit)
  const [reloadCounter, setReloadCounter] = useState(0);

  // Touch device detection (so we can enable panning on touch devices)
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    // Prefer matchMedia('(pointer:coarse)') as the reliable indicator for touch-first devices.
    const mq = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(pointer: coarse)") : null;
    const detect = () => {
      const match = mq ? mq.matches : (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0));
      setIsTouchDevice(Boolean(match));
    };
    detect();
    if (mq && typeof mq.addEventListener === "function") {
      mq.addEventListener("change", detect);
      return () => mq.removeEventListener("change", detect);
    } else if (mq && typeof mq.addListener === "function") {
      mq.addListener(detect);
      return () => mq.removeListener(detect);
    }
    return undefined;
  }, []);

  // iOS detection (used to apply compositor fixes)
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent || navigator.vendor || "";
    // iPadOS may report Mac in some cases; this check is conservative but effective for most iPhones/iPods/iPads
    const isiOSUA = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(Boolean(isiOSUA));
  }, []);

  // Helper: strip leading '#' from hash
  const getHashId = () => {
    if (typeof window === "undefined") return "";
    return (window.location.hash || "").replace(/^#/, "").trim();
  };

  // Helper: find the best page id in the manifest for a requested id or prefix
  const findBestManifestId = (pages, requestedId) => {
    if (!pages || pages.length === 0) return null;
    if (!requestedId) return pages[0].id || null;

    // 1) exact match
    const exact = pages.find((p) => p.id === requestedId);
    if (exact) return exact.id;

    // 2) prefix matches (e.g. requestedId = "spring2022" -> spring2022-1, spring2022-2)
    const prefixMatches = pages.filter((p) => p.id && p.id.startsWith(requestedId));
    if (prefixMatches.length === 0) {
      // No prefix matches — try contains matches
      const containsMatches = pages.filter((p) => p.id && p.id.includes(requestedId));
      if (containsMatches.length === 0) return null;
      return containsMatches[0].id;
    }

    // Prefer a variant ending with "-1"
    const variantOne = prefixMatches.find((p) => /-1$/.test(p.id));
    if (variantOne) return variantOne.id;

    // Otherwise return the first prefix match
    return prefixMatches[0].id;
  };

  // Given a page id, return the page.src value found in the manifest (or null)
  const getSrcForId = (pages, pageId) => {
    if (!pages || !pageId) return null;
    const page = pages.find((p) => p.id === pageId);
    return page ? page.src : null;
  };

  // Map manifest id -> index
  const getIndexForId = (pages, pageId) => {
    if (!pages || !pageId) return -1;
    return pages.findIndex((p) => p.id === pageId);
  };

  // Load manifest on mount and pick initial page using hash or ?page=
  useEffect(() => {
    let cancelled = false;
    async function loadManifest() {
      try {
        const res = await fetch(manifestUrl, { cache: "no-cache" });
        if (!res.ok) throw new Error(`Manifest request failed: ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        setManifest(json);

        // Determine initial page id:
        // Priority: hash (#id) -> ?page=id -> manifest first page
        const rawHash = getHashId();
        const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const pageParam = params ? params.get("page") : null;

        const preferred = rawHash || pageParam || "";
        const chosenId = findBestManifestId(json.pages || [], preferred);
        const chosenIndex = getIndexForId(json.pages || [], chosenId) >= 0 ? getIndexForId(json.pages || [], chosenId) : 0;

        setIndex(chosenIndex);
      } catch (err) {
        console.error("PortfolioViewer manifest load error", err);
        if (!cancelled) setError(err.message || String(err));
      }
    }
    loadManifest();
    return () => {
      cancelled = true;
    };
  }, [manifestUrl]);

  // Update iframe src when index changes (or manifest changes)
  useEffect(() => {
    if (!manifest || !manifest.pages || !manifest.pages[index]) return;
    const src = getSrcForId(manifest.pages || [], manifest.pages[index].id);
    if (!src) return;
    if (iframeRef.current) {
      iframeRef.current.src = src;
    }
    // After setting iframe src, measurements will occur in onLoad handler
  }, [manifest, index]);

  // Listen for hash changes so clicking sidebar links updates viewer in-place.
  useEffect(() => {
    function onHashChange() {
      if (!manifest || !manifest.pages) return;
      const rawHash = getHashId();
      const chosenId = findBestManifestId(manifest.pages || [], rawHash || "");
      const chosenIndex = getIndexForId(manifest.pages || [], chosenId);
      if (chosenIndex >= 0 && chosenIndex !== index) {
        setIndex(chosenIndex);
      }
    }
    window.addEventListener("hashchange", onHashChange, false);

    return () => {
      window.removeEventListener("hashchange", onHashChange, false);
    };
  }, [manifest, index]);

  // Whenever the viewer index changes, update the URL hash using pushState (so Back/Forward navigates pages).
  useEffect(() => {
    if (!manifest || !manifest.pages || !manifest.pages[index]) return;
    const id = manifest.pages[index].id;
    if (!id) return;
    const currentHash = (typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "");
    if (currentHash !== id) {
      try {
        const url = new URL(window.location.href);
        url.hash = `#${id}`;
        // Use pushState so Back/Forward navigates through viewer pages
        window.history.pushState({}, "", url.toString());
      } catch {
        // fallback: set location.hash (adds entry)
        window.location.hash = id;
      }
    }
  }, [index, manifest]);

  // Helper functions used by measurement logic
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

  // Disable inner scrollbars in ai2html pages (so only outer viewer scrolls)
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

  // Inject tiny iOS compositor fix into the iframe document for InDesign pages
  function injectIOSCompositorFix(doc) {
    try {
      if (!doc || !doc.head) return;
      if (doc.getElementById("ios-compositor-fix")) return;

      const styleEl = doc.createElement("style");
      styleEl.id = "ios-compositor-fix";
      styleEl.textContent = `
        /* iOS Safari compositor / repaint fixes for InDesign-export pages */
        html, body, .publication, .publication-root, .idHTMLRoot, .page, #publication, .doc {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          -webkit-transform-style: preserve-3d;
          transform-style: preserve-3d;
          will-change: transform, opacity;
          -webkit-font-smoothing: antialiased;
        }
        /* promote images/artboards too */
        img, picture, svg, .artboard, .page > div {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }
      `;
      doc.head.appendChild(styleEl);
    } catch {
      // ignore failures
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

      // ai2html-only fixes
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

  // Also recompute scale if touch-device status changes (media query flip)
  useEffect(() => {
    recomputeScale();
  }, [isTouchDevice, recomputeScale]);

  // Update URL when fitMode changes (without reload) and recompute scale
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("fit", fitMode);
        window.history.replaceState({}, "", url.toString());
      }
    } catch { /* ignore */ }
    recomputeScale();
  }, [fitMode, recomputeScale]);

  // After iframe load, measure and scale (with second pass after assets settle)
  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    try {
      const doc = iframe && (iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document));
      // If iOS + InDesign page, inject compositor fixes into iframe
      if (isIOS && doc && isInDesignPage(doc)) {
        try {
          injectIOSCompositorFix(doc);
          // Also add compositor hint/promotion to iframe element itself
          try {
            if (iframe) {
              iframe.style.transform = iframe.style.transform || "translateZ(0)";
              iframe.style.webkitTransform = iframe.style.webkitTransform || "translateZ(0)";
              iframe.style.webkitBackfaceVisibility = "hidden";
              iframe.style.backfaceVisibility = "hidden";
              iframe.style.willChange = "transform, opacity";
            }
          } catch {}
          // Slight delay to allow rendering to settle
          setTimeout(() => {
            try {
              // Force a reflow/read + ensure scrolled to left edge on touch
              if (viewerRef.current) {
                // read to force reflow
                // eslint-disable-next-line no-unused-expressions
                viewerRef.current.offsetHeight;
                viewerRef.current.scrollLeft = 0;
              }
            } catch {}
          }, 60);
        } catch {}
      }
    } catch {}
    // Existing measurement + scale passes
    measureIframePage();
    setTimeout(recomputeScale, 0);
    setTimeout(() => {
      measureIframePage();
      recomputeScale();
      // On touch devices, ensure we start scrolled to the left after layout settles
      try {
        if (isTouchDevice && viewerRef.current) {
          // small delay to ensure transforms are applied
          setTimeout(() => {
            try { viewerRef.current.scrollLeft = 0; } catch {}
          }, 30);
        }
      } catch {}
    }, 200);
  }, [measureIframePage, recomputeScale, isTouchDevice, isIOS]);

  // Navigation helpers
  const total = manifest?.pages?.length || 0;
  const headerHeight = manifest?.headerHeight ?? 60; // site header above viewer

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setIndex((i) => Math.min(total - 1, i + 1)),
    [total]
  );

  // Keyboard navigation + Fit toggle ("f") with reload
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
        // Prevent toggling fit mode via "f" on touch devices
        if (isTouchDevice) return;
        e.preventDefault();
        setFitMode((m) => (m === "height" ? "width" : "height"));
        setReloadCounter((n) => n + 1); // force iframe reload on toggle
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext, total, isTouchDevice]);

  // Ensure viewer is scrolled to left on touch devices when appropriate:
  useEffect(() => {
    if (!isTouchDevice || !viewerRef.current) return;
    // Defer to next tick so layout/transform updates settle
    const t = setTimeout(() => {
      try { viewerRef.current.scrollLeft = 0; } catch {}
    }, 30);
    return () => clearTimeout(t);
  }, [isTouchDevice, index, scale, pageSize.width, fitMode]);

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

  // Wrapper for scaled iframe:
  // - On desktop: center the canvas (left:50% + translateX(-50%)) so it visually centers
  // - On touch devices: left-align the canvas (left:0, transform origin top-left) so initial view shows left edge
  const canvasWrapStyle = isTouchDevice
    ? {
        position: "relative",
        marginTop: topOffset,
        left: 0,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: `${pageSize.width}px`,
        height: `${pageSize.height}px`,
        willChange: "transform",
        zIndex: 0,
        pointerEvents: "auto",
        background: "#fff",
        // iOS compositor hints
        ...(isIOS ? {
          WebkitTransform: "translateZ(0)",
          transform: "translateZ(0) scale(" + scale + ")",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          willChange: "transform, opacity"
        } : {})
      }
    : {
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
        background: "#fff",
        ...(isIOS ? {
          WebkitTransform: "translateZ(0) translateX(-50%) scale(" + scale + ")",
          transform: "translateZ(0) translateX(-50%) scale(" + scale + ")",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          willChange: "transform, opacity"
        } : {})
      };

  const scaledHeight = pageSize.height * scale;
  const allowVerticalScroll = fitMode === "width";

  // Spacer should only add the difference between scaled height and original layout height.
  const spacerHeight = allowVerticalScroll
    ? Math.max(0, Math.round(scaledHeight - pageSize.height))
    : 0;

  // Iframe src with cache-busting on reloadCounter
  const rawSrc = page?.src || "";
  const srcWithBuster =
    rawSrc + (rawSrc.includes("?") ? "&" : "?") + "v=" + reloadCounter;

  // Viewer container styles: on touch devices, allow horizontal panning
  const viewerContainerStyle = {
    width: "100%",
    height: viewerHeight,
    position: "relative",
    background: "#fff",
    overflowX: isTouchDevice ? "auto" : "hidden", // allow panning on touch
    overflowY: allowVerticalScroll ? "auto" : "hidden",
    // momentum scrolling + touch-action for iOS / modern browsers
    WebkitOverflowScrolling: isTouchDevice ? "touch" : undefined,
    touchAction: isTouchDevice ? "pan-x pan-y" : undefined
  };

  // Click zones for navigation can intercept touch panning. On touch devices,
  // use touch-action: manipulation so taps still work but dragging/panning is preserved.
  const sideButtonBase = {
    position: "absolute",
    top: topOffset,
    width: "50%",
    height: `calc(100% - ${topOffset}px)`,
    background: "transparent",
    border: "none",
    zIndex: 1,
    // keep click/tap behavior but avoid intercepting pan gestures
    touchAction: isTouchDevice ? "manipulation" : undefined,
    WebkitTapHighlightColor: "transparent"
  };

  return (
    <div
      ref={viewerRef}
      style={viewerContainerStyle}
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
          key={`${srcWithBuster}|${pageSize.width}x${pageSize.height}`} // ensure remounts on reloads
          src={srcWithBuster}
          title={page?.id || `Page ${index + 1}`}
          onLoad={handleIframeLoad}
          style={{
            width: `${pageSize.width}px`,
            height: `${pageSize.height}px`,
            border: "none",
            background: "#fff",
            display: "block",
            ...(isIOS ? {
              WebkitTransform: "translateZ(0)",
              transform: "translateZ(0)",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
              willChange: "transform, opacity"
            } : {})
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
          ...sideButtonBase,
          left: "-20%",
          cursor: index > 0 ? "pointer" : "not-allowed"
        }}
      />
      <button
        aria-label="Next page"
        onClick={goNext}
        disabled={index >= total - 1}
        style={{
          ...sideButtonBase,
          right: 0,
          left: "70%",
          cursor: index < total - 1 ? "pointer" : "not-allowed"
        }}
      />

      {/* Controls: Fit toggle + arrows — FIXED to viewport top-right (25% smaller) */}
      <div
        style={{
          position: "fixed",
          right: 16,
          top: `calc(${headerHeight}px + 12px + env(safe-area-inset-top, 0))`,
          display: "flex",
          gap: 6,                 // reduced spacing
          zIndex: 2000,           // Above iframe/click zones
          pointerEvents: "auto",  // Ensure clickable
        }}
      >
        {/* Fit mode toggle — hidden on touch devices */}
        {!isTouchDevice && (
          <button
            onClick={() => {
              setFitMode((m) => (m === "height" ? "width" : "height"));
              setReloadCounter((n) => n + 1); // reload iframe for crispness
            }}
            style={arrowBtnStyle}
            aria-label="Toggle fit mode"
            title="Toggle fit mode (F)"
          >
            {fitMode === "height" ? "Fullscreen Mode" : "Fit Height"}
          </button>
        )}

        {/* Arrow controls */}
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
  borderRadius: 4,         // reduced from 6
  padding: "6px 8px",      // reduced ~25%
  cursor: "pointer",
  fontFamily: "coolvetica, sans-serif",
  fontSize: 11,            // reduced from 14 (~25% smaller)
};
