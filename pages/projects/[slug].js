import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import projects from "../../data/projects"; // Adjust the path as needed

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

  // The first media item is always the "main" preview (video or image)
  const mainMedia = project.media?.[0];

  return (
    <div>
      <NavBar />
      <main style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "36px 12px"
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>{project.title}</h1>
        <div style={{ marginBottom: 12, color: "#888" }}>
          {project.grade} &middot; {project.type}
        </div>
        <div style={{ margin: "32px 0", maxWidth: 500 }}>
          {mainMedia?.type === "video" ? (
            <video
              src={mainMedia.src}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: "100%", borderRadius: 8 }}
            />
          ) : mainMedia?.type === "image" ? (
            <img
              src={mainMedia.src}
              alt={`${project.title} cover`}
              style={{ width: "100%", borderRadius: 8 }}
            />
          ) : null}
        </div>
        <div style={{ fontSize: 18 }}>{project.description}</div>
      </main>
    </div>
  );
}
