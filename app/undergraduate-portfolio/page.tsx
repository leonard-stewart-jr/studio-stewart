'use client';

import PortfolioViewer from "../../components/PortfolioViewer";

export default function UndergraduatePortfolioPage() {
    return (
        <div style={{ width: "100%", height: "100vh", background: "#fff" }}>
            <PortfolioViewer manifestUrl="/portfolio/undergraduate/manifest.json" />
        </div>
    );
}
