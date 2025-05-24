import React from "react";

export default function ProjectList({ projects, onProjectClick }) {
  return (
    <section style={{ display: "flex", flexWrap: "wrap", gap: 32, padding: 40 }}>
      {projects.map((project, idx) => (
        <div
          key={idx}
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            padding: 24,
            minWidth: 260,
            cursor: "pointer",
            flex: "0 0 auto"
          }}
          onClick={() => onProjectClick(idx)}
        >
          <h3 style={{ margin: "0 0 8px" }}>{project.title}</h3>
          <div style={{ color: "#888", fontSize: 14 }}>{project.grade} — {project.type}</div>
        </div>
      ))}
    </section>
  );
}
