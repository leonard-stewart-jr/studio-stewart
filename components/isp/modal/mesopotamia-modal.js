import { useEffect, useRef } from "react";
import styled from "styled-components";

const MESO_HTML_PATH = "/models/world/mesopotamia/index.html";
const MESO_DOC_WIDTH = 2995;
const MESO_DOC_HEIGHT = 880;

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
            <iframe
              src={MESO_HTML_PATH}
              title="Mesopotamia Timeline"
              width={MESO_DOC_WIDTH}
              height={MESO_DOC_HEIGHT}
              style={{
                minWidth: MESO_DOC_WIDTH,
                minHeight: MESO_DOC_HEIGHT,
                maxWidth: MESO_DOC_WIDTH,
                maxHeight: MESO_DOC_HEIGHT,
                border: "none",
                display: "block",
                background: "#fff",
                borderRadius: 0,
              }}
              allowFullScreen
            />
          </ScrollArea>
        </ModalBody>
        <FloatingScrollbar>
          <ScrollbarRail>
            <ScrollbarThumb />
          </ScrollbarRail>
        </FloatingScrollbar>
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
  background: none;
`;

const ModalCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: fit-content;
  height: fit-content;
  position: relative;
`;

const ModalBody = styled.div`
  background: #fff;
  border-radius: 0;
  box-shadow: 0 8px 44px #2227;
  width: ${MESO_DOC_WIDTH}px;
  height: ${MESO_DOC_HEIGHT}px;
  min-width: ${MESO_DOC_WIDTH}px;
  min-height: ${MESO_DOC_HEIGHT}px;
  max-width: 99vw;
  max-height: 92vh;
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
  &::-webkit-scrollbar {
    height: 0; /* hide default scrollbar for horizontal */
    width: 0;
    background: transparent;
  }
`;

const FloatingScrollbar = styled.div`
  width: ${MESO_DOC_WIDTH}px;
  max-width: 99vw;
  position: absolute;
  left: 0;
  top: ${MESO_DOC_HEIGHT}px;
  /* position at bottom of modal body, floating */
  transform: translateY(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: transparent;
  height: 22px;
`;

const ScrollbarRail = styled.div`
  width: 100%;
  height: 14px;
  background: rgba(240,240,237,0.66);
  border-radius: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  position: relative;
`;

const ScrollbarThumb = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 32%;
  background: #e6dbb9;
  border-radius: 0;
  transition: background 0.15s;
  &:hover { background: #d6c08e; }
`;

// --- END STYLED COMPONENTS ---
