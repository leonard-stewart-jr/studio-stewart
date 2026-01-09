'use client';

import { useEffect, useState } from "react";

interface SplashScreenProps {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    const [slideOut, setSlideOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setSlideOut(true), 6000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (slideOut) {
            const timer = setTimeout(onFinish, 600);
            return () => clearTimeout(timer);
        }
    }, [slideOut, onFinish]);

    function handleClick() {
        if (!slideOut) setSlideOut(true);
    }

    const containerStyle: React.CSSProperties = {
        position: "fixed",
        inset: 0,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        transition: "transform 0.6s cubic-bezier(.75,-0.01,.29,1.01), opacity 0.6s",
        transform: slideOut ? "translateY(-100vh)" : "translateY(0)",
        opacity: slideOut ? 0 : 1,
        pointerEvents: slideOut ? "none" : "auto",
        cursor: "pointer",
        fontFamily: "'Futura', 'Open Sans', Arial, sans-serif",
        overflow: "hidden",
    };

    const logoContainerStyle: React.CSSProperties = {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
        pointerEvents: "none",
    };

    const logoStyle: React.CSSProperties = {
        display: "block",
        margin: "0 auto",
        maxWidth: "80vw",
        maxHeight: "80vh",
        width: "auto",
        height: "auto",
        filter: "grayscale(1)",
        objectFit: "contain",
        pointerEvents: "none",
        userSelect: "none",
    };

    const textContainerStyle: React.CSSProperties = {
        position: "absolute",
        bottom: 48,
        left: 0,
        width: "100vw",
        textAlign: "center",
        zIndex: 2,
        pointerEvents: "none",
        fontFamily: "'Futura', 'Open Sans', Arial, sans-serif",
    };

    const welcomeTextStyle: React.CSSProperties = {
        display: "block",
        color: "#181818",
        fontWeight: 800,
        fontSize: 46,
        textTransform: "uppercase",
        letterSpacing: "0.09em",
        fontFamily: "'Futura', 'Open Sans', Arial, sans-serif",
    };

    return (
        <div
            onClick={handleClick}
            style={containerStyle}
            title="Click or tap to skip"
        >
            <div style={logoContainerStyle}>
                <img
                    src="/logo.png"
                    alt="Logo"
                    style={logoStyle}
                    // @ts-ignore
                    draggable={false}
                />
            </div>
            <div style={textContainerStyle}>
                <span style={welcomeTextStyle}>
                    WELCOME
                </span>
            </div>
        </div>
    );
}
