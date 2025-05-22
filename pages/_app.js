import "../styles/globals.css";
import { useEffect, useState } from "react";
import SplashScreen from "../components/SplashScreen";
import Layout from "../components/Layout";
import { AnimateSharedLayout } from "framer-motion"; // For Framer Motion v6/v5
// If using Framer Motion v7+, import { LayoutGroup } from "framer-motion" instead

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

  // Wrap all pages with AnimateSharedLayout and Layout
  return (
    <AnimateSharedLayout>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AnimateSharedLayout>
  );
}
