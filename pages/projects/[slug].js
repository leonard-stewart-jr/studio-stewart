import React, { useState } from "react";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import FloatingProjectModal from "../../components/floatingprojectmodal";
import projects from "../../data/projects";

export default function ProjectDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const project = projects.find(p => p.slug === slug);

  const [modalOpen, setModalOpen] = useState(false);

  if (!project) return (<div>Project not found.</div>);

  // Construct your src and width for the modal (customize as needed)
  const modalSlug = project.slug?.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const src = `/models/projects/${modalSlug}/index.html`;
  const width = project.modalWidth || 2436;

  return (
    <div style={{ paddingTop: 60 }}>
      {/* Clickable Image/Card area */}
      <div
        onClick={() => setModalOpen(true)}
        style={{
          cursor: "pointer",
          borderRadius: 8,
          boxShadow: "0 2px 12px rgba(32,32,32,0.12)",
          overflow: "hidden",
          border: "2px solid #e6dbb9",
          transition: "box-shadow 0.18s, border-color 0.18s",
          position: "relative",
        }}
        tabIndex={0}
        aria-label={`Open interactive modal for ${project.title}`}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") setModalOpen(true);
        }}
      >
        <img src={project.bannerSrc} alt={project.title} style={{ display: "block", width: "100%", height: "auto" }} />
        <div style={{
          position: "absolute",
          left: 14,
          bottom: 12,
          padding: "6px 10px",
          background: "rgba(0,0,0,0.35)",
          color: "#fff",
          fontFamily: "coolvetica, sans-serif",
          fontSize: 12,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          borderRadius: 4,
          userSelect: "none",
        }}>
          View Interactive Model
        </div>
      </div>

      <h1 style={{ marginTop: 16 }}>{project.title}</h1>
      <div style={{ color: "#6c6c6a" }}>{project.grade} · {project.type}</div>
      {project.description}
      
      {modalOpen && (
        <FloatingProjectModal
          onClose={() => setModalOpen(false)}
          src={src}
          width={width}
          height={785}
          navOffset={60}  /* reduced from 76 */
        />
      )}
    </div>
  );
}