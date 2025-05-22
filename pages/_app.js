import "../styles/globals.css";
import { useEffect, useState } from "react";
import SplashScreen from "../components/SplashScreen";

export default function MyApp({ Component, pageProps }) {
  const [showSplash, setShowSplash] = useState(() => {
    // Prevent flash of main content before splash on first client render
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("splashShown");
    }
    return false; // On server, don't show splash
  });

  useEffect(() => {
    if (showSplash && typeof window !== "undefined") {
      sessionStorage.setItem("splashShown", "true");
    }
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return <Component {...pageProps} />;
}
