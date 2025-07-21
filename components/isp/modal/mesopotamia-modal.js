import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

// Constants for modal size
const MODAL_HEIGHT = 800;
const EDGE_HOVER_WIDTH = 48; // px from left/right edge for arrow cursor
const SCROLL_AMOUNT = 440; // px to scroll per click

export default function MesopotamiaModal({ open, onClose }) {
  const backdropRef = useRef(null);
  const scrollRef = useRef(null);
  const [mouseEdge, setMouseEdge] = useState(null); // "left" | "right" | null

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

  // Mouse edge detection for custom cursor
  function handleMouseMove(e) {
    if (!scrollRef.current) return setMouseEdge(null);
    const bounds = scrollRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    if (x <= EDGE_HOVER_WIDTH) setMouseEdge("left");
    else if (x >= bounds.width - EDGE_HOVER_WIDTH) setMouseEdge("right");
    else setMouseEdge(null);
  }

  // Mouse leave resets cursor
  function handleMouseLeave() {
    setMouseEdge(null);
  }

  // Click edge to scroll
  function handleEdgeClick(e) {
    if (!scrollRef.current) return;
    const bounds = scrollRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    if (x <= EDGE_HOVER_WIDTH) {
      scrollRef.current.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
    } else if (x >= bounds.width - EDGE_HOVER_WIDTH) {
      scrollRef.current.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
    }
  }

  // Set custom cursor for scroll area
  const cursorStyle =
    mouseEdge === "left"
      ? "url('/icons/arrow-left.svg'), w-resize"
      : mouseEdge === "right"
      ? "url('/icons/arrow-right.svg'), e-resize"
      : "grab";

  if (!open) return null;

  return (
    <Backdrop ref={backdropRef} onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <ModalContainer>
        <TopBar>
          <Tabs>
            {/* Example tabs - replace with your actual tabs */}
            <Tab>HISTORY</Tab>
            <Tab>FUTURE</Tab>
          </Tabs>
          <CloseBtn onClick={onClose} aria-label="Close">&times;</CloseBtn>
        </TopBar>
        <ScrollArea
          ref={scrollRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleEdgeClick}
          style={{ cursor: cursorStyle }}
          tabIndex={0}
          className="mesopotamia-scrollbar"
        >
          {/* --- Modal content: Replace below with your actual HTML/content --- */}
          <ContentBlock>
            <img src="/images/isp/stele-of-hammurabi.png" alt="Stele of Hammurabi" style={{ height: 350, marginRight: 28, borderRadius: 8 }} />
            <div style={{ minWidth: 490, maxWidth: 650 }}>
              <h2 style={{ fontFamily: "coolvetica,sans-serif", fontWeight: 900, fontSize: 52, marginBottom: 18 }}>MESOPOTAMIA: THE FIRST PRISONS</h2>
              <p style={{ fontSize: 25, fontWeight: 400, marginBottom: 25 }}>Stele of Hammurabi<br />Basalt relief sculpture, dated around 1754 BCE, discovered in Susa and inscribed with the earliest surviving code of laws.</p>
              <p style={{ fontSize: 17, color: "#444", lineHeight: 1.6 }}>
                The first known prisons weren’t built for punishment the way we understand it today. In ancient Mesopotamia, across cities like Ur, Nippur, and Babylon, temple and state authorities operated early detention centers called “Houses of Confinement.” These spaces existed as far back as 3200 BCE, used not just to detain accused individuals, but to extract labor, collect debts, and await ritual trials or legal decisions...
              </p>
            </div>
            <img src="/images/isp/map-ancient-mesopotamia.jpg" alt="Ancient Mesopotamia Map" style={{ height: 350, marginLeft: 28, borderRadius: 8 }} />
          </ContentBlock>
          <ContentBlock>
            <img src="/images/isp/flaying-of-rebels-relief.jpg" alt="Flaying of Rebels Relief" style={{ height: 350, marginRight: 28, borderRadius: 8 }} />
            <div style={{ minWidth: 490, maxWidth: 650 }}>
              <h3 style={{ fontWeight: 700, fontSize: 28, marginBottom: 10 }}>Flaying of Rebels Relief</h3>
              <p style={{ fontSize: 17, color: "#444", lineHeight: 1.6 }}>
                Neo-Assyrian wall carving showing prisoners tortured as public warning under imperial justice.
              </p>
            </div>
            <img src="/images/isp/code-of-lipit-ishtar.jpg" alt="Code of Lipit-Ishtar" style={{ height: 350, marginLeft: 28, borderRadius: 8 }} />
          </ContentBlock>
        </ScrollArea>
      </ModalContainer>
    </Backdrop>
  );
}

// --- Styled Components ---

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1600;
  background: rgba(32,32,32,0.24);
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  pointer-events: auto;
`;

const ModalContainer = styled.div`
  margin-top: 32px;
  margin-bottom: 32px;
  margin-left: 0;
  max-height: ${MODAL_HEIGHT}px;
  background: #fff;
  box-shadow: 0 8px 44px rgba(32,32,32,0.22);
  border-radius: 10px;
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 900px;
  max-width: 100vw;
`;

const TopBar = styled.div`
  width: 100%;
  min-height: 66px;
  height: 66px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 2px solid #e6dbb9;
  padding: 0 38px 0 22px;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Tabs = styled.div`
  display: flex;
  gap: 22px;
`;

const Tab = styled.button`
  background: none;
  border: none;
  font-family: "coolvetica", sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #b1b1ae;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0 8px;
  letter-spacing: .08em;
  &:hover { color: #e6dbb9; }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 2.8rem;
  font-weight: bold;
  z-index: 20;
  cursor: pointer;
  margin-left: 18px;
  margin-right: -10px;
  transition: color 0.18s;
  &:hover, &:focus { color: #b32c2c; }
`;

const ScrollArea = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  overflow-x: auto;
  overflow-y: hidden;
  max-height: ${MODAL_HEIGHT - 66}px;
  width: 100%;
  background: #fff;
  outline: none;
  scrollbar-width: thin;
  scrollbar-color: #e6dbb9 #f0f0ed;
  &::-webkit-scrollbar {
    height: 14px;
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #e6dbb9;
    border-radius: 0;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #d6c08e;
  }
`;

const ContentBlock = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 28px;
  min-width: 950px;
  max-width: 1200px;
  height: 100%;
  padding: 42px 44px;
  background: #fff;
  border-right: 1.5px solid #eee;
  box-sizing: border-box;
  &:last-child { border-right: none; }
`;
