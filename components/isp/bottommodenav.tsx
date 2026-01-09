'use client';

import React, { useState, useEffect } from "react";

const MODE_GRADIENTS: Record<string, { stops: { offset: string; color: string }[]; stroke: string }> = {
    world: {
        stops: [
            { offset: "0%", color: "#A3B18A" },
            { offset: "40%", color: "#bcb08b" },
            { offset: "80%", color: "#865439" },
            { offset: "100%", color: "#D6C08E" }
        ],
        stroke: "#4C3B26"
    },
    usa: {
        stops: [
            { offset: "0%", color: "#C32B2B" },
            { offset: "40%", color: "#F1F1F1" },
            { offset: "100%", color: "#2E3A87" }
        ],
        stroke: "#222"
    },
    sd: {
        stops: [
            { offset: "0%", color: "#FFE066" },
            { offset: "40%", color: "#A3DAE6" },
            { offset: "80%", color: "#91C499" },
            { offset: "100%", color: "#E6CBA8" }
        ],
        stroke: "#4B3920"
    }
};

const MODE_LABELS: Record<string, string> = {
    world: "WORLD",
    usa: "UNITED STATES",
    sd: "SOUTH DAKOTA"
};

const NAVBAR_HEIGHT = 76;

interface BottomModeNavProps {
    active: string;
    onChange: (mode: string) => void;
    sidePadding?: number;
}

export default function BottomModeNav({ active, onChange, sidePadding }: BottomModeNavProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [internalSidePadding, setInternalSidePadding] = useState(80);

    useEffect(() => {
        const update = () => {
            setIsMobile(window.innerWidth < 700);
            setInternalSidePadding(window.innerWidth < 800 ? 24 : 80);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const leftPad = typeof sidePadding === "number" ? sidePadding : internalSidePadding;

    const fontSize = isMobile ? 27 : 40;
    const labelValues = Object.values(MODE_LABELS);
    const maxLabelLength = Math.max(...labelValues.map(label => label.length));
    const approxCharWidth = fontSize * 0.68;
    const svgWidth = Math.ceil(maxLabelLength * approxCharWidth) + 24;
    const svgHeight = Math.ceil(fontSize * 1.39);

    const gap = (svgHeight * 2) + 50;

    const activeGlow = "0 0 54px 12px #e6dbb9cc, 0 0 12px 6px #fff";
    const activeScale = 1.18;
    const inactiveScale = 1;

    const modes = ["world", "usa", "sd"];

    return (
        <nav
            aria-label="View mode switcher"
            style={{
                position: "fixed",
                left: leftPad,
                top: NAVBAR_HEIGHT,
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                width: svgWidth,
                zIndex: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                background: "transparent",
                pointerEvents: "auto",
                boxSizing: "border-box",
                overflow: "visible"
            }}
        >
            {modes.map((mode, idx) => {
                const gradientId = `mode-gradient-${mode}`;
                const { stops, stroke } = MODE_GRADIENTS[mode];
                const label = MODE_LABELS[mode];
                const isActive = active === mode;

                return (
                    <React.Fragment key={mode}>
                        <button
                            aria-label={label}
                            type="button"
                            onClick={() => onChange(mode)}
                            tabIndex={0}
                            style={{
                                background: "none",
                                border: "none",
                                outline: "none",
                                boxShadow: "none",
                                padding: 0,
                                margin: 0,
                                cursor: isActive ? "default" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                width: svgWidth,
                                height: svgHeight,
                                transition: "transform 0.18s, filter 0.18s",
                                opacity: isActive ? 1 : 0.91,
                                pointerEvents: isActive ? "none" : "auto",
                                userSelect: "none"
                            } as React.CSSProperties}
                            disabled={isActive}
                        >
                            <svg
                                width={svgWidth}
                                height={svgHeight}
                                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                                style={{
                                    display: "block",
                                    margin: 0,
                                    overflow: "visible"
                                }}
                                aria-hidden="true"
                                // @ts-ignore
                                focusable="false"
                            >
                                <defs>
                                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                                        {stops.map((stop, i) => (
                                            <stop key={i} offset={stop.offset} stopColor={stop.color} />
                                        ))}
                                    </linearGradient>
                                </defs>
                                <text
                                    x={0}
                                    y={svgHeight / 2 + fontSize / 2.8}
                                    textAnchor="start"
                                    dominantBaseline="middle"
                                    fontFamily="'coolvetica', 'Bungee Shade', Arial, sans-serif"
                                    fontSize={fontSize}
                                    fontWeight={700}
                                    letterSpacing="0.055em"
                                    style={{
                                        fill: `url(#${gradientId})`,
                                        stroke: stroke,
                                        strokeWidth: isActive ? 3.5 : 2.5,
                                        paintOrder: "stroke fill",
                                        filter: isActive
                                            ? `drop-shadow(${activeGlow})`
                                            : undefined,
                                        transition: "stroke-width 0.14s, filter 0.18s, font-size 0.18s, transform 0.18s",
                                        transform: `scale(${isActive ? activeScale : inactiveScale})`,
                                    } as React.CSSProperties}
                                >
                                    {label}
                                </text>
                            </svg>
                        </button>
                        {idx < modes.length - 1 && <div style={{ height: gap }} />}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
