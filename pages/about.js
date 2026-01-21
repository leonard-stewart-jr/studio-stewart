import React, { useEffect, useRef, useState } from 'react';
import HeaderBar from '../components/HeaderBar';

/**
 * About page - improved embedding for InDesign export at /static/about-page/index.html
 *
 * Key behaviors:
 * - Full-bleed iframe (visually spans left→right)
 * - Injects conservative normalization CSS into the iframe document to remove internal scrolling,
 *   hide export footer and known fallback text, and make content responsive where possible.
 * - If the exported HTML uses fixed px widths, the parent measures its natural width and applies
 *   a CSS transform scale to the exported document so images AND text scale proportionally to fit.
 * - Sets iframe height to the scaled content height so the parent page is the single scroll surface.
 * - Robustness: thresholds, caps, stability checks, MutationObserver + short polling fallback.
 *
 * Note: this relies on same-origin access (your export lives at /static/about-page).
 * If you edit the exported HTML (option B), you can remove the injected CSS needs and make the export
 * responsive directly; this parent-side approach is safe and reversible.
 */

export default function AboutPage() {
  const iframeRef = useRef(null);
  const observerRef = useRef(null);
  const pollRef = useRef(null);
  const rafRef = useRef(null);

  const [iframeHeight, setIframeHeight] = useState('900px');

  const STATIC_PATH = '/static/about-page/index.html';
  const HEADER_HEIGHT = 60; // header reserved space
  const MAX_IFRAME_HEIGHT = 12000; // safety cap to stop runaway height
  const HEIGHT_THRESHOLD_PX = 6; // only update height when change > this
  const STABILITY_REQUIRED = 3; // number of stable reads required
  const POLL_INTERVAL_MS = 200;
  const POLL_LIMIT = 50; // ~10s

  // read unscaled content size of iframe (natural width/height)
  function readIframeNaturalSize(iframeEl) {
    try {
      const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
      if (!doc) return null;
      const html = doc.documentElement;
      const body = doc.body;

      // use scrollWidth/scrollHeight as natural document size
      const naturalWidth = Math.max(
        html ? html.scrollWidth : 0,
        body ? body.scrollWidth : 0
      );
      const naturalHeight = Math.max(
        html ? html.scrollHeight : 0,
        body ? body.scrollHeight : 0
      );

      return {
        width: Number.isFinite(naturalWidth) ? naturalWidth : null,
        height: Number.isFinite(naturalHeight) ? naturalHeight : null
      };
    } catch (e) {
      return null;
    }
  }

  // Inject targeted normalization CSS and hide footer / known fallback text container
  function injectNormalizationAndHide(iframeEl) {
    try {
      const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
      if (!doc) return;

      const css = `
        /* Normalize exported layout so it can fit and not create inner scrollbars */
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
        /* Make imagery and SVG scale to container width */
        img, svg, figure, picture, video {
          max-width: 100% !important;
          height: auto !important;
        }
        /* Hide common footer selectors so parent supplies site footer */
        footer, .site-footer, .page-footer, .export-footer {
          display: none !important;
        }
      `;

      // Avoid duplicate style tag
      const existing = doc.getElementById('about-iframe-normalize');
      if (existing) {
        existing.textContent = css;
      } else {
        const styleEl = doc.createElement('style');
        styleEl.id = 'about-iframe-normalize';
        styleEl.type = 'text/css';
        styleEl.appendChild(doc.createTextNode(css));
        if (doc.head) doc.head.insertBefore(styleEl, doc.head.firstChild);
        else doc.documentElement.insertBefore(styleEl, doc.documentElement.firstChild);
      }

      // Remove or hide the fallback line if present (text node that mentions "If the frame does not load")
      // This tries to find any element containing that exact phrase and remove it safely.
      const searchText = 'If the frame does not load';
      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null, false);
      let node;
      const toRemove = [];
      while ((node = walker.nextNode())) {
        try {
          if (node.textContent && node.textContent.includes(searchText)) {
            toRemove.push(node);
          }
        } catch (err) {
          // ignore node access errors
        }
      }
      toRemove.forEach(n => {
        try { n.parentNode && n.parentNode.removeChild(n); } catch (e) {}
      });
    } catch (err) {
      // ignore cross-origin or other errors (shouldn't happen when export is same-origin)
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

    function applyMeasuredSize(naturalWidth, naturalHeight) {
      if (!naturalWidth || !naturalHeight) return;

      // container width is iframe's current client width (full-bleed)
      const containerWidth = iframe.getBoundingClientRect().width || window.innerWidth;

      // If naturalWidth is zero, skip
      if (!naturalWidth) return;

      // Compute scale to fit horizontally. If naturalWidth already <= containerWidth, scale = 1.
      const scale = Math.min(1, containerWidth / naturalWidth);

      // Compute scaled height
      const scaledHeight = Math.min(MAX_IFRAME_HEIGHT, Math.round(naturalHeight * scale));

      // Safety guards: ignore spikes > 1.8x previous (likely measurement glitch)
      if (lastAppliedHeight > 0 && scaledHeight > lastAppliedHeight * 1.8) {
        // skip this reading
        return;
      }

      // Only update when change is significant
      const prevHeight = lastAppliedHeight || parseInt(iframeHeight, 10) || 0;
      const prevScale = lastAppliedScale || 1;

      const heightDiff = Math.abs(prevHeight - scaledHeight);
      const scaleDiff = Math.abs(prevScale - scale);

      if (heightDiff < HEIGHT_THRESHOLD_PX && scaleDiff < 0.01) {
        stableReads += 1;
      } else {
        stableReads = 0;
      }

      if (heightDiff >= HEIGHT_THRESHOLD_PX || scaleDiff >= 0.01) {
        // Apply the scale and height into the iframe's document
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          if (doc && doc.body) {
            // apply transform scale on body to scale all content including text and images
            doc.body.style.transformOrigin = '0 0';
            doc.body.style.transform = `scale(${scale})`;
            // to avoid the scaled body being clipped, ensure html/body width equals naturalWidth
            // so the transform scales it correctly
            doc.documentElement.style.width = `${naturalWidth}px`;
            doc.body.style.width = `${naturalWidth}px`;
            // ensure overflow visible inside iframe doc
            doc.documentElement.style.overflow = 'visible';
            doc.body.style.overflow = 'visible';
          }
        } catch (e) {
          // ignore
        }

        lastAppliedHeight = scaledHeight;
        lastAppliedScale = scale;
        setIframeHeight(`${scaledHeight}px`);
      }

      // Stop polling/observing once stable
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

    function normalizeInjectAndMeasure() {
      try {
        injectNormalizationAndHide(iframe);
      } catch (e) {}
      measureAndApply();
    }

    function onLoad() {
      // On load, inject CSS to neutralize internal scroll & hide footer/fallback
      normalizeInjectAndMeasure();

      // Attach MutationObserver inside the iframe document (if same-origin) to watch dynamic changes
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
              normalizeInjectAndMeasure();
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
        // ignore
      }

      // Start polling fallback to catch late-loading fonts/images (stop when stable or after limit)
      if (pollRef.current) clearInterval(pollRef.current);
      polls = 0;
      pollRef.current = setInterval(() => {
        polls += 1;
        normalizeInjectAndMeasure();
        if (polls > POLL_LIMIT) {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      }, POLL_INTERVAL_MS);
    }

    iframe.addEventListener('load', onLoad);

    // If iframe content is already loaded (cached), call onLoad immediately
    try {
      if (iframe.contentDocument && (iframe.contentDocument.readyState === 'complete' || iframe.contentDocument.readyState === 'interactive')) {
        onLoad();
      }
    } catch (e) {
      // ignore
    }

    // parent window resize should re-measure and adjust scale
    function onWindowResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        normalizeInjectAndMeasure();
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

  // Layout: full-bleed wrapper so iframe spans viewport width
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
        {/* Full-bleed iframe container */}
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
              title="About — exported InDesign"
              style={iframeStyle}
              role="document"
            />
          </div>
        </div>
      </main>
    </>
  );
}
