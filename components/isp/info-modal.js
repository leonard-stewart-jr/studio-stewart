import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Keyboard } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import styled from "styled-components";

// Only needed once in your app
SwiperCore.use([Navigation, Keyboard]);

// Data structure for Mesopotamia modal slides
const mesopotamiaSlides = [
  {
    title: "MESOPOTAMIA: THE FIRST PRISONS",
    year: "c. 3200–1600 BCE",
    description:
      "The first known prisons weren’t built for punishment the way we understand it today. " +
      "In ancient Mesopotamia, across cities like Ur, Nippur, and Babylon, temple and state authorities operated early detention centers called “Houses of Confinement.” " +
      "These spaces existed as far back as 3200 BCE, used not just to detain accused individuals, but to extract labor, collect debts, and await ritual trials or legal decisions.\n\n" +
      "Codes like that of Ur-Nammu and Hammurabi mention imprisonment as a step in legal or spiritual processing, especially in cases like kidnapping or debt. " +
      "But confinement wasn’t always the end sentence; it was part of a layered justice system that combined law, economy, and religion. " +
      "In hymns to Nungal, the Mesopotamian goddess of prisons, incarceration was framed as a spiritual ordeal, refining the soul through hardship, like metal in fire.\n\n" +
      "These were the first known spaces built to contain people through state power. " +
      "They introduced ideas that carried through millennia: that confinement could punish, correct, and morally restore. " +
      "They weren’t just early jails; they were foundational to the entire timeline of prison history, merging justice, control, and symbolic rehabilitation in one system.",
    image: "/images/isp/flaying-of-rebels-relief.jpg",
    caption: "Flaying of Rebels Relief (c. 661–631 BCE, Nineveh): Neo-Assyrian wall carving showing prisoners tortured as public warning under imperial justice."
  },
  {
    title: "Stele of Hammurabi",
    year: "c. 1754 BCE",
    description:
      "The Stele of Hammurabi is a stone pillar inscribed with one of the earliest and most influential legal codes in history. " +
      "Dating to around 1754 BCE in Babylon, it includes rules on imprisonment and physical retribution. " +
      "The code outlines punishments for theft, debt, and abuse, and established legal precedent for the use of confinement as social control.",
    image: "/images/isp/stele-of-hammurabi.png",
    caption: "Stele of Hammurabi (c. 1754 BCE, Babylon): Stone pillar inscribed with Babylon’s legal code, including rules on imprisonment and physical retribution."
  },
  {
    title: "Code of Lipit-Ishtar",
    year: "c. 1860 BCE",
    description:
      "The Code of Lipit-Ishtar, carved around 1860 BCE in Nippur, details civil rights and punishments in the Sumerian kingdom. " +
      "This early legal code described a variety of penalties, including imprisonment, reflecting the state's growing power over individual liberty. " +
      "It marks a transition toward more structured and written justice systems in Mesopotamia.",
    image: "/images/isp/code-of-lipit-ishtar.jpg",
    caption: "Code of Lipit-Ishtar (c. 1860 BCE, Nippur): Early legal code by Sumerian king detailing civil rights and punishments, including imprisonment."
  },
  {
    title: "Map of Ancient Mesopotamia",
    year: "",
    description:
      "This map provides a geographic overview showing key cities like Ur, Akkad, and Babylon where detention systems began. " +
      "The dense network of city-states fostered the development of legal codes and the early use of imprisonment as a tool of statecraft.",
    image: "/images/isp/map-ancient-mesopotamia.jpg",
    caption: "Map of Ancient Mesopotamia (Modern Iraq): Geographic overview showing key cities like Ur, Akkad, and Babylon where detention systems began."
  }
];

