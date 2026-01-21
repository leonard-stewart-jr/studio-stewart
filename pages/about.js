import React, { useEffect, useRef, useState } from 'react';
import HeaderBar from '../components/HeaderBar';

/**
 * About page: embeds exported InDesign HTML at /static/about-page/index.html
 * - fixed content width: 1600px (scales down on small screens via maxWidth)
 * - auto-height: measures same-origin iframe content and sets iframe height
 * - injects CSS into iframe document on load to remove internal scrollbars
 * - keeps site header/navigation (HeaderBar) and reserves top padding to avoid overlap
 *
 * Usage: drop this file into pages/about.js (replace existing).
 */

export default function AboutPage() {
  const iframeRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState('900px'); // sensible initial height

  const STATIC_PATH = '/static/about-page/index.html';
  const HEADER_HEIGHT = 60; // match HeaderBar headerHeight (HeaderBar uses 60)
  const CONTENT_WIDTH = 1600; // fixed content width for the exported HTML

  // Safely read same-origin iframe content height
  function getIframeContentHeight(iframeEl) {
    try {
      const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
      if (!doc) return null;
      const body = doc.body;
      const html = doc.documentElement;

      // Use maximum of common height measures
      const h = Math.max(
        body ? body.scrollHeight : 0,
        body ? body.offsetHeight : 0,
        html ? html.scrollHeight : 0,
        html ? html.offsetHeight : 0
      );
      return h;
    } catch (err) {
      // cross-origin or other read error
      return null;
    }
  }

  // Inject CSS into the exported document to neutralize internal scrolling and forced 100vh behavior
  function injectNormalizationCSS(iframeEl) {
    try {
      const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
      if (!doc) return;

      // Create a style element to override problematic export rules.
      // These rules use !important to override inline or exported CSS that forces internal scrollbars.
      const css = `
        html, body {
          overflow: visible !important;
          height: auto !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        /* If the InDesign export put the whole layout inside a wrapper with fixed height/overflow,
           try to neutralize common wrapper selectors. */
        #page, .page, .export-container, .adobe-export, .aep-export {
          overflow: visible !important;
          height: auto !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        /* Prevent nested elements from forcing internal scrollbars */
        * {
          overflow: visible !important;
          box-sizing: border-box !important;
        }
      `;

      // Avoid adding duplicate style elements
      const existing = doc.getElementById('studio-stewart-iframe-normalize');
      if (existing) {
        existing.textContent = css;
        return;
      }

      const styleEl = doc.createElement('style');
      styleEl.id = 'studio-stewart-iframe-normalize';
      styleEl.type = 'text/css';
      styleEl.appendChild(doc.createTextNode(css));
      // Insert at top of head (or at documentElement if head not present)
      if (doc.head) {
        doc.head.insertBefore(styleEl, doc.head.firstChild);
      } else {
        doc.documentElement.insertBefore(styleEl, doc.documentElement.firstChild);
      }
    } catch (e) {
      // ignore cross-origin / permission errors
      // (shouldn't happen because export is under /static and same-origin)
    }
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let rafId = null;
    let resizeTimer = null;

    // Measure and apply iframe height based on inner content
    function resizeToContent() {
      if (!iframe) return;
      const contentHeight = getIframeContentHeight(iframe);
      if (contentHeight) {
        // add a small buffer to avoid clipping
        const newHeight = Math.max(400, contentHeight + 8);
        setIframeHeight((prev) => {
          const prevVal = typeof prev === 'string' ? parseInt(prev, 10) : prev;
          if (Math.abs(prevVal - newHeight) < 6) return prev; // skip tiny adjustments
          return `${newHeight}px`;
        });
      }
    }

    // Normalize styles inside iframe (remove internal scrollbars, fixed 100vh usage)
    function normalizeAndResize() {
      try {
        injectNormalizationCSS(iframe);
        resizeToContent();
      } catch (e) {
        // ignore
      }
    }

    // Called when iframe finishes loading
    function onLoad() {
      // Inject normalization CSS immediately, then measure
      normalizeAndResize();

      // Attach a MutationObserver inside iframe to detect DOM changes that affect height
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
              normalizeAndResize();
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
        // cross-origin or other error; ignore
      }

      // Short polling fallback to capture late-loading fonts/images and other late layout shifts
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      let polls = 0;
      pollIntervalRef.current = setInterval(() => {
        polls += 1;
        normalizeAndResize();
        if (polls > 40) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }, 200);
    }

    // Attach load handler
    iframe.addEventListener('load', onLoad);

    // If iframe already loaded from cache, run onLoad immediately
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

    // Window resize handler (debounced)
    function onWindowResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        normalizeAndResize();
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

  // Styles for layout: full-bleed wrapper + centered 1600px container
  const fullBleedWrapper = {
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    marginRight: 'calc(50% - 50vw)',
    boxSizing: 'border-box',
    background: 'transparent',
  };

  const centeredContainer = {
    width: CONTENT_WIDTH, // numeric -> px
    maxWidth: '100%', // scale down on small viewports
    margin: '0 auto',
    boxSizing: 'border-box',
  };

  const iframeStyle = {
    width: '100%', // fill centeredContainer (so on desktop it will be 1600px)
    height: iframeHeight,
    border: 'none',
    display: 'block',
    overflow: 'visible', // allow parent to scroll
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
          // Reserve space so the fixed header doesn't overlap the top of the content.
          paddingTop: HEADER_HEIGHT,
        }}
      >
        {/* Visible fallback link for users with iframes disabled or assistive tech */}
        <div style={fallbackContainer}>
          If the frame does not load, open the About page in a new tab:{' '}
          <a href={STATIC_PATH} target="_blank" rel="noopener noreferrer">
            Open standalone export
          </a>
        </div>

        {/* Full-bleed container so the white nav bars can extend full width */}
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
                scrolling="no" // we want parent page scrollbar only
                role="document"
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
