import React, { useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import ProjectList from "../components/ProjectList";
import FloatingProjectModal from "../components/floatingprojectmodal";
// IMPORTANT: Load PdfBookModal only on the client to avoid SSR pdf.js (DOMMatrix) errors
const PdfBookModal = dynamic(() => import("../components/PdfBookModal"), { ssr: false });
import projects from "../data/projects";

function getProjectModalProps(project) {
  // Map project to your interactive HTML export path
  if (project.slug === "DMA-25") {
    return { src: "/portfolio/dma/25/index", width: project.modalWidth || 2436 };
  }
  // Fallback: derive from slug
  const slugLower = (project.slug || "").toLowerCase();
  return { src: `/portfolio/${slugLower}/index`, width: project.modalWidth || 2436 };
}

export default function Home() {
  const router = useRouter();

  const [activeHtmlIndex, setActiveHtmlIndex] = useState(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfTitle, setPdfTitle] = useState("UNDERGRADUATE PORTFOLIO (2020–2024)");

  function handleProjectClick(idx) {
    const project = projects[idx];
    if (!project) return;

    // Hard guard: Independent Studio should ALWAYS route to its dedicated page
    // This prevents any accidental modal opening due to stale/mismatched data.
    if (project.slug === "ISP") {
      router.push("/independent-studio");
      return;
    }

    if (project.action === "route" && project.linkHref) {
      router.push(project.linkHref);
      return;
    }

    if (project.action === "modal" && project.modalType === "pdf") {
      setPdfFile(project.pdfSrc);
      setPdfTitle(`${project.title} (${project.grade})`);
      setPdfOpen(true);
      return;
    }

    if (project.action === "modal") {
      setActiveHtmlIndex(idx);
      return;
    }
  }

  return (
    <>
      <ProjectList projects={projects} onProjectClick={handleProjectClick} />

      {activeHtmlIndex !== null && (
        <FloatingProjectModal
          onClose={() => setActiveHtmlIndex(null)}
          {...getProjectModalProps(projects[activeHtmlIndex])}
          height={785}
          navOffset={76}
        />
      )}

      <PdfBookModal
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        file={pdfFile}
        title={pdfTitle}
        spreadsMode={true}
      />
    </>
  );
}
