import React, { useEffect, useRef, useState } from 'react';
import HeaderBar from '../components/HeaderBar';

/**
 * About page — parent-side fix to embed an InDesign HTML export at:
 *   /static/about-page/index.html
 *
 * Goals for this file (Option A, parent-only):
 * - Ensure there is one scrollbar only (the site / parent scroll).
 * - Remove exported footer and any visible "fallback" text inside the export.
 * - Make the exported document scale so the entire page (text + images) fits the viewport width
 *   by applying a transform scale on the exported document body (when the export is fixed-px).
 * - Set iframe height to the scaled content height so there is no inner iframe scrollbar.
 * - Robust guards to avoid runaway growth (thresholds, caps, stable-read stops).
 *
 * Drop this file into pages/about.js (replace existing). The export must be same-origin
 * (public/static/about-page/index.html) so the parent can read and modify the iframe document.
 */

export default function AboutPage() {
  const iframeRef = useRef(null);
  const observerRef = useRef(null);
  const pollRef = useRef(null);
  const rafRef = useRef(null);

  // sensible initial height while measuring/loading
  const [iframeHeight, setIframeHeight] = useState('900px');

  const STATIC_PATH = '/static/about-page/index.html';
  const HEADER_HEIGHT = 60; // reserved top space for HeaderBar
  const MAX_IFRAME_HEIGHT = 16000; // safety cap to avoid runaway height
  const HEIGHT_THRESHOLD_PX = 6; // only apply when change exceeds this
  const STABILITY_REQUIRED = 3; // consecutive stable reads to stop polling
  const POLL_INTERVAL_MS = 200;
  const POLL_LIMIT = 60; // ~12s

  // Helper: read natural (unscaled) document size from same-origin iframe
  function readIframeNaturalSize(iframeEl) {
    try {
      const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
      if (!doc) return null;
      const html = doc.documentElement;
      const body = doc.body;
      const naturalWidth = Math.max(html?.scrollWidth || 0, body?.scrollWidth || 0);
      const naturalHeight = Math.max(html?.scrollHeight || 0, body?.scrollHeight || 0);
      return {
        width: Number.isFinite(naturalWidth) && naturalWidth > 0 ? naturalWidth : null,
        height: Number.isFinite(naturalHeight) && naturalHeight > 0 ? naturalHeight : null
      };
    } catch (e) {
      return null;
    }
  }

  // Inject normalization CSS into exported document to disable internal scroll, allow scaling,
  // and hide exported footer/fallback text where possible.
  function injectNormalizationStylesAndHide(iframeEl) {
    try {
      const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
      if (!doc) return;

      const css = `
        /* Normalize exported page so it doesn't force its own scroll or fixed 100vh wrappers */
        html, body, #page, .page, .export-container, .adobe-export, .aep-export {
          width: 100% !important;
          max-width: none !important;
          height: auto !important;
          min-height: 0 !important;
          overflow: visible !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }
        /* Make images and SVGs responsive */
        img, svg, picture, figure {
          max-width: 100% !important;
          height: auto !important;
        }
        /* Hide common footer selectors so the parent supplies the footer */
        footer, .site-footer, .page-footer, .export-footer {
          display: none !important;
        }
      `;

      const existing = doc.getElementById('about-iframe-normalize');
      if (existing) {
        existing.textContent = css;
      } else {
        const style = doc.createElement('style');
        style.id = 'about-iframe-normalize';
        style.type = 'text/css';
        style.appendChild(doc.createTextNode(css));
        if (doc.head) doc.head.insertBefore(style, doc.head.firstChild);
        else doc.documentElement.insertBefore(style, doc.documentElement.firstChild);
      }

      // Remove any element containing the fallback text if present (safe removal)
      const fallbackText = 'If the frame does not load';
      if (doc.body) {
        const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null, false);
        const toRemove = [];
        let node;
        while ((node = walker.nextNode())) {
          try {
            if (node.textContent && node.textContent.includes(fallbackText)) {
              toRemove.push(node);
            }
          } catch (err) {
            // ignore
          }
        }
        toRemove.forEach(n => {
          try { n.parentNode && n.parentNode.removeChild(n); } catch (e) {}
        });
      }
    } catch (e) {
      // ignore cross-origin or unexpected failures
    }
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let polls = 0;
    let stableReads = 0;
    let lastAppliedHeight = 0;
    let lastAppliedScale = 1;
    let resizeTimer = null;

    // Apply measured natural size by computing a scale that fits the iframe container width.
    // This scales all content (text + images) by transforming the iframe document body.
    function applyMeasuredSize(naturalWidth, naturalHeight) {
      if (!naturalWidth || !naturalHeight) return;

      // containerWidth is the visible width the iframe occupies (full-bleed -> viewport width)
      const containerWidth = iframe.getBoundingClientRect().width || window.innerWidth || 1200;

      // compute scale to fit horizontally (allow upscaling so export stretches left->right)
      // cap the scale between 0.5 and 1.6 to avoid absurd upscales
      const rawScale = containerWidth / naturalWidth;
      const scale = Math.max(0.5, Math.min(rawScale, 1.6));

      // compute scaled height to set on the iframe (so no internal scrollbar)
      const scaledHeight = Math.min(MAX_IFRAME_HEIGHT, Math.round(naturalHeight * scale));

      // ignore unrealistic spikes
      if (lastAppliedHeight > 0 && scaledHeight > lastAppliedHeight * 2.0) {
        return;
      }

      const prevHeight = lastAppliedHeight || parseInt(iframeHeight, 10) || 0;
      const prevScale = lastAppliedScale || 1;
      const heightDiff = Math.abs(prevHeight - scaledHeight);
      const scaleDiff = Math.abs(prevScale - scale);

      if (heightDiff < HEIGHT_THRESHOLD_PX && scaleDiff < 0.01) {
        stableReads += 1;
      } else {
        stableReads = 0;
      }

      // Only apply DOM updates if there is a meaningful change
      if (heightDiff >= HEIGHT_THRESHOLD_PX || scaleDiff >= 0.01) {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          if (doc && doc.body) {
            // set transform on body so all content including text/images scales proportionally
            doc.body.style.transformOrigin = '0 0';
            doc.body.style.transform = `scale(${scale})`;

            // ensure body/html width equals naturalWidth so transform scales predictable layout
            doc.documentElement.style.width = `${naturalWidth}px`;
            doc.body.style.width = `${naturalWidth}px`;

            // After scaling and sizing, prevent internal scrollbars — parent will be the single scroll
            doc.documentElement.style.overflow = 'hidden';
            doc.body.style.overflow = 'hidden';
          }
        } catch (e) {
          // ignore cross-origin / unexpected errors
        }

        lastAppliedHeight = scaledHeight;
        lastAppliedScale = scale;
        setIframeHeight(`${scaledHeight}px`);
      }

      // stop polling/observing when stable
      if (stableReads >= STABILITY_REQUIRED && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    function measureAndApply() {
      if (!iframe) return;
      const natural = readIframeNaturalSize(iframe);
      if (!natural) return;
      applyMeasuredSize(natural.width, natural.height);
    }

    function normalizeInjectMeasure() {
      try {
        injectNormalizationStylesAndHide(iframe);
      } catch (e) {}
      measureAndApply();
    }

    function onLoad() {
      // Inject CSS + measure immediately
      normalizeInjectMeasure();

      // Attach a MutationObserver inside iframe document to catch DOM/late changes
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (doc) {
          if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
          observerRef.current = new MutationObserver(() => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
              normalizeInjectMeasure();
            });
          });
          observerRef.current.observe(doc, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
          });
        }
      } catch (e) {
        // ignore if observer cannot be attached
      }

      // Polling fallback to catch fonts/images
      if (pollRef.current) clearInterval(pollRef.current);
      polls = 0;
      pollRef.current = setInterval(() => {
        polls += 1;
        normalizeInjectMeasure();
        if (polls > POLL_LIMIT) {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      }, POLL_INTERVAL_MS);
    }

    iframe.addEventListener('load', onLoad);

    // If cached and already interactive/complete, run onLoad now
    try {
      if (iframe.contentDocument && (iframe.contentDocument.readyState === 'complete' || iframe.contentDocument.readyState === 'interactive')) {
        onLoad();
      }
    } catch (e) {
      // ignore
    }

    // On parent window resize re-measure after debounce
    function onWindowResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        normalizeInjectMeasure();
      }, 140);
    }
    window.addEventListener('resize', onWindowResize);

    return () => {
      iframe.removeEventListener('load', onLoad);
      window.removeEventListener('resize', onWindowResize);
      if (observerRef.current) {
        try { observerRef.current.disconnect(); } catch (e) {}
        observerRef.current = null;
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Full-bleed wrapper so the iframe stretches left->right visually
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
    overflow: 'visible',
    WebkitOverflowScrolling: 'touch',
    background: 'transparent',
    boxSizing: 'border-box'
  };

  return (
    <>
      {/* Keep header + fixed nav */}
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
          paddingTop: HEADER_HEIGHT // reserve header space
        }}
      >
        {/* iframe full-bleed container */}
        <div
          style={{
            width: '100vw',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            background: '#fff',
            margin: 0,
            padding: 0,
            boxShadow: 'none'
          }}
        >
          <div style={fullBleedWrapper}>
            <iframe
              ref={iframeRef}
              src={STATIC_PATH}
              title="About — exported from InDesign"
              style={iframeStyle}
              role="document"
              /* no scrolling attribute set — parent will be the single scroller */
            />
          </div>
        </div>
      </main>
    </>
  );
}
