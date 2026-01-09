'use client';

import { useEffect, useState } from "react";
import SplashScreen from "./SplashScreen";
import Layout from "./Layout";
import { LayoutGroup } from "framer-motion";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [showSplash, setShowSplash] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const splashAlreadyShown = sessionStorage.getItem("splashShown");
        setShowSplash(!splashAlreadyShown);
        setReady(true);
    }, []);

    useEffect(() => {
        if (showSplash) {
            sessionStorage.setItem("splashShown", "true");
        }
    }, [showSplash]);

    if (!ready) {
        return null;
    }

    if (showSplash) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    return (
        <LayoutGroup>
            <Layout>
                {children}
            </Layout>
        </LayoutGroup>
    );
}
