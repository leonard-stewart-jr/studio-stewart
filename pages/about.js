import React, { useEffect, useRef, useState } from 'react';
import HeaderBar from '../components/HeaderBar';

/**
 * About page (parent-controlled iframe):
 * - Disable page (parent) scroll while this page is mounted so the iframe is the single scroll surface.
 * - Let the iframe carry scrolling (fills viewport under the fixed header).
 * - Inject targeted CSS into the iframe document to:
 *     - center the exported HTML horizontally (body flex + justify-content: center)
 *     - remove top/bottom margins on html/body/wrapper and allow natural height
 *     - hide exported footer and fallback text if present
 *     - style the iframe internal scrollbar to match site tan color (#e6dbb9)
 *     - make images/svg responsive inside the iframe
 * - No transform scaling applied (content scrolls natively in iframe).
 * - Removes caption and fallback link (you asked to keep them removed).
 *
 * Drop into pages/about.js (replace existing).
 */

export default function AboutPage() {
  const iframeRef = useRef(null);

  const STATIC_PATH = '/static/about-page/index.html';
  const HEADER_HEIGHT = 60; // matches HeaderBar headerHeight

  // Keep a small initial iframe height (won't matter because we size to viewport)
  const [iframeHeight, setIframeHeight] = useState(`calc(100vh - ${HEADER_HEIGHT}px)`);

  // On mount: disable parent/page scrolling so iframe is the only scroller.
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    // Lock parent scroll
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      // Restore previous values
      document.body.style.overflow = prevBodyOverflow || '';
      document.documentElement.style.overflow = prevHtmlOverflow || '';
    };
  }, []);

  // Inject CSS into the iframe when it loads to center content horizontally,
  // remove exported footer/fallback text, make images responsive, and style scrollbar.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let observer = null;
    let pollInterval = null;

    function injectStylesAndCleanup() {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (!doc || !doc.documentElement) return;

        // Targeted CSS: center horizontally, allow native scrolling inside iframe,
        // hide common footers/fallbacks, make images responsive, style scrollbar.
        const css = `
/* Normalize basic layout */
html, body, #page, .page, .export-container, .adobe-export, .aep-export {
  width: auto !important;
  max-width: none !important;
  box-sizing: border-box !important;
  height: auto !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: visible !important;
}

/* Center exported content horizontally */
body {
  display: flex !important;
  justify-content: center !important;
  align-items: flex-start !important; /* vertical flow preserved */
  background: transparent !important;
}

/* Ensure wrappers center */
#page, .page, .export-container {
  margin-left: auto !important;
  margin-right: auto !important;
}

/* Make images and vector assets responsive */
img, svg, picture, figure {
  max-width: 100% !important;
  height: auto !important;
  display: block;
}

/* Hide exported footer/fallback selectors (parent supplies site chrome) */
footer, .site-footer, .page-footer, .export-footer {
  display: none !important;
}

/* Hide any visible "If the frame does not load" fallback block if present (defensive) */
[aria-hidden="true"][role="note"], .fallback, .iframe-fallback {
  display: none !important;
}

/* Style iframe's internal scrollbar to match site tan color */
html::-webkit-scrollbar, body::-webkit-scrollbar {
  width: 14px;
  background: transparent;
}
html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb {
  background: #e6dbb9;
  border-radius: 0;
}
html::-webkit-scrollbar-thumb:hover, body::-webkit-scrollbar-thumb:hover {
  background: #d6c08e;
}
/* Firefox */
body {
  scrollbar-width: thin;
  scrollbar-color: #e6dbb9 #f0f0ed;
}
        `;

        // Insert or update a style element in the iframe head
        let styleEl = doc.getElementById('about-iframe-normalize');
        if (styleEl) {
          styleEl.textContent = css;
        } else {
          styleEl = doc.createElement('style');
          styleEl.id = 'about-iframe-normalize';
          styleEl.type = 'text/css';
          styleEl.appendChild(doc.createTextNode(css));
          if (doc.head) doc.head.insertBefore(styleEl, doc.head.firstChild);
          else doc.documentElement.insertBefore(styleEl, doc.documentElement.firstChild);
        }

        // Remove any element containing the fallback phrase to be sure (safe removal)
        const fallbackPhrase = 'If the frame does not load';
        try {
          const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null, false);
          const toRemove = [];
          let node;
          while ((node = walker.nextNode())) {
            try {
              if (node.textContent && node.textContent.includes(fallbackPhrase)) {
                toRemove.push(node);
              }
            } catch (err) {
              // Continue on access errors
            }
          }
          toRemove.forEach(n => {
            try { n.parentNode && n.parentNode.removeChild(n); } catch (e) {}
          });
        } catch (e) {
          // ignore
        }
      } catch (e) {
        // ignore cross-origin or unexpected errors
      }
    }

    function onLoad() {
      // Inject styles right away
      injectStylesAndCleanup();

      // MutationObserver inside iframe to re-apply if export mutates or rewrites nodes
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (doc) {
          if (observer) {
            observer.disconnect();
            observer = null;
          }
          observer = new MutationObserver(() => {
            // Reapply styles on mutation (debounced via rAF)
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(injectStylesAndCleanup);
          });
          observer.observe(doc, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
          });
        }
      } catch (e) {
        // ignore if we cannot attach observer
      }

      // Polling fallback to handle late-loaded fonts/images or scripts that alter layout
      let count = 0;
      pollInterval = setInterval(() => {
        count += 1;
        injectStylesAndCleanup();
        if (count > 40) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      }, 200);
    }

    // Attach load handler
    iframe.addEventListener('load', onLoad);

    // If already loaded (cached), run immediately
    try {
      const docReady = iframe.contentDocument && (iframe.contentDocument.readyState === 'complete' || iframe.contentDocument.readyState === 'interactive');
      if (docReady) onLoad();
    } catch (e) {
      // ignore
    }

    // Cleanup on unmount
    return () => {
      try {
        iframe.removeEventListener('load', onLoad);
      } catch (e) {}
      if (observer) {
        try { observer.disconnect(); } catch (e) {}
        observer = null;
      }
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // We'll set the iframe to fill viewport minus header so it becomes the single scroller.
  const iframeStyle = {
    width: '100%',
    height: `calc(100vh - ${HEADER_HEIGHT}px)`,
    border: 'none',
    display: 'block',
    background: 'transparent'
  };

  const fullBleedWrapper = {
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    marginRight: 'calc(50% - 50vw)',
    boxSizing: 'border-box',
    background: 'transparent'
  };

  return (
    <>
      {/* Keep header/navigation */}
      <HeaderBar fixedNav={true} />

      <main
        style={{
          width: '100vw',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
          background: '#fff',
          overflow: 'hidden', // parent scroll disabled
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          // Reserve header height so iframe sits below the fixed header
          paddingTop: HEADER_HEIGHT
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
            />
          </div>
        </div>
      </main>
    </>
  );
}
