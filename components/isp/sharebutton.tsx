'use client';

import React, { useState } from "react";

const ICONS = {
    upload: "/icons/share/upload.svg",
    linkedin: "/icons/share/linkedin.svg",
    reddit: "/icons/share/reddit.svg",
    download: "/icons/share/download.svg",
};

function openInNewTab(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
}

interface ShareButtonProps {
    pdfUrl: string;
    htmlUrl: string;
    shareTitle: string;
    style?: React.CSSProperties;
}

export default function ShareButton({ pdfUrl, htmlUrl, shareTitle, style }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(htmlUrl)}`;
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(htmlUrl)}&title=${encodeURIComponent(shareTitle)}`;

    const handleUploadShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    url: htmlUrl,
                });
            } catch (err) {
            }
        } else {
            try {
                await navigator.clipboard.writeText(htmlUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            } catch {
                window.prompt("Copy and share this link:", htmlUrl);
            }
        }
    };

    const handleDownload = () => {
        if (pdfUrl) {
            openInNewTab(pdfUrl);
        }
    };

    const iconButtonStyle: React.CSSProperties = {
        background: "transparent",
        border: "none",
        borderRadius: 4,
        padding: 2,
        cursor: "pointer",
        width: 34,
        height: 34,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        transition: "box-shadow 0.13s, background 0.13s",
    };

    const iconImgStyle: React.CSSProperties = {
        width: 28,
        height: 28,
        display: "block",
        pointerEvents: "none",
    };

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                ...style,
            }}
        >
            <span
                style={{
                    fontFamily: "'coolvetica', 'Open Sans', sans-serif",
                    fontWeight: 400,
                    fontStretch: "condensed",
                    fontSize: 14,
                    color: "rgba(0,0,0,0.5)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    textAlign: "right",
                    display: "block",
                    marginBottom: 7,
                    userSelect: "none",
                    lineHeight: 1.17,
                    transform: "translateX(-4px)",
                }}
            >
                Share
            </span>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 4,
                    background: "none",
                    borderRadius: 8,
                    padding: 0,
                    alignItems: "center",
                    justifyContent: "flex-end",
                }}
                aria-label="Share or download this project"
            >
                <button
                    onClick={handleUploadShare}
                    style={iconButtonStyle}
                    aria-label="Share via apps"
                    title="Share via apps"
                    type="button"
                >
                    <img src={ICONS.upload} alt="" style={iconImgStyle} />
                    {copied && (
                        <span
                            style={{
                                position: "absolute",
                                bottom: "110%",
                                left: "50%",
                                transform: "translateX(-50%)",
                                background: "#e6dbb9",
                                color: "#222",
                                fontSize: 13,
                                borderRadius: 6,
                                padding: "3px 10px",
                                whiteSpace: "nowrap",
                                pointerEvents: "none",
                                zIndex: 99,
                            }}
                        >
                            Copied!
                        </span>
                    )}
                </button>
                <button
                    onClick={() => openInNewTab(linkedInUrl)}
                    style={iconButtonStyle}
                    aria-label="Share on LinkedIn"
                    title="Share on LinkedIn"
                    type="button"
                >
                    <img src={ICONS.linkedin} alt="" style={iconImgStyle} />
                </button>
                <button
                    onClick={() => openInNewTab(redditUrl)}
                    style={iconButtonStyle}
                    aria-label="Share on Reddit"
                    title="Share on Reddit"
                    type="button"
                >
                    <img src={ICONS.reddit} alt="" style={iconImgStyle} />
                </button>
                <button
                    onClick={handleDownload}
                    style={iconButtonStyle}
                    aria-label="Download PDF"
                    title="Download PDF"
                    type="button"
                >
                    <img src={ICONS.download} alt="" style={iconImgStyle} />
                </button>
            </div>
        </div>
    );
}
