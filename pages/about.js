// pages/about.js
import { useEffect } from 'react';

export default function AboutIframe() {
  useEffect(() => {
    // Optional: ensure body scroll is enabled if exported page forces overflow hidden
    document.body.style.overflow = '';
    return () => {};
  }, []);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff' }}>
      <div style={{ width: '100%', maxWidth: 1600, margin: '0 auto', padding: '36px' }}>
        <p style={{ fontSize: 13, color: '#6c6c6a' }}>
          If the frame does not load, <a href="/static/about-page/index.html">open the About page in a new tab</a>.
        </p>
      </div>

      <iframe
        title="About — exported from InDesign"
        src="/static/about-page/index.html"
        style={{
          width: '100%',
          height: 'calc(100vh - 220px)', // adjust height to fit your header and footer
          border: 'none',
          display: 'block',
        }}
        sandbox="" /* add restrictions if needed */
      />

      <div style={{ width: '100%', maxWidth: 1600, margin: '8px auto 40px', padding: '0 24px' }}>
        <p style={{ fontSize: 12, color: '#8a8a86' }}>
          Note: you can also <a href="/static/about-page/index.html">open the standalone export</a>.
        </p>
      </div>
    </div>
  );
}
