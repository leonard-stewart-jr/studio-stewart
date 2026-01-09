'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProjectList from "../components/ProjectList";
import FloatingProjectModal from "../components/floatingprojectmodal";
import projects from "../data/projects";
import { Project } from "../types/project";

// Helper: Derive the HTML5 export path and width from project (used only for non-route projects)
function getProjectModalProps(project: Project) {
    // Generic fallback: build path from slug
    const slug = String(project.slug || "").toLowerCase();
    const src = `/portfolio/${slug}/index`;
    const width = project.modalWidth || 2436;
    return { src, width };
}

export default function Home() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    function handleProjectClick(idx: number) {
        const project = projects[idx];
        // Route-only projects go to their pages
        if (project && project.action === "route" && project.linkHref) {
            router.push(project.linkHref);
            return;
        }
        // Non-route projects fallback to modal
        setActiveIndex(idx);
    }

    return (
        <>
            <ProjectList projects={projects} onProjectClick={handleProjectClick} />

            {activeIndex !== null && (
                <FloatingProjectModal
                    onClose={() => setActiveIndex(null)}
                    {...getProjectModalProps(projects[activeIndex])}
                    height={785}
                    navOffset={76}
                    open={activeIndex !== null}
                />
            )}
        </>
    );
}
