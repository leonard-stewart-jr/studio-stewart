import Head from "next/head";
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

  return (
    <>
      {useMobileViewer && (
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
          />
        </Head>
      )}

      {useMobileViewer ? (
        <MobilePortfolioViewer manifestUrl="/portfolio/undergraduate/manifest.json" />
      ) : (
        <PortfolioViewer manifestUrl="/portfolio/undergraduate/manifest.json" />
      )}
    </>
  );
}
