import React, { useState } from "react";
import ProjectList from "../components/ProjectList";
import ProjectModal from "../components/ProjectModal";
import projects from "../data/projects";

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <main style={{ minHeight: "100vh", background: "#f9f9f7" }}>
      <header>
        <h1 style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 700,
          fontSize: 36,
          margin: "32px 0 0 0",
          textAlign: "center",
          letterSpacing: 1,
          color: "#222"
        }}>
          My Projects
        </h1>
      </header>
      <ProjectList projects={projects} onProjectClick={setActiveIndex} />
      {activeIndex !== null && (
        <ProjectModal
          project={projects[activeIndex]}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </main>
  );
}
