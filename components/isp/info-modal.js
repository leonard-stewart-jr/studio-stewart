import { useEffect, useRef } from "react";
import styled from "styled-components";

export default function InfoModal({ open, onClose, marker }) {
  const backdropRef = useRef(null);

  // Trap ESC key to close
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // Only render when open and marker is MESOPOTAMIA
  if (
    !open ||
    !marker ||
    !marker.name.toLowerCase().startsWith("mesopotamia")
  )
    return null;

  // Click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  return (
    <ModalBackdrop
      ref={backdropRef}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <ModalBody onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close">&times;</CloseButton>
        <ScrollArea>
          <BlankCanvas />
        </ScrollArea>
      </ModalBody>
    </ModalBackdrop>
  );
}

// Styles

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0,0,0,0.56);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 76px;
  @media (max-width: 700px) {
    align-items: flex-start;
    padding-top: 0;
  }
`;

const ModalBody = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 44px #2229;
  max-width: 98vw;
  width: 98vw;
  max-height: calc(100vh - 92px);
  height: 900px;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #181818;
  overflow: hidden;
  @media (max-width: 700px) {
    max-width: 100vw;
    width: 100vw;
    height: 96vh;
    max-height: 98vh;
    border-radius: 4vw;
  }
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
  @media (max-width: 700px) {
    top: 18px;
    right: 18px;
    font-size: 2.1rem;
  }
`;

// This is the scrollable area for the super-wide canvas
const ScrollArea = styled.div`
  width: 100%;
  height: 850px;
  overflow-x: auto;
  overflow-y: hidden;
  background: transparent;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
`;

// The blank canvas rectangle for InDesign export
const BlankCanvas = styled.div`
  width: 6000px;
  height: 850px;
  background: #fff;
  border: 2px solid #e6dbb9;
  box-sizing: border-box;
  border-radius: 16px;
  margin: 24px 0 24px 0;
  box-shadow: 0 4px 44px #e6dbb980;
`;
