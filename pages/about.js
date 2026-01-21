import React, { useEffect, useRef, useState } from 'react';
import HeaderBar from '../components/HeaderBar';

export default function AboutPage() {
  const iframeRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState('900px'); // initial sensible height

  const STATIC_PATH = '/static/about-page/index.html';
  const HEADER_HEIGHT = 60; // matches HeaderBar headerHeight

  // Get same-origin iframe content height safely
  function getIframeContentHeight(iframeEl) {
    try {
      const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
      if (!doc) return null;
      const body = doc.body;
      const html = doc.documentElement;
      return Math.max(
        body ? body.scrollHeight : 0,
        body ? body.offsetHeight : 0,
        html ? html.scrollHeight : 0,
        html ? html.offsetHeight : 0
      );
    } catch (e) {
      return null;
    }
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let rafId = null;

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

    function onLoad() {
      // initial resize
      resizeToContent();

      // attach MutationObserver inside iframe document if allowed
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (doc) {
          if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
            resizeObserverRef.current = null;
          }
          resizeObserverRef.current = new MutationObserver(() => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(resizeToContent);
          });
          resizeObserverRef.current.observe(doc, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true,
          });
        }
      } catch (e) {
        // cross-origin or other error; ignore observer
      }

      // short polling fallback to capture late-loading assets (fonts/images)
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      let polls = 0;
      pollIntervalRef.current = setInterval(() => {
        polls += 1;
        resizeToContent();
        if (polls > 32) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }, 250);
    }

    iframe.addEventListener('load', onLoad);

    // window resize handler (debounced)
    let resizeTimer = null;
    function onWindowResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeToContent();
      }, 120);
    }
    window.addEventListener('resize', onWindowResize);

    // If iframe already loaded from cache, run onLoad
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

  // Full-bleed container technique: forces child to span viewport width
  const fullBleedWrapper = {
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    marginRight: 'calc(50% - 50vw)',
    boxSizing: 'border-box',
    background: 'transparent',
  };

  const iframeStyle = {
    width: '100%',
    height: iframeHeight,
    border: 'none',
    display: 'block',
    overflow: 'visible',
    WebkitOverflowScrolling: 'touch',
    background: '#ffffff',
  };

  const fallbackContainer = {
    width: 'min(1600px,95vw)',
    margin: '22px auto 8px',
    padding: '0 24px',
    boxSizing: 'border-box',
    fontSize: 13,
    color: '#6c6c6a',
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
        className="matter-matters-page"
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
          paddingTop: HEADER_HEIGHT, // prevents content hiding under fixed nav
        }}
      >
        {/* Visible fallback link for users with iframes disabled or assistive tech */}
        <div style={fallbackContainer}>
          If the frame does not load, open the About page in a new tab:{' '}
          <a href={STATIC_PATH} target="_blank" rel="noopener noreferrer">
            Open standalone export
          </a>
        </div>

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
            boxShadow: 'none',
          }}
        >
          <div
            style={{
              ...fullBleedWrapper,
              display: 'block',
              margin: 0,
              padding: 0,
              background: 'transparent',
            }}
          >
            <iframe
              ref={iframeRef}
              src={STATIC_PATH}
              title="About — exported from InDesign"
              style={iframeStyle}
              scrolling="no"
              role="document"
            />
          </div>
        </div>

        {/* Caption and secondary link */}
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
