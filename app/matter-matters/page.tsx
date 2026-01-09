'use client';

import React, { useRef } from "react";
import PTableSection from "../../components/p-table-section";
import HeaderBar from "../../components/HeaderBar";

const IFRAME_WIDTH = 1366 + 16; // 16px fudge for scrollbar
const IFRAME_HEIGHT = 7452; // matches your HTML height exactly

export default function MatterMatters() {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const mainStyle: React.CSSProperties = {
        width: "100vw",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        background: "#fff",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 76,
    };

    const iframeContainerStyle: React.CSSProperties = {
        width: "100vw",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "#fff",
        margin: 0,
        padding: 0,
        boxShadow: "none",
    };

    const iframeWrapperStyle: React.CSSProperties = {
        width: IFRAME_WIDTH,
        height: IFRAME_HEIGHT,
        position: "relative",
        background: "#fff",
        margin: 0,
        padding: 0,
        boxShadow: "none",
        overflow: "visible",
        border: "none",
    };

    const iframeStyle: React.CSSProperties = {
        width: IFRAME_WIDTH,
        height: IFRAME_HEIGHT,
        border: "none",
        background: "#fff",
        display: "block",
        boxSizing: "content-box",
        boxShadow: "none",
        outline: "none",
        overflow: "visible",
    };

    const pTableRootStyle: React.CSSProperties = {
        margin: "0px 0 0 0",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
    };

    return (
        <>
            <HeaderBar fixedNav={true} />
            <main className="matter-matters-page" style={mainStyle}>
                <div style={iframeContainerStyle}>
                    <div style={iframeWrapperStyle}>
                        <iframe
                            ref={iframeRef}
                            src="/static/matter-matters/index.html"
                            title="Matter Matters — Studio Stewart"
                            width={IFRAME_WIDTH}
                            height={IFRAME_HEIGHT}
                            style={iframeStyle}
                            scrolling="yes"
                            allowFullScreen
                        />
                    </div>
                </div>
                <div id="hc-periodic-table-root" style={pTableRootStyle}>
                    <PTableSection />
                </div>
            </main>
        </>
    );
}
