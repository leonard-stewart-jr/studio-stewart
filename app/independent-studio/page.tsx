'use client';

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import SectionTabs from "../../components/isp/section-tabs";
import BottomModeNav from "../../components/isp/bottommodenav";
import InfoModal from "../../components/isp/info-modal";

const GlobeSection = dynamic(() => import("../../components/isp/globe-section"), { ssr: false });

export default function IndependentStudio() {
    const [mainSection, setMainSection] = useState("history");
    const [activeHistory, setActiveHistory] = useState("world");
    const [modalData, setModalData] = useState(null);

    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        const prevHtmlOverflow = document.documentElement.style.overflow;
        const prevBodyHeight = document.body.style.height;
        const prevHtmlHeight = document.documentElement.style.height;

        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.body.style.height = "100vh";
        document.documentElement.style.height = "100vh";

        return () => {
            document.body.style.overflow = prevOverflow;
            document.documentElement.style.overflow = prevHtmlOverflow;
            document.body.style.height = prevBodyHeight;
            document.documentElement.style.height = prevHtmlHeight;
        };
    }, []);

    const [sidePadding, setSidePadding] = useState(80);
    useEffect(() => {
        const updatePadding = () => {
            setSidePadding(window.innerWidth < 800 ? 24 : 80);
        };
        updatePadding();
        window.addEventListener("resize", updatePadding);
        return () => window.removeEventListener("resize", updatePadding);
    }, []);

    return (
        <>
            <div
                className="nav-card nav-card-mid"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxSizing: "border-box"
                }}
            >
                <div style={{ flex: "0 0 auto", width: 88, minWidth: 88 }} />
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <SectionTabs
                        activeSection={mainSection}
                        setActiveSection={setMainSection}
                    />
                </div>
                <div style={{ flex: "0 0 auto", width: 66, minWidth: 66 }} />
            </div>

            {mainSection === "history" && (
                <div
                    style={{
                        width: "100vw",
                        boxSizing: "border-box",
                        paddingLeft: sidePadding,
                        paddingRight: sidePadding,
                        background: "#f9f9f7",
                        minHeight: 0,
                        minWidth: 0,
                    }}
                >
                    <section className="isp-globe-section">
                        <GlobeSection mode={activeHistory} onMarkerClick={setModalData} />
                    </section>
                </div>
            )}

            {mainSection === "future" && (
                <div
                    style={{
                        minHeight: 500,
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 32,
                        color: "#192d4b",
                        fontWeight: 700,
                        letterSpacing: ".02em",
                        opacity: 0.7,
                    }}
                >
                    FUTURE CONTENT COMING SOON
                </div>
            )}

            <InfoModal
                open={!!modalData}
                onClose={() => setModalData(null)}
                marker={modalData}
            />

            {mainSection === "history" && (
                <BottomModeNav active={activeHistory} onChange={setActiveHistory} sidePadding={sidePadding} />
            )}
        </>
    );
}
