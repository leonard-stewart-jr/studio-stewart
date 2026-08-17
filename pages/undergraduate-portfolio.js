import { useEffect, useState } from "react";
import PortfolioViewer from "../components/PortfolioViewer";
import MobilePortfolioViewer from "../components/MobilePortfolioViewer";

export default function UndergraduatePortfolioPage() {
  const [useMobileViewer, setUseMobileViewer] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const coarsePointer = window.matchMedia
      ? window.matchMedia("(pointer: coarse)")
      : null;

    const updateViewer = () => {
      const touchCapable = coarsePointer
        ? coarsePointer.matches
        : ("ontouchstart" in window || navigator.maxTouchPoints > 0);

      setUseMobileViewer(Boolean(touchCapable && window.innerWidth <= 1024));
    };

    updateViewer();
    window.addEventListener("resize", updateViewer);

    if (coarsePointer && typeof coarsePointer.addEventListener === "function") {
      coarsePointer.addEventListener("change", updateViewer);
    }

    return () => {
      window.removeEventListener("resize", updateViewer);
      if (coarsePointer && typeof coarsePointer.removeEventListener === "function") {
        coarsePointer.removeEventListener("change", updateViewer);
      }
    };
  }, []);

  if (useMobileViewer) {
    return <MobilePortfolioViewer manifestUrl="/portfolio/undergraduate/manifest.json" />;
  }

  return <PortfolioViewer manifestUrl="/portfolio/undergraduate/manifest.json" />;
}
