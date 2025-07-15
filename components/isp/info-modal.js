import { useEffect, useState } from "react";
import styled, { css } from "styled-components";

// Helper: get modal id (safe file name) from marker name
function getModalId(name) {
  if (!name) return "";
  // Use lowercased, keep only letters/numbers, dash for spaces, strip punctuation/years
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Helper: theme per modalId
const MODAL_THEMES = {
  mesopotamia: {
    background: "#f9f6eb",
    accent: "#b32c2c"
  },
  // Add more here as needed
};

export default function InfoModal({ open, onClose, marker }) {
  const [htmlContent, setHtmlContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Get modalId
  const modalId = marker ? getModalId(marker.name.split(":")[0]) : "";
  const theme = MODAL_THEMES[modalId] || { background: "#fff", accent: "#b32c2c" };

  useEffect(() => {
    if (!open || !modalId) {
      setHtmlContent(null);
      setLoadError(false);
      return;
    }

    setLoading(true);
    setHtmlContent(null);
    setLoadError(false);

    fetch(`/modals/isp/${modalId}.html`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.text();
      })
      .then(html => {
        setHtmlContent(html);
        setLoading(false);
      })
      .catch(() => {
        setHtmlContent(null);
        setLoading(false);
        setLoadError(true);
      });
  }, [open, modalId]);

  if (!open || !marker) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer
        themebg={theme.background}
        accent={theme.accent}
        onClick={e => e.stopPropagation()}
      >
        <CloseButton onClick={onClose} accent={theme.accent}>&times;</CloseButton>
        {loading && (
          <div style={{ padding: 64, textAlign: "center", color: theme.accent }}>
            <div className="loader" style={{
              margin: "0 auto 16px auto",
              border: `4px solid #eee`,
              borderTop: `4px solid ${theme.accent}`,
              borderRadius: "50%",
              width: 36, height: 36,
              animation: "spin 1s linear infinite"
            }} />
            <div>Loading...</div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg);}
                100% { transform: rotate(360deg);}
              }
            `}</style>
          </div>
        )}
        {/* If HTML loaded, show it. Otherwise, fallback to legacy JSX */}
        {!loading && htmlContent && (
          <HTMLContent
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            themebg={theme.background}
            accent={theme.accent}
          />
        )}
        {!loading && !htmlContent && loadError && (
          // Fallback: show legacy modal (old rendering)
          <LegacyContent marker={marker} />
        )}
      </ModalContainer>
    </Overlay>
  );
}

// Legacy fallback for events without HTML file
function LegacyContent({ marker }) {
  if (!marker || !marker.timeline) return <div>No data.</div>;
  const event = marker.timeline[0];
  return (
    <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <h2 style={{ marginTop: 0 }}>{marker.name}</h2>
      <div style={{ color: "#b1b1ae", fontWeight: 700 }}>{event.year}</div>
      <div style={{ fontWeight: 600, margin: "8px 0 12px 0" }}>{event.title}</div>
      <div style={{ marginBottom: 16 }}>{event.content}</div>
      {event.images && event.images.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {event.images.map((img, i) => (
            <div key={i} style={{ maxWidth: 160 }}>
              <img src={img.src} alt={img.caption} style={{ width: "100%", borderRadius: 7, marginBottom: 2 }} />
              <div style={{ fontSize: 12, color: "#888" }}>{img.caption}</div>
            </div>
          ))}
        </div>
      )}
      {event.sources && (
        <div style={{ fontSize: 13, color: "#888" }}>
          <b>Sources:</b>
          <ul>
            {event.sources.map((src, i) => <li key={i}>{src}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 999;
  background: rgba(0,0,0,0.48);
  display: flex; align-items: center; justify-content: center;
`;

const ModalContainer = styled.div`
  background: ${props => props.themebg || "#fff"};
  padding: 2.2rem 2.2rem 2.7rem 2.2rem;
  border-radius: 1rem;
  box-shadow: 0 8px 44px #2227;
  max-width: 680px;
  width: 97vw;
  max-height: 94vh;
  overflow-y: auto;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #181818;
  position: relative;
  @media (max-width: 600px) {
    padding: 1.1rem 0.6rem 1.4rem 0.6rem;
    max-width: 100vw;
    width: 100vw;
    max-height: 99vh;
    border-radius: 0.7rem;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 18px; right: 26px;
  background: none;
  border: none;
  color: ${props => props.accent || "#b32c2c"};
  font-size: 2.4rem;
  font-weight: bold;
  line-height: 1;
  z-index: 30;
  cursor: pointer;
  transition: color 0.15s;
  &:hover, &:focus { color: #a12020; }
  @media (max-width: 600px) {
    top: 12px; right: 13px; font-size: 2rem;
  }
`;

const HTMLContent = styled.div`
  /* Ensures modal HTML always matches your font and sizing */
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #181818;
  font-size: 1.06em;
  background: ${props => props.themebg || "none"};
  /* Allow modal HTML to use its own classes/styles too */
  a { color: ${props => props.accent || "#b32c2c"}; }
`;
