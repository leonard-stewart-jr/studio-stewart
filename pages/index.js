import { useState, useRef, useEffect } from "react";
import SplashScreen from "../components/SplashScreen";
import NavBar from "../components/NavBar";
import Link from "next/link";

const projects = [
  {
    grade: "3rd Year",
    title: "Urban Pavilion",
    type: "Cultural Center",
    slug: "urban-pavilion",
    coverType: "video",
    coverSrc: "/projects/urban-pavilion/cover.mp4",
    description: "Description or more images go here."
  },
  {
    grade: "2nd Year",
    title: "Residential Loft",
    type: "Housing",
    slug: "residential-loft",
    coverType: "gif",
    coverSrc: "/projects/residential-loft/cover.gif",
    description: "Description or more images go here."
  },
  {
    grade: "4th Year",
    title: "Riverfront Studio",
    type: "Commercial",
    slug: "riverfront-studio",
    coverType: "video",
    coverSrc: "/projects/riverfront-studio/cover.mp4",
    description: "Description or more images go here."
  },
];

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
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
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {!showSplash && (
        <div>
          <NavBar />
          <main
            style={{
              minHeight: "100vh",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "60px 0 40px 0",
              fontFamily: "'Futura', 'Open Sans', Arial, sans-serif",
            }}
          >
            <section
              style={{
                width: "100%",
                maxWidth: 1100,
                display: "flex",
                flexDirection: "column",
                gap: "68px",
              }}
            >
              {projects.map((project, idx) => (
                <div
                  key={project.slug}
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "36px",
                    cursor: "pointer",
                    width: "100%",
                    userSelect: "none",
                  }}
                  tabIndex={0}
                  aria-label={`Open ${project.title} project`}
                >
                  {/* Left column: Project info */}
                  <div
                    style={{
                      minWidth: 210,
                      maxWidth: 210,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      flexShrink: 0,
                      marginRight: 24,
                      gap: 8,
                    }}
                  >
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 19,
                          marginBottom: 2,
                          letterSpacing: 0.01,
                          lineHeight: 1.2,
                          textTransform: "uppercase",
                        }}
                      >
                        {project.title}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#888",
                          letterSpacing: "0.10em",
                          textTransform: "uppercase",
                        }}
                      >
                        {project.grade} — {project.type}
                      </div>
                    </div>
                  </div>
                  {/* Right column: Project cover (video or gif) */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      width: "100%",
                      maxWidth: 600,
                      aspectRatio: "16/9",
                      background: "#eee",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 6,
                      boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                      position: "relative",
                    }}
                  >
                    {project.coverType === "video" ? (
                      <video
                        src={project.coverSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                    ) : (
                      <img
                        src={project.coverSrc}
                        alt={`${project.title} cover`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </section>

            {/* Project Lightbox/Modal */}
            {activeIndex !== null && (
              <div
                onClick={() => setActiveIndex(null)}
                style={{
                  position: "fixed",
                  zIndex: 2000,
                  inset: 0,
                  background: "rgba(255,255,255,0.97)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  transition: "background 0.2s",
                  cursor: "zoom-out",
                }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                tabIndex={0}
                aria-modal="true"
                role="dialog"
              >
                <div
                  style={{
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    background: "#fff",
                    borderRadius: 10,
                    boxShadow: "0 8px 48px rgba(0,0,0,0.17)",
                    overflow: "hidden",
                    position: "relative",
                    cursor: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Project media */}
                  <div style={{ width: "min(80vw,900px)", maxHeight: "70vh", margin: "0 auto" }}>
                    {projects[activeIndex].coverType === "video" ? (
                      <video
                        src={projects[activeIndex].coverSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          borderRadius: 8,
                          background: "#eee",
                        }}
                      />
                    ) : (
                      <img
                        src={projects[activeIndex].coverSrc}
                        alt={`${projects[activeIndex].title} cover`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          borderRadius: 8,
                          background: "#eee",
                        }}
                      />
                    )}
                  </div>
                  {/* Project info and navigation arrows */}
                  <div
                    style={{
                      width: "min(80vw,900px)",
                      padding: "24px 12px 16px 12px",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                    }}
                  >
                    <button
                      aria-label="Previous project"
                      disabled={activeIndex === 0}
                      onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                      style={{
                        fontSize: 28,
                        background: "none",
                        border: "none",
                        color: activeIndex === 0 ? "#bbb" : "#181818",
                        cursor: activeIndex === 0 ? "default" : "pointer",
                        padding: 8,
                      }}
                    >
                      &#8592;
                    </button>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontWeight: 700, fontSize: 22, textTransform: "uppercase" }}>
                        {projects[activeIndex].title}
                      </div>
                      <div style={{ fontSize: 14, color: "#888", margin: "7px 0", textTransform: "uppercase", letterSpacing: ".1em" }}>
                        {projects[activeIndex].grade} — {projects[activeIndex].type}
                      </div>
                      <div style={{ fontSize: 16, color: "#444", marginTop: 8 }}>
                        {projects[activeIndex].description}
                      </div>
                    </div>
                    <button
                      aria-label="Next project"
                      disabled={activeIndex === projects.length - 1}
                      onClick={() => setActiveIndex((i) => Math.min(projects.length - 1, i + 1))}
                      style={{
                        fontSize: 28,
                        background: "none",
                        border: "none",
                        color: activeIndex === projects.length - 1 ? "#bbb" : "#181818",
                        cursor: activeIndex === projects.length - 1 ? "default" : "pointer",
                        padding: 8,
                      }}
                    >
                      &#8594;
                    </button>
                  </div>
                  <button
                    aria-label="Close"
                    onClick={() => setActiveIndex(null)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 20,
                      fontSize: 32,
                      background: "none",
                      border: "none",
                      color: "#888",
                      cursor: "pointer",
                    }}
                  >
                    &times;
                  </button>
                </div>
              </div>
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
        </div>
      )}
    </>
  );
}
