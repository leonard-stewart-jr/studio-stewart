import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import ImageSlider from "../../components/ImageSlider";
import ScrollableBanner from "../../components/ScrollableBanner";
import projects from "../../data/projects";

export default function ProjectDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const project = projects.find(p => p.slug === slug);

  if (!project) return (
    <div>
      <NavBar />
      <div style={{ padding: 32 }}>Project not found.</div>
    </div>
  );

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
        <div style={{ width: 300, minWidth: 240 }}>
          <ImageSlider images={project.sliderImages} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>{project.title}</h1>
          <div style={{ marginBottom: 12, color: "#888" }}>
            {project.grade} &middot; {project.type}
          </div>
          <div style={{ margin: "32px 0", fontSize: 18 }}>{project.description}</div>
          <ScrollableBanner
            src={project.bannerSrc}
            height={600}
            alt={project.title + " banner"}
          />
        </div>
      </main>
    </div>
  );
}
