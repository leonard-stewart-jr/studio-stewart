import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function parsePx(value) {
  const n = parseFloat(String(value || "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function touchDistance(a, b) {
  const dx = b.clientX - a.clientX;
  const dy = b.clientY - a.clientY;
  return Math.hypot(dx, dy);
}

function touchMidpoint(a, b) {
  return {
    x: (a.clientX + b.clientX) / 2,
    y: (a.clientY + b.clientY) / 2,
  };
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
  const pinchRef = useRef(null);
  const gestureRef = useRef(null);
  const zoomRef = useRef(1);

  const [manifest, setManifest] = useState(null);
  const [index, setIndex] = useState(0);
  const [pageSize, setPageSize] = useState({ width: 1224, height: 792 });
  const [viewport, setViewport] = useState({ width: 390, height: 700 });
  const [isLandscape, setIsLandscape] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

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

  const baseScale = useMemo(() => {
    const naturalWidth = pageSize.width || 1224;
    const naturalHeight = pageSize.height || 792;
    const availableWidth = Math.max(1, viewport.width);
    const availableHeight = Math.max(1, viewerHeight);

    if (isLandscape) {
      return Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight);
    }

    if (isCover) {
      return Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight);
    }

    return availableWidth / (naturalWidth / 2);
  }, [pageSize.width, pageSize.height, viewport.width, viewerHeight, isLandscape, isCover]);

  const displayScale = baseScale * zoom;
  const scaledWidth = Math.max(1, pageSize.width * displayScale);
  const scaledHeight = Math.max(1, pageSize.height * displayScale);
  const zoomed = zoom > 1.001;

  useEffect(() => {
    setZoom(1);
    zoomRef.current = 1;
    pinchRef.current = null;
    gestureRef.current = null;
    requestAnimationFrame(() => {
      if (viewerRef.current) {
        viewerRef.current.scrollLeft = 0;
        viewerRef.current.scrollTop = 0;
      }
    });
  }, [index, isLandscape]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return undefined;

    // iPhone Safari exposes GestureEvent for pinch. Handling it directly lets
    // us stop browser-page zoom while scaling only the portfolio artwork.
    function onGestureStart(event) {
      if (event.cancelable) event.preventDefault();

      const rect = viewer.getBoundingClientRect();
      const localX = (event.clientX || viewport.width / 2) - rect.left;
      const localY = (event.clientY || viewerHeight / 2) - rect.top;
      const currentZoom = zoomRef.current;

      gestureRef.current = {
        zoom: currentZoom,
        localX,
        localY,
        contentX: (viewer.scrollLeft + localX) / currentZoom,
        contentY: (viewer.scrollTop + localY) / currentZoom,
      };
    }

    function onGestureChange(event) {
      if (!gestureRef.current) return;
      if (event.cancelable) event.preventDefault();

      const start = gestureRef.current;
      const nextZoom = clamp(start.zoom * (event.scale || 1), 1, 4);
      zoomRef.current = nextZoom;
      setZoom(nextZoom);

      requestAnimationFrame(() => {
        viewer.scrollLeft = Math.max(0, start.contentX * nextZoom - start.localX);
        viewer.scrollTop = Math.max(0, start.contentY * nextZoom - start.localY);
      });
    }

    function onGestureEnd(event) {
      if (event.cancelable) event.preventDefault();
      gestureRef.current = null;
    }

    // Touch-event fallback for browsers that do not expose GestureEvent.
    function onTouchStart(event) {
      if ("ongesturestart" in window || event.touches.length !== 2) return;

      event.preventDefault();
      const distance = touchDistance(event.touches[0], event.touches[1]);
      const midpoint = touchMidpoint(event.touches[0], event.touches[1]);
      const rect = viewer.getBoundingClientRect();
      const localX = midpoint.x - rect.left;
      const localY = midpoint.y - rect.top;
      const currentZoom = zoomRef.current;

      pinchRef.current = {
        distance,
        zoom: currentZoom,
        contentX: (viewer.scrollLeft + localX) / currentZoom,
        contentY: (viewer.scrollTop + localY) / currentZoom,
        localX,
        localY,
      };
    }

    function onTouchMove(event) {
      if ("ongesturestart" in window || event.touches.length !== 2 || !pinchRef.current) return;

      event.preventDefault();
      const start = pinchRef.current;
      const distance = touchDistance(event.touches[0], event.touches[1]);
      if (!start.distance || !distance) return;

      const nextZoom = clamp(start.zoom * (distance / start.distance), 1, 4);
      zoomRef.current = nextZoom;
      setZoom(nextZoom);

      requestAnimationFrame(() => {
        viewer.scrollLeft = Math.max(0, start.contentX * nextZoom - start.localX);
        viewer.scrollTop = Math.max(0, start.contentY * nextZoom - start.localY);
      });
    }

    function onTouchEnd(event) {
      if (event.touches.length < 2) pinchRef.current = null;
    }

    viewer.addEventListener("gesturestart", onGestureStart, { passive: false });
    viewer.addEventListener("gesturechange", onGestureChange, { passive: false });
    viewer.addEventListener("gestureend", onGestureEnd, { passive: false });
    viewer.addEventListener("touchstart", onTouchStart, { passive: false });
    viewer.addEventListener("touchmove", onTouchMove, { passive: false });
    viewer.addEventListener("touchend", onTouchEnd, { passive: false });
    viewer.addEventListener("touchcancel", onTouchEnd, { passive: false });

    return () => {
      viewer.removeEventListener("gesturestart", onGestureStart);
      viewer.removeEventListener("gesturechange", onGestureChange);
      viewer.removeEventListener("gestureend", onGestureEnd);
      viewer.removeEventListener("touchstart", onTouchStart);
      viewer.removeEventListener("touchmove", onTouchMove);
      viewer.removeEventListener("touchend", onTouchEnd);
      viewer.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [viewport.width, viewerHeight]);

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      hideInnerScrollbars(doc);

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

  const centerContent = !zoomed && (isLandscape || isCover);

  return (
    <div
      ref={viewerRef}
      className="mobile-portfolio-viewer"
      style={{
        position: isLandscape ? "fixed" : "relative",
        inset: isLandscape ? 0 : undefined,
        width: "100vw",
        height: isLandscape ? "100dvh" : viewerHeight,
        overflowX: isLandscape && !zoomed ? "hidden" : "auto",
        overflowY: zoomed ? "auto" : "hidden",
        background: "#fff",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x pan-y",
        scrollSnapType: !zoomed && !isLandscape && !isCover ? "x proximity" : "none",
        zIndex: isLandscape ? 5000 : 1,
        overscrollBehavior: "contain",
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
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>

      <div
        style={{
          position: "relative",
          width: scaledWidth,
          height: scaledHeight,
          marginLeft: centerContent ? Math.max(0, (viewport.width - scaledWidth) / 2) : 0,
          marginTop: centerContent ? Math.max(0, (viewerHeight - scaledHeight) / 2) : 0,
          scrollSnapAlign: "start",
        }}
      >
        <div
          style={{
            width: pageSize.width,
            height: pageSize.height,
            transform: `scale(${displayScale})`,
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
