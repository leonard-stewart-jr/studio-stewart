import React, { useEffect, useRef, useState } from 'react';
import HeaderBar from '../components/HeaderBar';

export default function AboutPage() {
  const iframeRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState('900px'); // sensible initial height

  const STATIC_PATH = '/static/about-page/index.html';
  const HEADER_HEIGHT = 76; // leave enough top padding so fixed header doesn't overlap content
  const CONTENT_WIDTH = 1600; // fixed content width for the exported HTML

  // Safely read same-origin iframe content height
  function getIframeContentHeight(iframeEl) {
    try {
      const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
      if (!doc) return null;
      const body = doc.body;
      const html = doc.documentElement;

      // try to account for exported CSS that may set min-height/100vh etc.
      const scrollHeight = Math.max(
        body ? body.scrollHeight : 0,
        body ? body.offsetHeight : 0,
        html ? html.scrollHeight : 0,
        html ? html.offsetHeight : 0
      );
      return scrollHeight;
    } catch (err) {
      // cross-origin or other read error
      return null;
    }
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let rafId = null;
    let resizeTimer = null;

    // Resize the iframe to match its content height (if same-origin)
    function resizeToContent() {
      if (!iframe) return;
      const contentHeight = getIframeContentHeight(iframe);
      if (contentHeight) {
        const newHeight = Math.max(400, contentHeight + 8); // small buffer
        setIframeHeight((prev) => {
          const prevVal = typeof prev === 'string' ? parseInt(prev, 10) : prev;
          if (Math.abs(prevVal - newHeight) < 6) return prev; // skip tiny adjustments
          return `${newHeight}px`;
        });
      }
    }

    // Attempt to remove internal scrolling inside the exported HTML (overrides same-origin styles)
    function normalizeIframeDocumentStyles() {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (!doc) return;

        // Clear restrictive layout that may cause internal scrolling
        const html = doc.documentElement;
        const body = doc.body;

        // Remove any inline height/overflow that the export may have set
        if (html) {
          html.style.overflow = 'visible';
          html.style.height = 'auto';
          html.style.minHeight = '0';
          html.style.margin = '0';
        }
        if (body) {
          body.style.overflow = 'visible';
          body.style.height = 'auto';
          body.style.minHeight = '0';
          body.style.margin = '0';
        }

        // If exported CSS included <meta name="viewport"> missing or content scaling,
        // we don't alter it here. We just ensure no internal scrollbar is forced by CSS.
      } catch (e) {
        // ignore cross-origin / permission errors
      }
    }

    // Handler called when iframe finishes loading (or is cached)
    function onLoad() {
      // Force the exported document to use visible overflow so the parent can size correctly
      normalizeIframeDocumentStyles();

      // Do an initial resize
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(resizeToContent);

      // Attach a MutationObserver inside the iframe to detect dynamic changes
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (doc) {
          if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
            resizeObserverRef.current = null;
          }
          resizeObserverRef.current = new MutationObserver(() => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
              normalizeIframeDocumentStyles();
              resizeToContent();
            });
          });
          resizeObserverRef.current.observe(doc, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true,
          });
        }
      } catch (e) {
        // cross-origin or other errors — observer not attached
      }

      // Short polling fallback to catch late-loading fonts/images (stop after a few seconds)
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      let polls = 0;
      pollIntervalRef.current = setInterval(() => {
        polls += 1;
        normalizeIframeDocumentStyles();
        resizeToContent();
        if (polls > 40) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }, 200);
    }

    // Attach load handler
    iframe.addEventListener('load', onLoad);

    // If the iframe has already loaded (cached), call onLoad immediately
    try {
      if (
        iframe.contentDocument &&
        (iframe.contentDocument.readyState === 'complete' ||
          iframe.contentDocument.readyState === 'interactive')
      ) {
        onLoad();
      }
    } catch (e) {
      // ignore
    }

    // Recompute on parent window resize (debounced)
    function onWindowResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // re-run normalization in case layout rules inside export adapt to width changes
        normalizeIframeDocumentStyles();
        resizeToContent();
      }, 140);
    }
    window.addEventListener('resize', onWindowResize);

    return () => {
      iframe.removeEventListener('load', onLoad);
      window.removeEventListener('resize', onWindowResize);
      if (resizeObserverRef.current) {
        try {
          resizeObserverRef.current.disconnect();
        } catch (e) {}
        resizeObserverRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (resizeTimer) clearTimeout(resizeTimer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Full-bleed wrapper forces a block to span the viewport while inner content remains centered
  const fullBleedWrapper = {
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    marginRight: 'calc(50% - 50vw)',
    boxSizing: 'border-box',
    background: 'transparent',
  };

  // Inner centered container that constrains the exported content to 1600px (but allows max-width on small screens)
  const centeredContainer = {
    width: CONTENT_WIDTH,
    maxWidth: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
    // no side padding — the exported HTML already includes its bleed
  };

  // Iframe styling: fixed content width (100% of centeredContainer), and auto height from iframeHeight
  const iframeStyle = {
    width: '100%',
    height: iframeHeight,
    border: 'none',
    display: 'block',
    overflow: 'visible',
    WebkitOverflowScrolling: 'touch',
    background: '#ffffff',
    boxSizing: 'content-box',
  };

  const fallbackContainer = {
    width: 'min(1600px,95vw)',
    margin: '22px auto 8px',
    padding: '0 24px',
    boxSizing: 'border-box',
    fontSize: 13,
    color: '#6c6c6a',
    textAlign: 'center',
  };

  const captionStyle = {
    width: 'min(1600px,95vw)',
    margin: '10px auto 42px',
    color: '#6c6c6a',
    fontSize: 13,
    textAlign: 'center',
  };

  return (
    <>
      {/* Keep the normal header/navigation */}
      <HeaderBar fixedNav={true} />

      <main
        style={{
          width: '100vw',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
          background: '#fff',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          // Match matter-matters: leave space so fixed nav doesn't overlay content
          paddingTop: HEADER_HEIGHT,
        }}
      >
        {/* Fallback visible link for users with iframes disabled or for assistive tech */}
        <div style={fallbackContainer}>
          If the frame does not load, open the About page in a new tab:{' '}
          <a href={STATIC_PATH} target="_blank" rel="noopener noreferrer">
            Open standalone export
          </a>
        </div>

        {/* Full-bleed container (so the white nav/top bars can extend full width) */}
        <div
          style={{
            width: '100vw',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            background: '#fff',
            margin: 0,
            padding: 0,
            boxShadow: 'none',
          }}
        >
          <div style={{ ...fullBleedWrapper }}>
            <div style={centeredContainer}>
              <iframe
                ref={iframeRef}
                src={STATIC_PATH}
                title="About — exported from InDesign"
                style={iframeStyle}
                scrolling="no"
                role="document"
                // allow same-origin access for auto-resize (assets are served from same origin)
              />
            </div>
          </div>
        </div>

        {/* Caption + secondary link */}
        <div style={captionStyle}>
          <div>Selected 3D prints — logo coasters, color lithophanes, and architectural models.</div>
          <div style={{ marginTop: 8 }}>
            <a href={STATIC_PATH} style={{ color: '#6c6c6a', textDecoration: 'underline' }}>
              Open standalone export
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
