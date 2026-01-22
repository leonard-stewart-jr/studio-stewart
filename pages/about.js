import React, { useRef, useEffect, useCallback } from "react";
import HeaderBar from "../components/HeaderBar";

/**
 * About page loads the InDesign static export from /static/about-page/index.html
 * - iframe is set to width:100% so it stretches to the user's viewport
 * - onLoad we inject /static/about-page/responsive-overrides.css into the iframe doc (same-origin)
 * - onLoad we also set the iframe height to match the content height
 * - window resize triggers a debounced recalculation of iframe height
 *
 * Note: this approach leaves your generated InDesign CSS untouched and applies a small override
 * stylesheet loaded after the generated CSS so changes are easy to revert and re-export-safe.
 */

export default function AboutPage() {
  const iframeRef = useRef(null);

  // Attempt to compute and set the iframe height to its content height
  const setIframeHeightFromContent = useCallback(() => {
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
      if (!doc) return;

      // Use the documentElement scrollHeight for reliable height
      const docEl = doc.documentElement || doc.body;
      const height = Math.max(
        docEl.scrollHeight || 0,
        docEl.offsetHeight || 0,
        docEl.clientHeight || 0
      );

      // Add a small buffer (2 px) to avoid accidental clipping
      iframe.style.height = `${Math.ceil(height + 2)}px`;
    } catch (err) {
      // cross-origin or other error — graceful fail
      // console.warn("setIframeHeightFromContent failed", err);
    }
  }, []);

  // Inject our override stylesheet into the iframe document (if not already present)
  const injectOverrideStylesheet = useCallback(() => {
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const w = iframe.contentWindow;
      const doc = iframe.contentDocument || (w && w.document);
      if (!doc || !doc.head) return;

      // Only inject once
      if (!doc.getElementById("responsive-overrides")) {
        const link = doc.createElement("link");
        link.rel = "stylesheet";
        link.href = "/static/about-page/responsive-overrides.css";
        link.id = "responsive-overrides";
        // Append last so it overrides generated styles
        doc.head.appendChild(link);
      }
    } catch (err) {
      // console.warn("injectOverrideStylesheet failed", err);
    }
  }, []);

  // iframe onLoad handler: inject CSS and size it
  const handleIframeLoad = useCallback(() => {
    injectOverrideStylesheet();
    // Small delay to let fonts/images settle, then set height
    setTimeout(() => {
      setIframeHeightFromContent();
    }, 80);

    // Also observe changes inside iframe to adjust height if content changes
    try {
      const iframe = iframeRef.current;
      const doc = iframe && (iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document));
      if (!doc) return;

      // If MutationObserver is supported, watch for DOM or size changes and update height
      if (!iframe.__aboutObserver && typeof MutationObserver !== "undefined") {
        const observer = new MutationObserver(() => {
          // throttle updates
          clearTimeout(iframe.__aboutResizeTimer);
          iframe.__aboutResizeTimer = setTimeout(() => {
            setIframeHeightFromContent();
          }, 120);
        });
        observer.observe(doc.body || doc.documentElement, { attributes: true, childList: true, subtree: true, characterData: true });
        iframe.__aboutObserver = observer;
      }
    } catch (err) {
      // fail quietly
    }
  }, [injectOverrideStylesheet, setIframeHeightFromContent]);

  // Resize listener (debounced) — recalc iframe height on window resize
  useEffect(() => {
    const onResize = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      clearTimeout(iframe.__resizeDebounce);
      iframe.__resizeDebounce = setTimeout(() => {
        setIframeHeightFromContent();
      }, 160);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      const iframe = iframeRef.current;
      // disconnect mutation observer if present
      if (iframe && iframe.__aboutObserver && iframe.__aboutObserver.disconnect) {
        try { iframe.__aboutObserver.disconnect(); } catch (e) {}
        iframe.__aboutObserver = null;
      }
      clearTimeout(iframe && iframe.__resizeDebounce);
      clearTimeout(iframe && iframe.__aboutResizeTimer);
    };
  }, [setIframeHeightFromContent]);

  return (
    <>
      {/* Keep the normal header/navigation */}
      <HeaderBar />

      {/* Full-bleed wrapper so the iframe is centered while nav remains full-bleed */}
      <main style={{ paddingTop: 0 }}>
        <div
          className="nav-card nav-card-top"
          style={{
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
            boxSizing: "border-box",
            background: "transparent",
          }}
        >
          {/* inner wrapper preserved by nav-card rules — empty intentionally */}
          <div style={{ width: "min(1600px, 95vw)", margin: "0 auto" }} />
        </div>

        {/* Iframe container: center content and allow it to expand to full available width */}
        <div
          style={{
            width: "100vw",
            boxSizing: "border-box",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
            background: "transparent",
            paddingTop: 24, // small top spacing below nav
            paddingBottom: 48,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "100%", // iframe itself will be 100% of wrapper; content inside constrained by override max-width:1900px
              boxSizing: "border-box",
            }}
          >
            <iframe
              ref={iframeRef}
              title="About — Studio Stewart"
              src="/static/about-page/index.html"
              onLoad={handleIframeLoad}
              // allow fullscreen if any media content requires it
              allow="fullscreen"
              style={{
                display: "block",
                width: "100%",   // fluid width to always match user's viewport/container
                height: "1200px", // initial fallback height; will be adjusted onLoad
                border: "0",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}
