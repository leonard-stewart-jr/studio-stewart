import { useState } from "react";
import ProjectList from "../components/ProjectList";
import ProjectModal from "../components/ProjectModal";
import projects from "../data/projects";

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(null);

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
      {/* Project list with click handler */}
      <ProjectList
        projects={projects}
        onProjectClick={setActiveIndex}
      />

      {/* Project modal, only rendered when a project is active */}
      {activeIndex !== null && (
        <ProjectModal
          project={projects[activeIndex]}
          onClose={() => setActiveIndex(null)}
        />
      )}

      {/* Responsive styles (keep or move to CSS file as needed) */}
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
