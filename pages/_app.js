import "../styles/globals.css";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { LayoutGroup } from "framer-motion";
import SplashScreen from "../components/SplashScreen";
import Layout from "../components/Layout";

export default function MyApp({ Component, pageProps }) {
  const [showSplash, setShowSplash] = useState(false);
  const [ready, setReady] = useState(false);

  // Client-only: decide whether to show splash and avoid hydration mismatch
  useEffect(() => {
    const splashAlreadyShown = typeof window !== "undefined"
      ? sessionStorage.getItem("splashShown")
      : null;
    setShowSplash(!splashAlreadyShown);
    setReady(true);
  }, []);

  // Mark splash as shown (once per session)
  useEffect(() => {
    if (showSplash && typeof window !== "undefined") {
      sessionStorage.setItem("splashShown", "true");
    }
  }, [showSplash]);

  // Wait for client readiness to avoid SSR/client mismatch
  if (!ready) {
    return null;
  }

  // Show the splash once per session; SplashScreen should call onDone when finished
  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  // Normal app shell with motion layout and global Layout
  return (
    <LayoutGroup>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </LayoutGroup>
  );
}
