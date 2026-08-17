import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function parsePx(value) {
  const n = parseFloat(String(value || "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function measureDocument(doc) {
  if (!doc?.body) return { width: 1224, height: 792 };

  const artboard = doc.querySelector(".g-artboard");
  if (artboard instanceof HTMLElement) {
    const styleAttr = artboard.getAttribute("style") || "";
    const maxWidthMatch = styleAttr.match(/max-width:\s*([0-9.]+)px/i);
    const maxHeightMatch = styleAttr.match(/max-height:\s*([0-9.]+)px/i);
    const width = maxWidthMatch ? parseFloat(maxWidthMatch[1]) : (artboard.offsetWidth || 0);
    const height = maxHeightMatch ? parseFloat(maxHeightMatch[1]) : (artboard.offsetHeight || 0);

    if (width > 0 && height > 0) {
      return { width, height };
    }
  }

  const bodyStyle = doc.body.getAttribute("style") || "";
  const widthMatch = bodyStyle.match(/width:\s*([0-9.]+)px/i);
  const heightMatch = bodyStyle.match(/height:\s*([0-9.]+)px/i);

  let width = widthMatch ? parseFloat(widthMatch[1]) : (doc.body.offsetWidth || 1224);
  let height = heightMatch ? parseFloat(heightMatch[1]) : (doc.body.offsetHeight || 792);

  if (!widthMatch || !heightMatch) {
    const first = doc.body.firstElementChild;
    if (first instanceof HTMLElement) {
      const firstWidth = parsePx(first.style.width) || first.offsetWidth;
      const firstHeight = parsePx(first.style.height) || first.offsetHeight;
      if (!widthMatch && firstWidth > 0) width = firstWidth;
      if (!heightMatch && firstHeight > 0) height = firstHeight;
    }
  }

  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
}

function hideInnerScrollbars(doc) {
  try {
    if (!doc?.head) return;
    const style = doc.createElement("style");
    style.textContent = `
      html, body {
        overflow: hidden !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    `;
    doc.head.appendChild(style);
  } catch {
    // Same-origin portfolio pages should allow this. Ignore if not.
  }
}

export default function MobilePortfolioViewer({
  manifestUrl = "/portfolio/undergraduate/manifest.json",
}) {
  const viewerRef = useRef(null);
  const iframeRef = useRef(null);

  const [manifest, setManifest] = useState(null);
  const [index, setIndex] = useState(0);
  const [pageSize, setPageSize] = useState({ width: 1224, height: 792 });
  const [viewport, setViewport] = useState({ width: 390, height: 700 });
  const [isLandscape, setIsLandscape] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadManifest() {
      try {
        const response = await fetch(manifestUrl, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
        const json = await response.json();
        if (cancelled) return;

        setManifest(json);

        const requested = (window.location.hash || "").replace(/^#/, "");
        if (requested) {
          const exact = (json.pages || []).findIndex((page) => page.id === requested);
          if (exact >= 0) setIndex(exact);
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || String(err));
      }
    }

    loadManifest();
    return () => {
      cancelled = true;
    };
  }, [manifestUrl]);

  useEffect(() => {
    function updateViewport() {
      const visual = window.visualViewport;
      const width = Math.max(1, Math.round(visual?.width || window.innerWidth));
      const height = Math.max(1, Math.round(visual?.height || window.innerHeight));
      setViewport({ width, height });
      setIsLandscape(width > height);
    }

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);
    window.visualViewport?.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
      window.visualViewport?.removeEventListener("resize", updateViewport);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("portfolio-mobile-landscape", isLandscape);
    return () => document.body.classList.remove("portfolio-mobile-landscape");
  }, [isLandscape]);

  const total = manifest?.pages?.length || 0;
  const page = manifest?.pages?.[index] || null;
  const isCover = page?.id === "cover" || page?.id === "backcover";

  useEffect(() => {
    if (!page?.id) return;
    const current = (window.location.hash || "").replace(/^#/, "");
    if (current !== page.id) {
      const url = new URL(window.location.href);
      url.hash = page.id;
      window.history.replaceState({}, "", url.toString());
    }
  }, [page?.id]);

  const viewerHeight = isLandscape ? viewport.height : Math.max(1, viewport.height - 60);

  const scale = useMemo(() => {
    const naturalWidth = pageSize.width || 1224;
    const naturalHeight = pageSize.height || 792;
    const availableWidth = Math.max(1, viewport.width);
    const availableHeight = Math.max(1, viewerHeight);

    if (isLandscape) {
      return Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight);
    }

    if (isCover) {
      // Cover/back cover are true 8.5x11 pages. In portrait, fill the viewer
      // as much as possible while keeping the entire page visible.
      return Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight);
    }

    // A normal 11x17 spread is two 8.5x11 pages side by side.
    // Portrait shows one page-width at a time and pans horizontally to page two.
    return availableWidth / (naturalWidth / 2);
  }, [pageSize.width, pageSize.height, viewport.width, viewerHeight, isLandscape, isCover]);

  const scaledWidth = Math.max(1, pageSize.width * scale);
  const scaledHeight = Math.max(1, pageSize.height * scale);

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      hideInnerScrollbars(doc);

      // Covers are exported at a 612 x 792 artboard but use a 2x raster image.
      // Force the actual artboard size here so mobile never interprets the retina
      // image as a 1224 x 1584 page and shrinks it to half size.
      if (isCover) {
        setPageSize({ width: 612, height: 792 });
      } else {
        setPageSize(measureDocument(doc));
      }
    } catch {
      if (isCover) setPageSize({ width: 612, height: 792 });
    }

    if (viewerRef.current) {
      viewerRef.current.scrollLeft = 0;
      viewerRef.current.scrollTop = 0;
    }
  }, [isCover]);

  const goTo = useCallback((nextIndex) => {
    setIndex(Math.max(0, Math.min(total - 1, nextIndex)));
    requestAnimationFrame(() => {
      if (viewerRef.current) {
        viewerRef.current.scrollLeft = 0;
        viewerRef.current.scrollTop = 0;
      }
    });
  }, [total]);

  if (error) {
    return <div style={{ padding: 20 }}>Portfolio viewer error: {error}</div>;
  }

  if (!manifest || !page) {
    return <div style={{ padding: 20 }}>Loading portfolio…</div>;
  }

  const controlsTop = isLandscape
    ? "calc(10px + env(safe-area-inset-top, 0px))"
    : "calc(70px + env(safe-area-inset-top, 0px))";

  const buttonStyle = (disabled = false) => ({
    width: 36,
    height: 34,
    padding: 0,
    border: "1px solid #777",
    borderRadius: 5,
    background: disabled ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.82)",
    color: "#555",
    opacity: disabled ? 0.35 : 1,
    fontSize: 14,
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    WebkitBackdropFilter: "blur(8px)",
    backdropFilter: "blur(8px)",
  });

  return (
    <div
      ref={viewerRef}
      className="mobile-portfolio-viewer"
      style={{
        position: isLandscape ? "fixed" : "relative",
        inset: isLandscape ? 0 : undefined,
        width: "100vw",
        height: isLandscape ? "100dvh" : viewerHeight,
        overflowX: isLandscape || isCover ? "hidden" : "auto",
        overflowY: "hidden",
        background: "#fff",
        WebkitOverflowScrolling: "touch",
        touchAction: isLandscape || isCover ? "pan-y" : "pan-x",
        scrollSnapType: !isLandscape && !isCover ? "x proximity" : "none",
        zIndex: isLandscape ? 5000 : 1,
      }}
    >
      <style jsx global>{`
        body.portfolio-mobile-landscape .nav-card-top {
          display: none !important;
        }

        body.portfolio-mobile-landscape main {
          padding-top: 0 !important;
        }

        body.portfolio-mobile-landscape {
          overflow: hidden !important;
        }

        .mobile-portfolio-viewer::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .mobile-portfolio-viewer {
          scrollbar-width: none;
        }
      `}</style>

      <div
        style={{
          position: "relative",
          width: scaledWidth,
          height: scaledHeight,
          marginLeft: isLandscape || isCover ? Math.max(0, (viewport.width - scaledWidth) / 2) : 0,
          marginTop: isLandscape || isCover ? Math.max(0, (viewerHeight - scaledHeight) / 2) : 0,
          scrollSnapAlign: "start",
        }}
      >
        <div
          style={{
            width: pageSize.width,
            height: pageSize.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            background: "#fff",
          }}
        >
          <iframe
            ref={iframeRef}
            src={page.src}
            title={page.id || `Page ${index + 1}`}
            onLoad={handleIframeLoad}
            style={{
              display: "block",
              width: pageSize.width,
              height: pageSize.height,
              border: 0,
              background: "#fff",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          top: controlsTop,
          right: "calc(10px + env(safe-area-inset-right, 0px))",
          display: "flex",
          gap: 5,
          alignItems: "center",
          zIndex: 5200,
        }}
      >
        <button type="button" onClick={() => goTo(0)} disabled={index === 0} style={buttonStyle(index === 0)} aria-label="First page">⏮</button>
        <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} style={buttonStyle(index === 0)} aria-label="Previous page">←</button>
        <button type="button" onClick={() => goTo(index + 1)} disabled={index >= total - 1} style={buttonStyle(index >= total - 1)} aria-label="Next page">→</button>
        <button type="button" onClick={() => goTo(total - 1)} disabled={index >= total - 1} style={buttonStyle(index >= total - 1)} aria-label="Last page">⏭</button>
      </div>
    </div>
  );
}
