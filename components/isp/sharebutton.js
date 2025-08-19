import React from "react";

// Icon paths (SVG imports or require if using with Webpack/Next, or just as /icons/share/...)
const ICONS = {
  download: "/icons/share/download.svg",
  linkedin: "/icons/share/linkedin.svg",
  reddit: "/icons/share/reddit.svg",
  mail: "/icons/share/mail.svg",
  link: "/icons/share/link.svg",
};

// Helper to open share links
function openInNewTab(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function ShareButton({ pdfUrl, htmlUrl, shareTitle, style }) {
  // Compose share URLs
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(htmlUrl)}`;
  const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(htmlUrl)}&title=${encodeURIComponent(shareTitle)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(htmlUrl)}`;

  // Copy link handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlUrl);
      alert("Link copied!");
    } catch (err) {
      alert("Failed to copy link.");
    }
  };

  // Download handler
  const handleDownload = () => {
    openInNewTab(pdfUrl);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 18,
        background: "rgba(0,0,0,0.92)",
        borderRadius: 8,
        padding: "9px 20px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        alignItems: "center",
        ...style,
      }}
      aria-label="Share or download this project"
    >
      {/* Download Button */}
      <button
        onClick={handleDownload}
        style={iconButtonStyle}
        aria-label="Download PDF"
        title="Download PDF"
        type="button"
      >
        <img src={ICONS.download} alt="" style={iconImgStyle} />
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => openInNewTab(linkedInUrl)}
        style={iconButtonStyle}
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        type="button"
      >
        <img src={ICONS.linkedin} alt="" style={iconImgStyle} />
      </button>

      {/* Reddit */}
      <button
        onClick={() => openInNewTab(redditUrl)}
        style={iconButtonStyle}
        aria-label="Share on Reddit"
        title="Share on Reddit"
        type="button"
      >
        <img src={ICONS.reddit} alt="" style={iconImgStyle} />
      </button>

      {/* Email */}
      <button
        onClick={() => openInNewTab(mailUrl)}
        style={iconButtonStyle}
        aria-label="Share by email"
        title="Share by email"
        type="button"
      >
        <img src={ICONS.mail} alt="" style={iconImgStyle} />
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        style={iconButtonStyle}
        aria-label="Copy link"
        title="Copy link"
        type="button"
      >
        <img src={ICONS.link} alt="" style={iconImgStyle} />
      </button>
    </div>
  );
}

// Styles
const iconButtonStyle = {
  background: "transparent",
  border: "none",
  borderRadius: 4,
  padding: 4,
  cursor: "pointer",
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "box-shadow 0.13s, background 0.13s",
};

const iconImgStyle = {
  width: 32,
  height: 32,
  display: "block",
  pointerEvents: "none",
};
