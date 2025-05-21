import { useState } from "react";
import SplashScreen from "../components/SplashScreen";
import NavBar from "../components/NavBar";
import Link from "next/link";

// Update your projects array as needed
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
              minHeight: "100vh",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "60px 0 40px 0",
              fontFamily: "'Futura', 'Open Sans', Arial, sans-serif",
            }}
          >
            <section
              style={{
                width: "100%",
                maxWidth: 1100,
                display: "flex",
                flexDirection: "column",
                gap: "68px",
              }}
            >
              {projects.map((project) => (
                <Link key={project.slug} href={`/projects/${project.slug}`} passHref legacyBehavior>
                  <a
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "36px",
                      textDecoration: "none",
                      color: "#181818",
                      width: "100%",
                      background: "none",
                      boxShadow: "none",
                      borderRadius: 0,
                      padding: 0,
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Left column: Project info */}
                    <div
                      style={{
                        minWidth: 210,
                        maxWidth: 210,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        flexShrink: 0,
                        marginRight: 24,
                        gap: 8,
                      }}
                    >
                      {/* Optional: logo/icon could go here */}
                      <div style={{
                        textAlign: "right"
                      }}>
                        <div style={{
                          fontFamily: "'Futura', 'Open Sans', Arial, sans-serif",
                          fontWeight: 700,
                          fontSize: 19,
                          marginBottom: 2,
                          letterSpacing: 0.01,
                          lineHeight: 1.2,
                          textTransform: "uppercase",
                        }}>
                          {project.title}
                        </div>
                        <div style={{
                          fontFamily: "'Open Sans', Arial, sans-serif",
                          fontSize: 13,
                          color: "#888",
                          letterSpacing: "0.10em",
                          textTransform: "uppercase"
                        }}>
                          {project.grade} — {project.type}
                        </div>
                      </div>
                    </div>
                    {/* Right column: Project cover (video or gif) */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        width: "100%",
                        maxWidth: 600,
                        aspectRatio: "16/9",
                        background: "#eee",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 6,
                        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                        position: "relative"
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
                            borderRadius: 6,
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
                            borderRadius: 6,
                          }}
                        />
                      )}
                    </div>
                  </a>
                </Link>
              ))}
            </section>
            {/* Responsive styles */}
            <style jsx>{`
              @media (max-width: 900px) {
                section {
                  max-width: 98vw;
                }
              }
              @media (max-width: 700px) {
                a {
                  flex-direction: column !important;
                  align-items: flex-start !important;
                  gap: 18px !important;
                }
                a > div {
                  align-items: flex-start !important;
                  text-align: left !important;
                  min-width: 0 !important;
                  max-width: none !important;
                  margin-right: 0 !important;
                  margin-bottom: 10px;
                }
              }
            `}</style>
          </main>
        </div>
      )}
    </>
  );
}
