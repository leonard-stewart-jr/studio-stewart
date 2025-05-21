import { useState } from "react";
import SplashScreen from "../components/SplashScreen";
import NavBar from "../components/NavBar";
import Link from "next/link";

const projects = [
  {
    grade: "3rd Year",
    title: "Urban Pavilion",
    type: "Cultural Center",
    slug: "urban-pavilion",
    coverType: "video", // or "gif"
    coverSrc: "/projects/urban-pavilion/cover.mp4",
  },
  {
    grade: "2nd Year",
    title: "Residential Loft",
    type: "Housing",
    slug: "residential-loft",
    coverType: "gif",
    coverSrc: "/projects/residential-loft/cover.gif",
  },
  {
    grade: "4th Year",
    title: "Riverfront Studio",
    type: "Commercial",
    slug: "riverfront-studio",
    coverType: "video",
    coverSrc: "/projects/riverfront-studio/cover.mp4",
  },
];

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {!showSplash && (
        <div>
          <NavBar />
          <main
            style={{
              minHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              background: "#fafafa",
              borderRadius: 12,
              padding: "2rem",
              margin: "0 auto",
              maxWidth: 700,
              boxShadow: "0 4px 24px #eee",
            }}
          >
            <h1 style={{ marginBottom: 28, fontSize: 32 }}>Portfolio Projects</h1>
            <div style={{ width: "100%" }}>
              {projects.map((project) => (
                <Link key={project.slug} href={`/projects/${project.slug}`} passHref legacyBehavior>
                  <a
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 24,
                      borderRadius: 10,
                      marginBottom: 28,
                      padding: "18px 20px",
                      background: "#fff",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                      textDecoration: "none",
                      color: "#181818",
                      transition: "box-shadow 0.18s",
                      minHeight: 110,
                    }}
                  >
                    <div
                      style={{
                        width: 150,
                        minWidth: 120,
                        height: 90,
                        overflow: "hidden",
                        borderRadius: 8,
                        background: "#eee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {project.coverType === "video" ? (
                        <video
                          src={project.coverSrc}
                          autoPlay
                          loop
                          muted
                          playsInline
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      ) : (
                        <img
                          src={project.coverSrc}
                          alt={`${project.title} cover`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, color: "#646464", fontWeight: 500, marginBottom: 3 }}>
                        {project.grade}
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 2 }}>
                        {project.title}
                      </div>
                      <div style={{ fontSize: 15, color: "#888" }}>
                        {project.type}
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </main>
        </div>
      )}
    </>
  );
}
