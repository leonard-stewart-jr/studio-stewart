import React, { useState } from "react";

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
  const [copied, setCopied] = useState(false);

  // Copy link handler
  const handleCopy = e => {
    e.stopPropagation();
    navigator.clipboard.writeText(htmlUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // Email handler
  const handleMail = e => {
    e.stopPropagation();
    window.open(
      `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(htmlUrl)}`,
      "_blank"
    );
  };

  // Download handler
  const handleDownload = e => {
    e.stopPropagation();
    window.open(pdfUrl, "_blank");
  };

  // "More" handler (Web Share API or fallback to copy)
  const handleShare = e => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        url: htmlUrl
      });
    } else {
      handleCopy(e);
    }
  };

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
        title="Share, download, or copy link"
      >
        {/* Download PDF */}
        <span
          style={{ display: "flex", alignItems: "center" }}
          title="Download PDF"
          onClick={handleDownload}
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
          onClick={handleMail}
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
          style={{ display: "flex", alignItems: "center", position: "relative" }}
          title={copied ? "Copied!" : "Copy HTML Link"}
          onClick={handleCopy}
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
          {copied && (
            <span
              style={{
                position: "absolute",
                top: -28,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#222",
                color: "#fff",
                borderRadius: 6,
                padding: "2px 10px",
                fontSize: 13,
                opacity: 0.93,
                pointerEvents: "none",
                zIndex: 99,
                whiteSpace: "nowrap"
              }}
            >
              Copied!
            </span>
          )}
        </span>
        {/* More/Share */}
        <span
          style={{ display: "flex", alignItems: "center" }}
          title="Share"
          onClick={handleShare}
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
