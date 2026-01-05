import PdfBookViewer from "./PdfBookViewer";

export default function PdfBookModal({
  open,
  onClose,
  file,
  title = "UNDERGRADUATE PORTFOLIO (2020–2024)",
  spreadsMode = true
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(1200px, 96vw)",
          height: "auto",
          maxHeight: "92vh",
          background: "#fff",
          boxShadow: "0 10px 40px rgba(0,0,0,0.28)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <PdfBookViewer
          file={file}
          title={title}
          spreadsMode={spreadsMode}
          onRequestClose={onClose}
          style={{ maxHeight: "92vh" }}
        />
      </div>
    </div>
  );
}
