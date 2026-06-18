import { useEffect, useState, useCallback, useRef } from "react";

function colorToRgba(color, alpha = 0.12) {
  if (!color) return `rgba(108, 108, 106, ${alpha})`;

  const value = String(color).trim();

  if (value.startsWith("#")) {
    let hex = value.replace("#", "");

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    if (hex.length === 6) {
      const bigint = parseInt(hex, 16);

      if (Number.isFinite(bigint)) {
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }
  }

  if (value.startsWith("rgb(")) {
    return value.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  }

  if (value.startsWith("rgba(")) {
    return value;
  }

  return `rgba(108, 108, 106, ${alpha})`;
}

function formatSemesterFromId(id) {
  if (!id) return "";

  const match = String(id).match(/^(spring|summer|fall|winter)(20\d{2})/i);
  if (!match) return "";

  return `${match[1].toUpperCase()} ${match[2]}`;
}

function getProjectBaseId(id) {
  if (!id) return "";

  return String(id).replace(/-\d+$/, "");
}

function getSpreadLabelForPage(pages, page, index) {
  if (!page) return "";
  if (page.spreadLabel) return page.spreadLabel;

  const id = page.id || "";
  const semester = page.semester || page.term || page.date || formatSemesterFromId(id);

  if (!semester) return "";

  const baseId = getProjectBaseId(id);

  const projectPages = (pages || []).filter((p) => {
    const pId = p.id || "";
    const pSemester = p.semester || p.term || p.date || formatSemesterFromId(pId);

    return pSemester && getProjectBaseId(pId) === baseId;
  });

  if (projectPages.length > 1) {
    const suffixMatch = String(id).match(/-(\d+)$/);
    const spreadNumber = suffixMatch
      ? Number(suffixMatch[1])
      : projectPages.findIndex((p) => p.id === id) + 1;

    return `SPREAD ${spreadNumber} OF ${projectPages.length}`;
  }

  return "SINGLE PAGE";
}

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
  const [pageSize, setPageSize] = useState({ width: 1224, height: 792 });
  const [scale, setScale] = useState(1);
  const [fitMode, setFitMode] = useState("width");

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenHover, setFullscreenHover] = useState(false);

  // Bump this to force iframe reloads
  const [reloadCounter, setReloadCounter] = useState(0);

  // Touch device detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
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

  // iOS detection
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent || navigator.vendor || "";
    const isiOSUA = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    setIsIOS(Boolean(isiOSUA));
  }, []);

  const getHashId = () => {
    if (typeof window === "undefined") return "";
    return (window.location.hash || "").replace(/^#/, "").trim();
  };

  const findBestManifestId = (pages, requestedId) => {
    if (!pages || pages.length === 0) return null;
    if (!requestedId) return pages[0].id || null;

    const exact = pages.find((p) => p.id === requestedId);
    if (exact) return exact.id;

    const prefixMatches = pages.filter((p) => p.id && p.id.startsWith(requestedId));
    if (prefixMatches.length === 0) {
      const containsMatches = pages.filter((p) => p.id && p.id.includes(requestedId));
      if (containsMatches.length === 0) return null;
      return containsMatches[0].id;
    }

    const variantOne = prefixMatches.find((p) => /-1$/.test(p.id));
    if (variantOne) return variantOne.id;

    return prefixMatches[0].id;
  };

  const getSrcForId = (pages, pageId) => {
    if (!pages || !pageId) return null;
    const page = pages.find((p) => p.id === pageId);
    return page ? page.src : null;
  };

  const getIndexForId = (pages, pageId) => {
    if (!pages || !pageId) return -1;
    return pages.findIndex((p) => p.id === pageId);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadManifest() {
      try {
        const res = await fetch(manifestUrl, { cache: "no-cache" });
        if (!res.ok) throw new Error(`Manifest request failed: ${res.status}`);

        const json = await res.json();
        if (cancelled) return;

        setManifest(json);

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

  useEffect(() => {
    if (!manifest || !manifest.pages || !manifest.pages[index]) return;

    const src = getSrcForId(manifest.pages || [], manifest.pages[index].id);
    if (!src) return;

    if (iframeRef.current) {
      iframeRef.current.src = src;
    }
  }, [manifest, index]);

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

  useEffect(() => {
    if (!manifest || !manifest.pages || !manifest.pages[index]) return;

    const id = manifest.pages[index].id;
    if (!id) return;

    const currentHash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";

    if (currentHash !== id) {
      try {
        const url = new URL(window.location.href);
        url.hash = `#${id}`;
        window.history.pushState({}, "", url.toString());
      } catch {
        window.location.hash = id;
      }
    }
  }, [index, manifest]);

  function isInDesignPage(doc) {
    const body = doc?.body;
    const id = body?.id || "";
    return /^publication-/i.test(id);
  }

  function parsePx(value) {
    const n = parseFloat(String(value || "").replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }

  function removeScrollHints(doc) {
    try {
      const styleEl = doc.createElement("style");
      styleEl.textContent = `
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
          (leftPx !== null && leftPx >= doc.body.offsetWidth - 10);

        if ((pos === "fixed" || pos === "absolute") && tiny && pinnedRight) {
          el.style.display = "none";
          el.style.visibility = "hidden";
        }
      });
    } catch {
      // ignore
    }
  }

  function disableInnerScrollbars(doc) {
    try {
      const styleEl = doc.createElement("style");
      styleEl.textContent = `
        html, body, .ai2html, .g-artboard {
          overflow: hidden !important;
          overscroll-behavior: contain !important;
        }

        html, body {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }

        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
          display: none !important;
          background: transparent !important;
        }
      `;
      doc.head && doc.head.appendChild(styleEl);

      doc.documentElement.style.overflow = "hidden";
      doc.body.style.overflow = "hidden";
    } catch {
      // ignore
    }
  }

  function injectIOSCompositorFix(doc) {
    try {
      if (!doc || !doc.head) return;
      if (doc.getElementById("ios-compositor-fix")) return;

      const styleEl = doc.createElement("style");
      styleEl.id = "ios-compositor-fix";
      styleEl.textContent = `
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

        img, picture, svg, .artboard, .page > div {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }
      `;
      doc.head.appendChild(styleEl);
    } catch {
      // ignore
    }
  }

  const measureIframePage = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc =
        iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);

      if (!doc || !doc.body) return;

      if (isInDesignPage(doc)) {
        let w = doc.body.offsetWidth || 612;
        let h = doc.body.offsetHeight || 792;

        const inlineStyle = doc.body.getAttribute("style") || "";
        const wMatch = inlineStyle.match(/width:\s*([0-9.]+)px/i);
        const hMatch = inlineStyle.match(/height:\s*([0-9.]+)px/i);

        if (wMatch) w = parseFloat(wMatch[1]) || w;
        if (hMatch) h = parseFloat(hMatch[1]) || h;

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
        removeScrollHints(doc);
        return;
      }

      let w = 1224;
      let h = 792;

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

      removeScrollHints(doc);
      disableInnerScrollbars(doc);
    } catch {
      // keep defaults
    }
  }, []);

  const getEffectiveFitMode = useCallback(() => {
    const pageId = manifest?.pages?.[index]?.id || "";
    const isCoverPage = pageId === "cover" || pageId === "backcover";

    return isCoverPage ? "height" : fitMode;
  }, [manifest, index, fitMode]);

  const recomputeScale = useCallback(() => {
    if (!viewerRef.current) return;

    const viewerEl = viewerRef.current;
    const availableHeight = viewerEl.clientHeight;
    const availableWidth = viewerEl.clientWidth;

    const naturalHeight = pageSize.height || 792;
    const naturalWidth = pageSize.width || 1224;

    const effectiveFitMode = getEffectiveFitMode();

    let s = 1;

    if (effectiveFitMode === "width") {
      s = availableWidth > 0 ? availableWidth / naturalWidth : 1;
    } else {
      s = availableHeight > 0 ? availableHeight / naturalHeight : 1;
    }

    setScale(s);
  }, [pageSize.height, pageSize.width, getEffectiveFitMode]);

  useEffect(() => {
    function handleFullscreenChange() {
      const fullscreenElement =
        document.fullscreenElement || document.webkitFullscreenElement;

      setIsFullscreen(fullscreenElement === viewerRef.current);

      setTimeout(recomputeScale, 60);
      setTimeout(recomputeScale, 250);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [recomputeScale]);

  useEffect(() => {
    function onResize() {
      measureIframePage();
      setTimeout(recomputeScale, 0);
    }

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [measureIframePage, recomputeScale]);

  useEffect(() => {
    recomputeScale();
  }, [isTouchDevice, recomputeScale]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("fit", fitMode);
        window.history.replaceState({}, "", url.toString());
      }
    } catch {
      // ignore
    }

    recomputeScale();
  }, [fitMode, recomputeScale]);

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;

    try {
      const doc = iframe && (iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document));

      if (isIOS && doc && isInDesignPage(doc)) {
        try {
          injectIOSCompositorFix(doc);

          try {
            if (iframe) {
              iframe.style.transform = iframe.style.transform || "translateZ(0)";
              iframe.style.webkitTransform = iframe.style.webkitTransform || "translateZ(0)";
              iframe.style.webkitBackfaceVisibility = "hidden";
              iframe.style.backfaceVisibility = "hidden";
              iframe.style.willChange = "transform, opacity";
            }
          } catch {
            // ignore
          }

          setTimeout(() => {
            try {
              if (viewerRef.current) {
                viewerRef.current.offsetHeight;
                viewerRef.current.scrollLeft = 0;
              }
            } catch {
              // ignore
            }
          }, 60);
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }

    measureIframePage();
    setTimeout(recomputeScale, 0);

    setTimeout(() => {
      measureIframePage();
      recomputeScale();

      try {
        if (isTouchDevice && viewerRef.current) {
          setTimeout(() => {
            try {
              viewerRef.current.scrollLeft = 0;
            } catch {
              // ignore
            }
          }, 30);
        }
      } catch {
        // ignore
      }
    }, 200);
  }, [measureIframePage, recomputeScale, isTouchDevice, isIOS]);

  const total = manifest?.pages?.length || 0;
  const headerHeight = manifest?.headerHeight ?? 60;

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setIndex((i) => Math.min(total - 1, i + 1)),
    [total]
  );

  const toggleFullscreen = useCallback(async () => {
    const el = viewerRef.current;
    if (!el) return;

    try {
      const fullscreenElement =
        document.fullscreenElement || document.webkitFullscreenElement;

      if (!fullscreenElement) {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen failed:", err);
    }
  }, []);

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
        if (isTouchDevice) return;

        e.preventDefault();
        setFitMode((m) => (m === "height" ? "width" : "height"));
        setReloadCounter((n) => n + 1);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext, total, isTouchDevice]);

  useEffect(() => {
    if (!isTouchDevice || !viewerRef.current) return;

    const t = setTimeout(() => {
      try {
        viewerRef.current.scrollLeft = 0;
      } catch {
        // ignore
      }
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

  const viewerHeight = isFullscreen
    ? "100vh"
    : `calc(100vh - ${headerHeight}px)`;

  const TOP_BAR_HEIGHT = 44;
  const topOffset = showInfoBar ? TOP_BAR_HEIGHT : 0;

  const semesterLabel = page?.semester || page?.term || page?.date || formatSemesterFromId(page?.id);
  const spreadLabel = getSpreadLabelForPage(manifest?.pages || [], page, index);

  const pageThemeColor =
    page?.themeColor ||
    page?.theme ||
    page?.accentColor ||
    page?.color ||
    "#6c6c6a";

  const showProjectTag = Boolean(semesterLabel);

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
        ...(isIOS
          ? {
              WebkitTransform: "translateZ(0)",
              transform: "translateZ(0) scale(" + scale + ")",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
              willChange: "transform, opacity"
            }
          : {})
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
        ...(isIOS
          ? {
              WebkitTransform: "translateZ(0) translateX(-50%) scale(" + scale + ")",
              transform: "translateZ(0) translateX(-50%) scale(" + scale + ")",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
              willChange: "transform, opacity"
            }
          : {})
      };

  const scaledHeight = pageSize.height * scale;
  const allowVerticalScroll = getEffectiveFitMode() === "width";

  const spacerHeight = allowVerticalScroll
    ? Math.max(0, Math.round(scaledHeight - pageSize.height))
    : 0;

  const rawSrc = page?.src || "";
  const srcWithBuster =
    rawSrc + (rawSrc.includes("?") ? "&" : "?") + "v=" + reloadCounter;

  const viewerContainerStyle = {
    width: "100%",
    height: viewerHeight,
    position: "relative",
    background: "#fff",
    overflowX: isTouchDevice ? "auto" : "hidden",
    overflowY: allowVerticalScroll ? "auto" : "hidden",
    WebkitOverflowScrolling: isTouchDevice ? "touch" : undefined,
    touchAction: isTouchDevice ? "pan-x pan-y" : undefined
  };

  const sideButtonBase = {
    position: "absolute",
    top: topOffset,
    width: "50%",
    height: `calc(100% - ${topOffset}px)`,
    background: "transparent",
    border: "none",
    zIndex: 1,
    touchAction: isTouchDevice ? "manipulation" : undefined,
    WebkitTapHighlightColor: "transparent"
  };

  const projectTagStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    minHeight: 32,
    padding: "0 12px",
    borderRadius: 5,
    border: `1px solid ${pageThemeColor}`,
    background: colorToRgba(pageThemeColor, 0.2),
    color: pageThemeColor,
    fontFamily: "coolvetica, sans-serif",
    fontSize: 12,
    letterSpacing: ".06em",
    textTransform: "uppercase",
    lineHeight: 1,
    userSelect: "none",
    whiteSpace: "nowrap",
    boxSizing: "border-box"
  };

  const projectTagDividerStyle = {
    width: 1,
    height: 14,
    background: pageThemeColor,
    opacity: 0.55,
    flex: "0 0 auto"
  };

  const controlBtnStyle = (disabled = false) => ({
    background: disabled
      ? colorToRgba(pageThemeColor, 0.08)
      : colorToRgba(pageThemeColor, 0.2),
    color: pageThemeColor,
    border: `1px solid ${pageThemeColor}`,
    borderRadius: 5,
    padding: "7px 10px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "coolvetica, sans-serif",
    fontSize: 12,
    lineHeight: 1,
    minHeight: 32,
    opacity: disabled ? 0.4 : 1,
    transition: "background 0.18s ease, opacity 0.18s ease, border-color 0.18s ease",
    boxSizing: "border-box"
  });

  const fullscreenBtnStyle = {
    position: "fixed",
    top: isFullscreen
      ? "18px"
      : `calc(${headerHeight}px + 16px + env(safe-area-inset-top, 0))`,
    left: "50%",
    transform: "translateX(-50%)",
    width: 62,
    height: 62,
    borderRadius: "50%",
    border: `1px solid ${colorToRgba(pageThemeColor, fullscreenHover ? 0.65 : 0.28)}`,
    background: colorToRgba(pageThemeColor, fullscreenHover ? 0.18 : 0.07),
    color: pageThemeColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "coolvetica, sans-serif",
    fontSize: 24,
    lineHeight: 1,
    cursor: "pointer",
    zIndex: 2100,
    opacity: fullscreenHover ? 0.9 : 0.28,
    transition:
      "opacity 0.18s ease, background 0.18s ease, border-color 0.18s ease, transform 0.18s ease",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)"
  };

  return (
    <div
      ref={viewerRef}
      className="portfolio-viewer-shell"
      style={{
        ...viewerContainerStyle,
        "--portfolio-theme-color": pageThemeColor,
        "--portfolio-scrollbar-track": colorToRgba(pageThemeColor, 0.08),
        "--portfolio-scrollbar-thumb": colorToRgba(pageThemeColor, 0.55),
        "--portfolio-scrollbar-thumb-hover": colorToRgba(pageThemeColor, 0.75)
      }}
    >
      <style jsx global>{`
        .portfolio-viewer-shell {
          scrollbar-width: auto;
          scrollbar-color: var(--portfolio-scrollbar-thumb) var(--portfolio-scrollbar-track);
        }

        .portfolio-viewer-shell::-webkit-scrollbar {
          width: 18px;
          height: 18px;
        }

        .portfolio-viewer-shell::-webkit-scrollbar-track {
          background: var(--portfolio-scrollbar-track);
        }

        .portfolio-viewer-shell::-webkit-scrollbar-thumb {
          background: var(--portfolio-scrollbar-thumb);
          border-radius: 999px;
          border: 3px solid var(--portfolio-scrollbar-track);
        }

        .portfolio-viewer-shell::-webkit-scrollbar-thumb:hover {
          background: var(--portfolio-scrollbar-thumb-hover);
        }

        .portfolio-viewer-shell:fullscreen {
          width: 100vw !important;
          height: 100vh !important;
          background: #fff;
        }

        .portfolio-viewer-shell:-webkit-full-screen {
          width: 100vw !important;
          height: 100vh !important;
          background: #fff;
        }
      `}</style>

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
            zIndex: 2
          }}
        >
          <div
            style={{
              fontFamily: "coolvetica, sans-serif",
              fontSize: 14,
              color: "#6c6c6a",
              textTransform: "uppercase",
              letterSpacing: ".04em"
            }}
          >
            {manifest.title || "Undergraduate Portfolio"}
          </div>

          <div
            style={{
              fontFamily: "coolvetica, sans-serif",
              fontSize: 12,
              color: "#6c6c6a",
              letterSpacing: ".02em"
            }}
          >
            {page?.id || `Page ${index + 1}`} • {index + 1}/{total}
          </div>
        </div>
      )}

      <div style={canvasWrapStyle}>
        <iframe
          ref={iframeRef}
          key={`${srcWithBuster}|${pageSize.width}x${pageSize.height}`}
          src={srcWithBuster}
          title={page?.id || `Page ${index + 1}`}
          onLoad={handleIframeLoad}
          style={{
            width: `${pageSize.width}px`,
            height: `${pageSize.height}px`,
            border: "none",
            background: "#fff",
            display: "block",
            ...(isIOS
              ? {
                  WebkitTransform: "translateZ(0)",
                  transform: "translateZ(0)",
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                  willChange: "transform, opacity"
                }
              : {})
          }}
        />
      </div>

      {allowVerticalScroll && spacerHeight > 0 && (
        <div aria-hidden="true" style={{ height: `${spacerHeight}px` }} />
      )}

      <button
        aria-label="Previous page"
        onClick={goPrev}
        disabled={index <= 0}
        style={{
          ...sideButtonBase,
          left: "0%",
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
          left: "50%",
          cursor: index < total - 1 ? "pointer" : "not-allowed"
        }}
      />

      <button
        type="button"
        onClick={toggleFullscreen}
        onMouseEnter={() => setFullscreenHover(true)}
        onMouseLeave={() => setFullscreenHover(false)}
        style={fullscreenBtnStyle}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? "×" : "⛶"}
      </button>

      <div
        style={{
          position: "fixed",
          right: 36,
          top: isFullscreen
            ? "14px"
            : `calc(${headerHeight}px + 12px + env(safe-area-inset-top, 0))`,
          display: "flex",
          alignItems: "center",
          gap: 6,
          zIndex: 2000,
          pointerEvents: "auto"
        }}
      >
        {showProjectTag && (
          <div
            style={projectTagStyle}
            aria-label={`${semesterLabel}${spreadLabel ? `, ${spreadLabel}` : ""}`}
            title={`${semesterLabel}${spreadLabel ? `, ${spreadLabel}` : ""}`}
          >
            <span>{semesterLabel}</span>

            {spreadLabel && (
              <>
                <span style={projectTagDividerStyle} />
                <span>{spreadLabel}</span>
              </>
            )}
          </div>
        )}

        {!isTouchDevice && (
          <button
            onClick={() => {
              setFitMode((m) => (m === "height" ? "width" : "height"));
              setReloadCounter((n) => n + 1);
            }}
            style={controlBtnStyle(false)}
            aria-label="Toggle fit mode"
            title="Toggle fit mode (F)"
          >
            {getEffectiveFitMode() === "height" ? "Fit: Height" : "Fit: Width"}
          </button>
        )}

        <button
          onClick={() => setIndex(0)}
          disabled={index === 0}
          style={controlBtnStyle(index === 0)}
          aria-label="First page"
          title="First"
        >
          ⏮
        </button>

        <button
          onClick={goPrev}
          disabled={index === 0}
          style={controlBtnStyle(index === 0)}
          aria-label="Previous page"
          title="Previous"
        >
          ←
        </button>

        <button
          onClick={goNext}
          disabled={index >= total - 1}
          style={controlBtnStyle(index >= total - 1)}
          aria-label="Next page"
          title="Next"
        >
          →
        </button>

        <button
          onClick={() => setIndex(total - 1)}
          disabled={index >= total - 1}
          style={controlBtnStyle(index >= total - 1)}
          aria-label="Last page"
          title="Last"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}
