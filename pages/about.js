import React, { useEffect, useRef, useState } from 'react';
import HeaderBar from '../components/HeaderBar';

/**
 * About page - embeds exported InDesign HTML at /static/about-page/index.html
 *
 * Goals implemented:
 * - Full-bleed iframe that visually stretches left → right across the viewport.
 * - Inject small, targeted CSS into the iframe document to allow the export to scale to the iframe width
 *   and to remove internal scrolling behavior so the site (parent) has the single scrollbar.
 * - Auto-height: measure same-origin iframe content and size the iframe to its content height.
 * - Robustness: guards against runaway growth by using thresholds, caps, stability counts, and a short polling window.
 * - Remove the visible top fallback bar (per request). Keep a small caption and a single "Open standalone export" link beneath the iframe.
 *
 * Drop this file into pages/about.js (replace existing).
 */

export default function AboutPage() {
  const iframeRef = useRef(null);
  const observerRef = useRef(null);
  const pollRef = useRef(null);
  const stableCountRef = useRef(0);
  const lastHeightRef = useRef(0);

  // Sensible initial height while the iframe loads
  const [iframeHeight, setIframeHeight] = useState('900px');

  const STATIC_PATH = '/static/about-page/index.html';
  const HEADER_HEIGHT = 60; // matches HeaderBar headerHeight
  const MAX_IFRAME_HEIGHT = 12000; // safety cap
  const HEIGHT_THRESHOLD_PX = 6; // only apply if change > this
  const STABILITY_REQUIRED = 4; // number of consecutive stable reads before stopping observers
  const POLL_INTERVAL_MS = 200; // poll every 200ms
  const POLL_LIMIT = 50; // stop polling after ~10s

  // read same-origin iframe document height safely
  function readIframeContentHeight(iframeEl) {
    try {
      const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
      if (!doc) return null;
      const body = doc.body;
      const html = doc.documentElement;
      const h = Math.max(
        body ? body.scrollHeight : 0,
        body ? body.offsetHeight : 0,
        html ? html.scrollHeight : 0,
        html ? html.offsetHeight : 0
      );
      return Number.isFinite(h) ? h : null;
    } catch (e) {
      return null;
    }
  }

  // inject conservative normalization CSS into the exported document
  function injectIframeNormalizationStyles(iframeEl) {
    try {
      const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
      if (!doc) return;

      const css = `
        /* Make export responsive to container width and avoid forced internal scrolling */
        html, body, #page, .page, .export-container, .adobe-export, .aep-export {
          width: 100% !important;
          max-width: none !important;
          box-sizing: border-box !important;
          overflow: visible !important;
          height: auto !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        /* Ensure images and fixed-width elements scale down when needed */
        img, svg, figure {
          max-width: 100% !important;
          height: auto !important;
        }
        /* Defensive: if the export used fixed px containers named .page or #page, force them to behave */
        .page, #page {
          display: block !important;
        }
      `;

      // avoid duplicates
      const existing = doc.getElementById('about-iframe-normalize');
      if (existing) {
        existing.textContent = css;
        return;
      }
      const style = doc.createElement('style');
      style.id = 'about-iframe-normalize';
      style.type = 'text/css';
      style.appendChild(doc.createTextNode(css));
      if (doc.head) doc.head.insertBefore(style, doc.head.firstChild);
      else doc.documentElement.insertBefore(style, doc.documentElement.firstChild);
    } catch (e) {
      // ignore cross-origin or other unexpected failures
    }
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let rafId = null;
    let resizeTimer = null;
    let pollCount = 0;

    function applyHeightIfNeeded(measured) {
      if (!measured || typeof measured !== 'number') return;
      // cap measured height
      let measuredHeight = Math.min(measured, MAX_IFRAME_HEIGHT);

      const prev = lastHeightRef.current || parseInt(iframeHeight, 10) || 0;

      // ignore unrealistic spikes
      if (prev > 0 && measuredHeight > prev * 1.8) {
        // skip this reading as likely transient
        return;
      }

      // only update if change exceeds threshold
      if (Math.abs(prev - measuredHeight) < HEIGHT_THRESHOLD_PX) {
        stableCountRef.current += 1;
      } else {
        stableCountRef.current = 0;
      }

      if (stableCountRef.current >= STABILITY_REQUIRED) {
        // stable, we can stop observers/polling soon (cleanup handled elsewhere)
      }

      if (Math.abs(prev - measuredHeight) >= HEIGHT_THRESHOLD_PX) {
        lastHeightRef.current = measuredHeight;
        setIframeHeight(`${measuredHeight}px`);
      }
    }

    function resizeFromIframe() {
      if (!iframe) return;
      const measured = readIframeContentHeight(iframe);
      if (measured) applyHeightIfNeeded(measured);
    }

    function normalizeAndResize() {
      try {
        injectIframeNormalizationStyles(iframe);
      } catch (e) {}
      resizeFromIframe();
    }

    function onLoad() {
      // inject CSS + measure initially
      normalizeAndResize();

      // attach mutation observer to respond to DOM changes inside iframe (same-origin)
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (doc) {
          if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
          observerRef.current = new MutationObserver(() => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
              normalizeAndResize();
            });
          });
          observerRef.current.observe(doc, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true,
          });
        }
      } catch (e) {
        // ignore if observer can't be attached
      }

      // short polling fallback for late-loading fonts/images
      if (pollRef.current) clearInterval(pollRef.current);
      pollCount = 0;
      pollRef.current = setInterval(() => {
        pollCount += 1;
        normalizeAndResize();
        if (stableCountRef.current >= STABILITY_REQUIRED || pollCount > POLL_LIMIT) {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      }, POLL_INTERVAL_MS);
    }

    iframe.addEventListener('load', onLoad);

    // If iframe already loaded from cache, trigger onLoad now
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
      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
        } catch (e) {}
        observerRef.current = null;
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // layout styles: full-bleed wrapper so iframe spans left→right
  const fullBleedWrapper = {
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    marginRight: 'calc(50% - 50vw)',
    boxSizing: 'border-box',
    background: 'transparent',
    display: 'block'
  };

  const iframeStyle = {
    width: '100%', // fills full-bleed wrapper (so stretches viewport)
    height: iframeHeight,
    border: 'none',
    display: 'block',
    overflow: 'visible',
    WebkitOverflowScrolling: 'touch',
    background: 'transparent',
    boxSizing: 'border-box'
  };

  const captionStyle = {
    width: 'min(1600px,95vw)',
    margin: '10px auto 42px',
    color: '#6c6c6a',
    fontSize: 13,
    textAlign: 'center'
  };

  return (
    <>
      {/* Keep header/navigation (fixed) */}
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
          // Reserve header height so fixed nav does not overlap content
          paddingTop: HEADER_HEIGHT
        }}
      >
        {/* Full-bleed iframe container (spans viewport) */}
        <div
          style={{
            width: '100vw',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            background: '#fff',
            margin: 0,
            padding: 0
          }}
        >
          <div style={fullBleedWrapper}>
            <iframe
              ref={iframeRef}
              src={STATIC_PATH}
              title="About — exported from InDesign"
              style={iframeStyle}
              role="document"
              /* note: do not set scrolling attribute; injected CSS will remove internal scrollbars */
            />
          </div>
        </div>

        {/* Caption + single "open standalone export" link */}
        <div style={captionStyle}>
          <div>Selected 3D prints — logo coasters, color lithophanes, and architectural models.</div>
          <div style={{ marginTop: 8 }}>
            <a href={STATIC_PATH} style={{ color: '#6c6c6a', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">
              Open standalone export
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
