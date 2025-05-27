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
          <ImageSlider
            images={[
              { src: "/images/6am-summer.jpg", label: "6AM, Summer Solstice" },
              { src: "/images/noon-summer.jpg", label: "Noon, Summer Solstice" },
              { src: "/images/6pm-summer.jpg", label: "6PM, Summer Solstice" },
              { src: "/images/midnight-summer.jpg", label: "Midnight, Summer Solstice" },
              { src: "/images/6am-winter.jpg", label: "6AM, Winter Solstice" },
              { src: "/images/noon-winter.jpg", label: "Noon, Winter Solstice" },
              { src: "/images/6pm-winter.jpg", label: "6PM, Winter Solstice" },
              { src: "/images/midnight-winter.jpg", label: "Midnight, Winter Solstice" },
              { src: "/images/6am-equinox.jpg", label: "6AM, Spring/Fall Equinox" },
              { src: "/images/noon-equinox.jpg", label: "Noon, Spring/Fall Equinox" },
              { src: "/images/6pm-equinox.jpg", label: "6PM, Spring/Fall Equinox" },
              { src: "/images/midnight-equinox.jpg", label: "Midnight, Spring/Fall Equinox" },
            ]}
          />
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
