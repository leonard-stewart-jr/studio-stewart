import "../styles/global.css"; 
import { useEffect, useState } from "react";
import SplashScreen from "../components/SplashScreen";

export default function MyApp({ Component, pageProps }) {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!sessionStorage.getItem("splashShown")) {
        setShowSplash(true);
        sessionStorage.setItem("splashShown", "true");
      }
    }
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return <Component {...pageProps} />;
}
