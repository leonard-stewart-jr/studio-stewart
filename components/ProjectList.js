import ImageSlider from "./ImageSlider";
export default function ProjectList({ projects, onProjectClick }) {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "64px auto 0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "90px",
      }}
    >
      {projects.map((project, idx) => {
        const firstMedia = project.media[0];
        let videoElement = null;

        // Video hover handlers
        const handleMouseEnter = () => {
          if (firstMedia.type === "video" && videoElement) {
            videoElement.play();
          }
        };
        const handleMouseLeave = () => {
          if (firstMedia.type === "video" && videoElement) {
            videoElement.pause();
            videoElement.currentTime = 0;
          }
        };

        return (
          <div
            key={project.slug}
            onClick={() => onProjectClick(idx)}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              cursor: "pointer",
              width: "100%",
              userSelect: "none",
              gap: "56px",
            }}
<div
  style={{
    flex: 1,
    minWidth: 0,
    maxWidth: 700,
    aspectRatio: "16/9",
    background: "#eee",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    borderRadius: 0,
    boxShadow: "none",
    position: "relative",
  }}
>
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
            {/* Right: Main image or video */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                maxWidth: 700,
                aspectRatio: "16/9",
                background: "#eee",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                borderRadius: 0,
                boxShadow: "none",
                position: "relative",
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {firstMedia.type === "video" ? (
                <video
                  ref={el => (videoElement = el)}
                  src={firstMedia.src}
                  poster={project.media.find(m => m.type === "image")?.src}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 0,
                    display: "block",
                  }}
                  muted
                  loop
                  preload="none"
                  playsInline
                />
              ) : (
                <img
                  src={firstMedia.src}
                  alt={`${project.title} cover`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 0,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
