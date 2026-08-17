import { useEffect } from "react";
import PortfolioViewer from "../components/PortfolioViewer";

export default function UndergraduatePortfolioPage() {
  useEffect(() => {
    let frame = null;

    const alignFullscreenControl = () => {
      if (frame) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const shell = document.querySelector(".portfolio-viewer-shell");
        if (!shell) return;

        const fullscreenButton = shell.querySelector(
          'button[aria-label="Enter fullscreen"], button[aria-label="Exit fullscreen"]'
        );
        if (!fullscreenButton) return;

        const fullscreenWrap = fullscreenButton.parentElement;
        if (!fullscreenWrap) return;

        const toolbarButton =
          shell.querySelector('button[aria-label="Toggle fit mode"]') ||
          shell.querySelector('button[aria-label="First page"]');
        const toolbar = toolbarButton?.parentElement;
        if (!toolbar) return;

        const toolbarRect = toolbar.getBoundingClientRect();
        const gap = 6;

        fullscreenWrap.style.left = "auto";
        fullscreenWrap.style.transform = "none";
        fullscreenWrap.style.right = `${Math.max(0, window.innerWidth - toolbarRect.left + gap)}px`;
      });
    };

    alignFullscreenControl();

    const observer = new MutationObserver(alignFullscreenControl);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-label"]
    });

    window.addEventListener("resize", alignFullscreenControl);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", alignFullscreenControl);
    };
  }, []);

  return <PortfolioViewer manifestUrl="/portfolio/undergraduate/manifest.json" />;
}
