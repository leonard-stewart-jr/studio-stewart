import { useState, useRef, useEffect } from "react";
import ProjectList from "../components/ProjectList";
import ProjectModal from "../components/ProjectModal";
import projects from "../data/projects";

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(null);

  // Keyboard navigation for modal
  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e) => {
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i > 0 ? i - 1 : i));
      if (e.key === "ArrowRight") setActiveIndex((i) => (i < projects.length - 1 ? i + 1 : i));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex]);

  // Touch swipe navigation for modal
  const touchStart = useRef();
  const onTouchStart = (e) => (touchStart.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStart.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (delta > 50 && activeIndex > 0) setActiveIndex(activeIndex - 1);
    else if (delta < -50 && activeIndex < projects.length - 1) setActiveIndex(activeIndex + 1);
    touchStart.current = null;
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 0 40px 0",
        fontFamily: "'Futura', 'Open Sans', Arial, sans-serif",
      }}
    >
      <ProjectList projects={projects} onProjectClick={setActiveIndex} />
      {activeIndex !== null && (
        <ProjectModal
          project={projects[activeIndex]}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          projectsLength={projects.length}
          onClose={() => setActiveIndex(null)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        />
      )}
      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 900px) {
          section {
            max-width: 98vw;
          }
        }
        @media (max-width: 700px) {
          section > div {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 18px !important;
          }
          section > div > div {
            align-items: flex-start !important;
            text-align: left !important;
            min-width: 0 !important;
            max-width: none !important;
            margin-right: 0 !important;
            margin-bottom: 10px;
          }
        }
      `}</style>
    </main>
  );
}
