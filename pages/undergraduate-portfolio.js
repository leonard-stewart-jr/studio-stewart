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
    const previousBodyWidth = body.style.width;
    const previousBodyPosition = body.style.position;
    const previousBodyInset = body.style.inset;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlHeight = html.style.height;
    const previousHtmlWidth = html.style.width;
    const previousHtmlOverscroll = html.style.overscrollBehavior;

    // Keep the portfolio page pinned to the layout viewport. Safari can pan the
    // document itself during a native pinch even when overflow is hidden, which
    // is what creates the large blank area below/right of the viewer.
    body.style.overflow = "hidden";
    body.style.height = "100dvh";
    body.style.width = "100vw";
    body.style.position = "fixed";
    body.style.inset = "0";
    body.style.overscrollBehavior = "none";
    html.style.overflow = "hidden";
    html.style.height = "100dvh";
    html.style.width = "100%";
    html.style.overscrollBehavior = "none";

    // The mobile viewer owns pinch zoom. Prevent Safari from applying the same
    // gesture to the whole webpage, but do not stop propagation so the viewer's
    // non-passive gesture/touch handlers can still scale the portfolio itself.
    const preventNativeGesture = (event) => {
      if (event.cancelable) event.preventDefault();
    };

    const preventNativePinch = (event) => {
      if (event.touches?.length > 1 && event.cancelable) {
        event.preventDefault();
      }
    };

    document.addEventListener("gesturestart", preventNativeGesture, {
      passive: false,
      capture: true,
    });
    document.addEventListener("gesturechange", preventNativeGesture, {
      passive: false,
      capture: true,
    });
    document.addEventListener("gestureend", preventNativeGesture, {
      passive: false,
      capture: true,
    });
    document.addEventListener("touchmove", preventNativePinch, {
      passive: false,
      capture: true,
    });

    return () => {
      document.removeEventListener("gesturestart", preventNativeGesture, true);
      document.removeEventListener("gesturechange", preventNativeGesture, true);
      document.removeEventListener("gestureend", preventNativeGesture, true);
      document.removeEventListener("touchmove", preventNativePinch, true);

      body.style.overflow = previousBodyOverflow;
      body.style.height = previousBodyHeight;
      body.style.width = previousBodyWidth;
      body.style.position = previousBodyPosition;
      body.style.inset = previousBodyInset;
      body.style.overscrollBehavior = previousBodyOverscroll;
      html.style.overflow = previousHtmlOverflow;
      html.style.height = previousHtmlHeight;
      html.style.width = previousHtmlWidth;
      html.style.overscrollBehavior = previousHtmlOverscroll;
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
