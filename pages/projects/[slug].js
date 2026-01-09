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

  if (!project) return (
    <div>
      <NavBar />
      <div style={{ padding: 32 }}>Project not found.</div>
    </div>
  );

  // Construct your src and width for the modal (customize as needed)
  const modalSlug = project.slug?.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const src = `/models/projects/${modalSlug}/index.html`;
  const width = project.modalWidth || 2436;

  return (
    <div>
      <NavBar />
      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "64px 12px",
          display: "flex",
          gap: 48,
          alignItems: "flex-start",
        }}
      >
        {/* Clickable Image/Card area */}
        <div style={{ width: 360, minWidth: 260, maxWidth: 480 }}>
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
            <img
              src={project.bannerSrc}
              alt={project.title + " banner"}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                filter: modalOpen ? "brightness(0.85)" : "none",
                transition: "filter 0.18s"
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "10px 0",
                background: "rgba(32,32,32,0.64)",
                color: "#e6dbb9",
                fontWeight: 600,
                fontSize: 18,
                textAlign: "center",
                letterSpacing: ".04em"
              }}
            >
              View Interactive Model
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>{project.title}</h1>
          <div style={{ marginBottom: 12, color: "#888" }}>
            {project.grade} &middot; {project.type}
          </div>
          <div style={{ margin: "32px 0", fontSize: 18 }}>{project.description}</div>
        </div>
      </main>
      {modalOpen && (
        <FloatingProjectModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          src={src}
          width={width}
          height={785}
          navOffset={76}
        />
      )}
    </div>
  );
}