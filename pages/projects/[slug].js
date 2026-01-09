import { useRouter } from "next/router";
import { useState } from "react";
import projects from "../../data/projects";
import FloatingProjectModal from "../../components/floatingprojectmodal";

export default function ProjectDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const project = projects.find((p) => p.slug === slug);
  const [open, setOpen] = useState(false);

  if (!project) {
    return <div style={{ padding: 24 }}>Project not found.</div>;
  }

  const modalSlug = project.slug?.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const src = `/models/projects/${modalSlug}/index.html`;
  const width = project.modalWidth || 2436;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ textTransform: "uppercase", letterSpacing: ".04em" }}>{project.title}</h1>
      <p style={{ color: "#6c6c6a", textTransform: "uppercase" }}>
        {project.grade} · {project.type}
      </p>

      <button
        onClick={() => setOpen(true)}
        style={{
          background: "#e6dbb9",
          color: "#181818",
          border: "1px solid #d6c08e",
          borderRadius: 6,
          padding: "10px 16px",
          cursor: "pointer"
        }}
      >
        View Interactive Model
      </button>

      {open && (
        <FloatingProjectModal
          onClose={() => setOpen(false)}
          src={src}
          width={width}
          height={785}
          navOffset={60}
        />
      )}
    </div>
  );
}