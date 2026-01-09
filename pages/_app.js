import "../styles/globals.css";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { LayoutGroup } from "framer-motion";
import SplashScreen from "../components/SplashScreen";
import Layout from "../components/Layout";

export default function MyApp({ Component, pageProps }) {
  const [showSplash, setShowSplash] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const splashAlreadyShown =
      typeof window !== "undefined" ? sessionStorage.getItem("splashShown") : null;
    setShowSplash(!splashAlreadyShown);
    setReady(true);
  }, []);

  useEffect(() => {
    if (showSplash && typeof window !== "undefined") {
      sessionStorage.setItem("splashShown", "true");
    }
  }, [showSplash]);

  if (!ready) return null;

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  return (
    <LayoutGroup>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </LayoutGroup>
  );
}