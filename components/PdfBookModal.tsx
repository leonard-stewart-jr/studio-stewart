'use client';

import React, { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

interface PdfBookModalProps {
    open: boolean;
    onClose: () => void;
    file: string;
    title?: string;
    spreadsMode?: boolean;
}

export default function PdfBookModal({ open, onClose, file, title, spreadsMode = true }: PdfBookModalProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [containerWidth, setContainerWidth] = useState(1000);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const ver = pdfjs.version || "latest";
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${ver}/build/pdf.worker.min.mjs`;
    }, []);

    const resolvedFile = useMemo(() => {
        if (typeof window === "undefined") return file || "";
        if (!file) return "";
        const path = file.startsWith("/") ? file : `/${file}`;
        return `${window.location.origin}${path}`;
    }, [file]);

    useEffect(() => {
        function handleResize() {
            const w = typeof window !== "undefined" ? window.innerWidth : 1200;
            setContainerWidth(Math.max(320, Math.min(1200, w - 160)));
        }
        handleResize();
        if (open) {
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, [open]);

    function onPdfLoadSuccess({ numPages: np }: { numPages: number }) {
        setNumPages(np);
        setLoadError(null);
    }

    function onPdfLoadError(err: Error) {
        console.error("PDF load error (modal):", err);
        setLoadError(err?.message || "Failed to load PDF.");
    }

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title || "PDF Viewer"}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2000,
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20
            }}
            onClick={onClose}
        >
            <div
                className="mesopotamia-scrollbar"
                style={{
                    background: "#fff",
                    color: "#181818",
                    width: "90vw",
                    maxWidth: 1400,
                    maxHeight: "85vh",
                    borderRadius: 8,
                    boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
                    overflowY: "auto",
                    overflowX: "hidden",
                    position: "relative",
                    padding: "18px 24px 28px 24px"
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    aria-label="Close PDF"
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        background: "none",
                        border: "none",
                        color: "#181818",
                        fontSize: 28,
                        width: 42,
                        height: 42,
                        cursor: "pointer"
                    }}
                >
                    ×
                </button>

                {title && (
                    <h2 style={{ margin: "10px 0 16px 0", fontFamily: "coolvetica, sans-serif" }}>
                        {title}
                    </h2>
                )}

                {!resolvedFile ? (
                    <p style={{ margin: "24px 0" }}>No PDF file provided.</p>
                ) : (
                    <div style={{ width: containerWidth, margin: "0 auto" }}>
                        {loadError && (
                            <div style={{ color: "#b00020", marginBottom: 12, fontSize: 14 }}>
                                Failed to load PDF. Please refresh the page. If it persists, check the browser console for details.
                            </div>
                        )}
                        <Document
                            file={{ url: resolvedFile }}
                            onLoadSuccess={onPdfLoadSuccess}
                            onLoadError={onPdfLoadError}
                            loading={<p>Loading PDF…</p>}
                            error={<p>Failed to load PDF.</p>}
                        >
                            {numPages &&
                                (spreadsMode
                                    ? Array.from({ length: Math.ceil(numPages / 2) }, (_, i) => {
                                        const leftPage = i * 2 + 1;
                                        const rightPage = leftPage + 1;
                                        const spreadGap = 24;
                                        const pageW = Math.floor((containerWidth - spreadGap) / 2);
                                        return (
                                            <div
                                                key={`spread-${i}`}
                                                style={{
                                                    display: "flex",
                                                    gap: spreadGap,
                                                    alignItems: "flex-start",
                                                    justifyContent: "center",
                                                    marginBottom: 16
                                                }}
                                            >
                                                <Page
                                                    pageNumber={leftPage}
                                                    width={pageW}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                />
                                                {rightPage <= numPages ? (
                                                    <Page
                                                        pageNumber={rightPage}
                                                        width={pageW}
                                                        renderTextLayer={false}
                                                        renderAnnotationLayer={false}
                                                    />
                                                ) : null}
                                            </div>
                                        );
                                    })
                                    : Array.from({ length: numPages }, (_, i) => (
                                        <div key={`page-${i}`} style={{ marginBottom: 16 }}>
                                            <Page
                                                pageNumber={i + 1}
                                                width={containerWidth}
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                            />
                                        </div>
                                    )))}
                        </Document>
                    </div>
                )}
            </div>
        </div>
    );
}
