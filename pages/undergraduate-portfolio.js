import PortfolioViewer from "../components/PortfolioViewer";

export default function UndergraduatePortfolioPage() {
  // Renders the PortfolioViewer which reads /portfolio/undergraduate/manifest.json
  // Update manifest.json to add/remove/reorder pages; no code changes needed.
  return (
    <div style={{ width: "100%", height: "100vh", background: "#fff" }}>
      <PortfolioViewer manifestUrl="/portfolio/undergraduate/manifest.json" />
    </div>
  );
}
