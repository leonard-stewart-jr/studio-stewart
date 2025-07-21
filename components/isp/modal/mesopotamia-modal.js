import { useEffect, useRef } from "react";
import styled from "styled-components";

const MESO_HTML_PATH = "/models/world/mesopotamia/index.html";
const MESO_DOC_WIDTH = 2995;
const MESO_DOC_HEIGHT = 880;
const ASPECT_RATIO = MESO_DOC_WIDTH / MESO_DOC_HEIGHT; // ~3.4

export default function MesopotamiaModal({ open, onClose }) {
  const backdropRef = useRef(null);

  // ESC closes
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Click outside closes
  const handleBackdropClick = e => {
    if (e.target === backdropRef.current) onClose();
  };

  if (!open) return null;

  return (
    <ModalOuter ref={backdropRef} onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <ModalCenter>
        <ModalBody>
          <CloseButton onClick={onClose} aria-label="Close">&times;</CloseButton>
          <ScrollArea>
            <ResponsiveIframeWrapper>
              <iframe
                src={MESO_HTML_PATH}
                title="Mesopotamia Timeline"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                  background: "#fff",
                  borderRadius: 0,
                }}
                allowFullScreen
              />
            </ResponsiveIframeWrapper>
          </ScrollArea>
        </ModalBody>
      </ModalCenter>
    </ModalOuter>
  );
}

// --- STYLED COMPONENTS ---

const ModalOuter = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1600;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  background: rgba(0,0,0,0.15); /* subtle backdrop */
`;

const ModalCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100vw;
  height: 100vh;
  position: relative;
`;

const ModalBody = styled.div`
  background: #fff;
  border-radius: 0;
  box-shadow: 0 8px 44px #2227;
  width: 95vw;
  max-width: 1200px;
  height: auto;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: 'Coolvetica', Helvetica, Arial, sans-serif;
  color: #181818;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 22px;
  right: 32px;
  background: none;
  border: none;
  color: #888;
  font-size: 2.8rem;
  font-weight: bold;
  z-index: 2;
  cursor: pointer;
  transition: color 0.18s;
  &:hover, &:focus { color: #b32c2c; }
`;

const ScrollArea = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: auto;
  background: #fff;
  scrollbar-width: thin;
  scrollbar-color: #e6dbb9 #f0f0ed;
`;

const ResponsiveIframeWrapper = styled.div`
  width: 100%;
  aspect-ratio: ${ASPECT_RATIO};
  max-height: 72vh;
  background: #fff;
  /* For browsers without aspect-ratio: fallback */
  @supports not (aspect-ratio: 1) {
    position: relative;
    &::before {
      content: "";
      display: block;
      padding-top: ${(1/ASPECT_RATIO)*100}%;
    }
    iframe {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
    }
  }
`;
