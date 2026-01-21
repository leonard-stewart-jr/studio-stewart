import React, { useEffect, useRef, useState } from 'react';

export default function AboutIframe() {
  const iframeRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState('900px'); // sensible initial height

  const STATIC_PATH = '/static/about-page/index.html';
  const FALLBACK_CAPTION = 'Selected 3D prints — logo coasters, color lithophanes, and architectural models.';

  // Safe helper to read content height from same-origin iframe
  function getIframeContentHeight(iframeEl) {
    try {
      const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
      if (!doc) return null;
      const body = doc.body;
      const html = doc.documentElement;
      // Use the larger of body or html scroll heights
      const height = Math.max(
        body ? body.scrollHeight : 0,
        body ? body.offsetHeight : 0,
        html ? html.scrollHeight : 0,
        html ? html.offsetHeight : 0
      );
      return height;
    } catch (err) {
      // If cross-origin or other error, return null
      return null;
    }
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Resize function (debounced-ish)
    let rafId = null;
    function resizeToContent() {
      if (!iframe) return;
      const contentHeight = getIframeContentHeight(iframe);
      if (contentHeight) {
        // Add a tiny buffer to avoid clipping
        const newHeight = Math.max(400, contentHeight + 8);
        // Avoid setting state if unchanged to limit re-renders
        setIframeHeight((prev) => {
          const prevVal = typeof prev === 'string' ? parseInt(prev, 10) : prev;
          if (Math.abs(prevVal - newHeight) < 6) return prev; // small delta, skip
          return `${newHeight}px`;
        });
      }
    }

    // On iframe load, attempt an initial resize and attach MutationObserver
    function onLoad() {
      // initial resize
      resizeToContent();

      // If same-origin, try MutationObserver to catch dynamic content changes
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (doc) {
          // Clear any existing observer
          if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
            resizeObserverRef.current = null;
          }
          resizeObserverRef.current = new MutationObserver(() => {
            // Use rAF to batch DOM reads/writes
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(resizeToContent);
          });
          resizeObserverRef.current.observe(doc, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
          });
        }
      } catch (e) {
        // If cross-origin or other error, ignore MutationObserver
      }

      // Start a short-lived polling fallback for cases where MutationObserver misses something
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      let polls = 0;
      pollIntervalRef.current = setInterval(() => {
        polls += 1;
        resizeToContent();
        // stop polling after 8 seconds (32 polls at 250ms)
        if (polls > 32) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }, 250);
    }

    // Attach load handler (fires when src loads)
    iframe.addEventListener('load', onLoad);

    // Also call resize periodically on window resize (debounced)
    let resizeTimer = null;
    function onWindowResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeToContent();
      }, 120);
    }
    window.addEventListener('resize', onWindowResize);

    // Initial attempt in case iframe was already cached and loaded
    if (iframe.contentDocument && (iframe.contentDocument.readyState === 'complete' || iframe.contentDocument.readyState === 'interactive')) {
      onLoad();
    }

    return () => {
      iframe.removeEventListener('load', onLoad);
      window.removeEventListener('resize', onWindowResize);
      if (resizeObserverRef.current) {
        try { resizeObserverRef.current.disconnect(); } catch (e) {}
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

  // Full-bleed container technique: forces child element to span viewport width
  const fullBleedWrapper = {
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    marginRight: 'calc(50% - 50vw)',
    boxSizing: 'border-box',
    background: 'transparent'
  };

  const iframeStyle = {
    width: '100%',
    height: iframeHeight,
    border: 'none',
    display: 'block',
    // Prevent double scroll by allowing iframe to expand to content height
    overflow: 'visible',
    WebkitOverflowScrolling: 'touch',
    background: '#ffffff'
  };

  const captionStyle = {
    width: 'min(1600px,95vw)',
    margin: '10px auto 42px',
    color: '#6c6c6a',
    fontSize: 13,
    textAlign: 'center'
  };

  const fallbackLinkStyle = {
    width: 'min(1600px,95vw)',
    margin: '22px auto 8px',
    padding: '0 24px',
    boxSizing: 'border-box',
    fontSize: 13,
    color: '#6c6c6a'
  };

  return (
    <div>
      {/* Visible fallback/legal link for screen-readers or users with iframe blocked */}
      <div style={fallbackLinkStyle}>
        If the frame does not load, open the About page in a new tab:&nbsp;
        <a href={STATIC_PATH} target="_blank" rel="noopener noreferrer">
          Open standalone export
        </a>
      </div>

      {/* Full-bleed iframe container */}
      <div style={fullBleedWrapper} aria-hidden={false}>
        <iframe
          ref={iframeRef}
          title="About — exported from InDesign"
          src={STATIC_PATH}
          style={iframeStyle}
          scrolling="no"
          role="document"
        />
      </div>

      {/* Caption & secondary link */}
      <div style={captionStyle}>
        <div>{FALLBACK_CAPTION}</div>
        <div style={{ marginTop: 8 }}>
          <a href={STATIC_PATH} style={{ color: '#6c6c6a', textDecoration: 'underline' }}>
            Open standalone export
          </a>
        </div>
      </div>
    </div>
  );
}
