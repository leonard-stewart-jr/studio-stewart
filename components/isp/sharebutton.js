import React from "react";

// Props:
// - pdfUrl: string (required) - where to download the PDF
// - htmlUrl: string (required) - the HTML link to copy/share
// - shareTitle: string (optional) - the title to use for sharing
// - style: CSS override (optional)

export default function ShareButton({
  pdfUrl,
  htmlUrl,
  shareTitle = "Check this out!",
  style = {},
}) {
  // Copy link handler
  const handleCopy = () => {
    navigator.clipboard.writeText(htmlUrl);
    // Optionally show a copied message here
  };

  // Email handler
  const handleMail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(htmlUrl)}`,
      "_blank"
    );
  };

  // Download handler
  const handleDownload = () => {
    window.open(pdfUrl, "_blank");
  };

  // "More" handler (optional: you could use Web Share API if supported)
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        url: htmlUrl
      });
    } else {
      // fallback: copy link
      handleCopy();
    }
  };

  // Clicking anywhere on the group opens a menu (optional: you can make it just do one action, or a menu)
  // For now, we'll just show the 4 icons as a group, but only handle click as a group
  // If you want a menu, you can add it later.

  // Styles
  const barHeight = 46;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        width: "100%",
        pointerEvents: "auto",
        position: "relative",
        ...style
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#181818",
          borderRadius: 8,
          padding: "7px 16px 7px 18px",
          gap: 14,
          boxShadow: "0 2px 14px #0006",
          cursor: "pointer",
          border: "1.5px solid #fff",
          minHeight: barHeight,
          minWidth: 185,
          transition: "box-shadow 0.18s, border 0.15s",
        }}
        tabIndex={0}
        aria-label="Share/download options"
        onClick={handleShare}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") handleShare();
        }}
        title="Share, download, or copy link"
      >
        {/* Download PDF */}
        <span
          style={{ display: "flex", alignItems: "center" }}
          title="Download PDF"
          onClick={e => { e.stopPropagation(); handleDownload(); }}
          tabIndex={-1}
        >
          <img
            src="/icons/share/download.svg"
            alt="Download PDF"
            style={{
              width: 28,
              height: 28,
              display: "block",
              background: "#000",
              borderRadius: 5
            }}
          />
        </span>
        {/* Email */}
        <span
          style={{ display: "flex", alignItems: "center" }}
          title="Share by Email"
          onClick={e => { e.stopPropagation(); handleMail(); }}
          tabIndex={-1}
        >
          <img
            src="/icons/share/mail.svg"
            alt="Email"
            style={{
              width: 28,
              height: 28,
              display: "block",
              background: "#000",
              borderRadius: 5
            }}
          />
        </span>
        {/* Copy Link */}
        <span
          style={{ display: "flex", alignItems: "center" }}
          title="Copy HTML Link"
          onClick={e => { e.stopPropagation(); handleCopy(); }}
          tabIndex={-1}
        >
          <img
            src="/icons/share/link.svg"
            alt="Copy Link"
            style={{
              width: 28,
              height: 28,
              display: "block",
              background: "#000",
              borderRadius: 5
            }}
          />
        </span>
        {/* More/Share */}
        <span
          style={{ display: "flex", alignItems: "center" }}
          title="Share"
          onClick={e => { e.stopPropagation(); handleShare(); }}
          tabIndex={-1}
        >
          <img
            src="/icons/share/share.svg"
            alt="Share"
            style={{
              width: 28,
              height: 28,
              display: "block",
              background: "#000",
              borderRadius: 5
            }}
          />
        </span>
        <span
          style={{
            color: "#fff",
            fontFamily: "coolvetica, sans-serif",
            fontSize: 16,
            fontWeight: 400,
            marginLeft: 18,
            letterSpacing: "0.03em",
            opacity: 0.64,
            userSelect: "none"
          }}
        >
          SHARE
        </span>
      </div>
    </div>
  );
}