export default function InfoModal({ open, onClose, marker }) {
  const backdropRef = useRef(null);

  // Trap focus in modal and handle ESC close
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

  // Modal should only render for Mesopotamia (for now)
  if (!open || !marker || !marker.name.toLowerCase().startsWith("mesopotamia")) return null;

  // Close modal on outside click
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  // Helper to render description with paragraphs from plain text
  function renderParagraphs(text) {
    return text
      .split(/\n{2,}/)
      .map((para, idx) => (
        <p key={idx} style={{ marginBottom: "1em" }}>{para.trim()}</p>
      ));
  }

  return (
    <ModalBackdrop
      ref={backdropRef}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <ModalBody onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close">&times;</CloseButton>
        <Swiper
          navigation
          keyboard
          spaceBetween={0}
          slidesPerView={1}
          style={{ width: "100%", height: "100%" }}
        >
          {mesopotamiaSlides.map((slide, idx) => (
            <SwiperSlide key={idx}>
              <SlideLayout>
                <SlideInfo>
                  <SlideTitle>{slide.title}</SlideTitle>
                  {slide.year && <SlideYear>{slide.year}</SlideYear>}
                  <SlideDesc>
                    {renderParagraphs(slide.description)}
                  </SlideDesc>
                </SlideInfo>
                <SlideImageWrapper>
                  <img src={slide.image} alt={slide.title} />
                  <SlideCaption>{slide.caption}</SlideCaption>
                </SlideImageWrapper>
              </SlideLayout>
            </SwiperSlide>
          ))}
        </Swiper>
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
  padding-top: 76px; /* NAV BAR HEIGHT */
  @media (max-width: 700px) {
    align-items: flex-start;
    padding-top: 0;
  }
`;

const ModalBody = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 44px #2229;
  max-width: 1100px;
  width: 96vw;
  max-height: calc(100vh - 92px);
  height: 800px;
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

const SlideLayout = styled.div`
  display: flex;
  flex-direction: row;
  gap: 32px;
  width: 100%;
  height: 100%;
  align-items: stretch;
  padding: 52px 40px 32px 40px;
  box-sizing: border-box;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 22px;
    padding: 36px 8vw 24px 8vw;
    align-items: flex-start;
  }
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 14px;
    padding: 22px 2vw 12px 2vw;
  }
`;

const SlideInfo = styled.div`
  flex: 1.1 1 0;
  min-width: 220px;
  max-width: 410px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  @media (max-width: 900px) {
    min-width: 0;
    max-width: 100%;
  }
`;

const SlideTitle = styled.h2`
  font-size: 2.1rem;
  font-weight: bold;
  margin: 0 0 0.5em 0;
  color: #b32c2c;
  line-height: 1.13;
  @media (max-width: 900px) {
    font-size: 1.4rem;
  }
`;

const SlideYear = styled.div`
  color: #b1b1ae;
  font-weight: 700;
  font-size: 1.11rem;
  margin-bottom: 0.7em;
`;

const SlideDesc = styled.div`
  font-size: 1.05rem;
  font-weight: 400;
  color: #222;
  margin-bottom: 1.4em;
  line-height: 1.55;
  @media (max-width: 900px) {
    font-size: 0.98rem;
    margin-bottom: 0.7em;
  }
`;

const SlideImageWrapper = styled.div`
  flex: 1.6 1 0;
  min-width: 260px;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 14px;
  @media (max-width: 900px) {
    min-width: 0;
    max-width: 100%;
    gap: 8px;
  }
  img {
    width: 100%;
    max-width: 540px;
    height: auto;
    border-radius: 10px;
    box-shadow: 0 2px 18px #2223;
    object-fit: contain;
    background: #eee;
    @media (max-width: 900px) {
      max-width: 100vw;
      border-radius: 6vw;
    }
    @media (max-width: 700px) {
      border-radius: 4vw;
    }
  }
`;

const SlideCaption = styled.div`
  font-size: 0.99em;
  color: #979174;
  margin-bottom: 0.3em;
  margin-top: -0.2em;
  font-style: italic;
  text-align: center;
  max-width: 96%;
`;
