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

  useEffect(() => {
    if (!useMobileViewer || typeof document === "undefined") return undefined;

    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyHeight = body.style.height;
    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlHeight = html.style.height;

    body.style.overflow = "hidden";
    body.style.height = "100dvh";
    html.style.overflow = "hidden";
    html.style.height = "100dvh";

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.height = previousBodyHeight;
      html.style.overflow = previousHtmlOverflow;
      html.style.height = previousHtmlHeight;
    };
  }, [useMobileViewer]);

  return (
    <>
      {useMobileViewer && (
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, viewport-fit=cover"
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
