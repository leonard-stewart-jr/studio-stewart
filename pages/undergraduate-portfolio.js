import PdfBookViewer from "../components/PdfBookViewer";

export default function UndergraduatePortfolioPage() {
  return (
    <main style={{ padding: "96px 16px 32px 16px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <h1 style={{ margin: "0 0 8px 0", fontSize: 28, lineHeight: 1.2 }}>
          Undergraduate Portfolio
        </h1>
        <div style={{ color: "#7d7d78", marginBottom: 16 }}>2020–2024</div>

        <PdfBookViewer
          file="/portfolio/undergraduate-portfolio.pdf"
          title="UNDERGRADUATE PORTFOLIO (2020–2024)"
          spreadsMode={true}
        />
      </div>
    </main>
  );
}
