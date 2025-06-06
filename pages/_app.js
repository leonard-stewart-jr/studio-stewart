import "../styles/globals.css";
import { useEffect, useState } from "react";
import SplashScreen from "../components/SplashScreen";
import Layout from "../components/Layout";
import "leaflet/dist/leaflet.css";
import { LayoutGroup } from "framer-motion"; // Use LayoutGroup for Framer Motion v7+

export default function MyApp({ Component, pageProps }) {
  const [showSplash, setShowSplash] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Only run on the client
    const splashAlreadyShown = sessionStorage.getItem("splashShown");
    setShowSplash(!splashAlreadyShown);
    setReady(true);
  }, []);

  useEffect(() => {
    if (showSplash) {
      sessionStorage.setItem("splashShown", "true");
    }
  }, [showSplash]);

  // Wait until we know if splash should be shown (prevents SSR/client mismatch)
  if (!ready) {
    return null; // Optionally: return a static splash or loading indicator
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Wrap all pages with LayoutGroup and Layout
  return (
    <LayoutGroup>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </LayoutGroup>
  );
}
