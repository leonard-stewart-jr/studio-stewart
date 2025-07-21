import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

const MODAL_HEIGHT = 800; // px

export default function MesopotamiaModal({ open, onClose }) {
  const backdropRef = useRef(null);

  // ESC closes
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Click outside closes
  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) onClose();
  }

  if (!open) return null;

  return (
    <Backdrop ref={backdropRef} onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <ModalContainer>
        <CloseBtn onClick={onClose} aria-label="Close">&times;</CloseBtn>
        <ContentArea>
          <iframe
            src="/models/world/mesopotamia/index.html"
            title="Mesopotamia Timeline"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "transparent",
              display: "block"
            }}
          />
        </ContentArea>
      </ModalContainer>
    </Backdrop>
  );
}

// --- Styled Components ---
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1600;
  background: rgba(32,32,32,0.22);
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
`;

const ModalContainer = styled.div`
  margin-top: 32px;
  margin-bottom: 32px;
  margin-left: 0;
  max-height: ${MODAL_HEIGHT}px;
  width: 95vw;
  max-width: 1200px;
  background: #fff;
  box-shadow: 0 8px 44px rgba(32,32,32,0.22);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 22px;
  right: 32px;
  background: none;
  border: none;
  color: #888;
  font-size: 2.8rem;
  font-weight: bold;
  z-index: 20;
  cursor: pointer;
  transition: color 0.18s;
  &:hover, &:focus { color: #b32c2c; }
`;

const ContentArea = styled.div`
  width: 100%;
  height: ${MODAL_HEIGHT - 66}px;
  overflow: hidden;
  background: transparent;
`;
