import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";

// TODO: Replace with your actual data source or fetch dynamically.
const projects = [
  {
    grade: "SOPHOMORE",
    title: "Urban Pavilion",
    type: "HEALTHCARE",
    slug: "urban-pavilion",
    coverType: "video",
    coverSrc: "/projects/urban-pavilion/cover.mp4",
    description: "A full project description goes here.",
  },
  // ...other projects
];

export default function ProjectDetail() {
  const router = useRouter();
  const { slug } = router.query;

  const project = projects.find(p => p.slug === slug);
  if (!project) return <div><NavBar /><div style={{padding:32}}>Project not found.</div></div>;

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
          {project.coverType === "video" ? (
            <video
              src={project.coverSrc}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: "100%", borderRadius: 8 }}
            />
          ) : (
            <img
              src={project.coverSrc}
              alt={`${project.title} cover`}
              style={{ width: "100%", borderRadius: 8 }}
            />
          )}
        </div>
        <div style={{ fontSize: 18 }}>{project.description}</div>
      </main>
    </div>
  );
}
