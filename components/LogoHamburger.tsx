'use client';

import { useState } from "react";

interface LogoHamburgerProps {
    logoSize?: number;
    onOpenSidebar: () => void;
    color?: string;
    sidebarPaddingLeft?: number;
}

export default function LogoHamburger({
    logoSize = 66,
    onOpenSidebar,
    color = "#181818",
}: LogoHamburgerProps) {
    const [hovered, setHovered] = useState(false);

    const triangle = [
        { x: 30, y: 96 },
        { x: 60, y: 34 },
        { x: 90, y: 96 },
    ];
    const viewBoxWidth = 120;
    const viewBoxHeight = 120;
    const lineCount = 4;
    const minT = 0.04;
    const maxT = 0.96;
    const yNudge = 4;
    const lines = [];
    for (let i = 0; i < lineCount; ++i) {
        const t = minT + (i / (lineCount - 1)) * (maxT - minT);
        const y = triangle[1].y + t * (triangle[0].y - triangle[1].y) + yNudge;
        const leftX = triangle[1].x + t * (triangle[0].x - triangle[1].x);
        const rightX = triangle[1].x + t * (triangle[2].x - triangle[1].x);
        lines.push({ x1: leftX, x2: rightX, y });
    }
    const lineThickness = 6;

    return (
        <div
            className="logo-hamburger-wrap"
            style={{
                position: "relative",
                width: logoSize,
                height: logoSize,
                cursor: "pointer",
                zIndex: 1200,
                userSelect: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            onClick={onOpenSidebar}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            tabIndex={0}
            onKeyDown={e => {
                if (onOpenSidebar && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onOpenSidebar();
                }
            }}
            title="Open menu"
            aria-label="Open menu"
            role="button"
        >
            <img
                src="/assets/logo-mark-only.svg"
                alt="Studio Stewart Logo"
                // @ts-ignore
                draggable={false}
                style={{
                    width: logoSize,
                    height: logoSize,
                    position: "absolute",
                    left: 0,
                    top: 0,
                    opacity: hovered ? 0 : 1,
                    transition: "opacity 0.18s",
                    pointerEvents: "none",
                    userSelect: "none",
                }}
            />

            <div
                className="hamburger-svg"
                style={{
                    opacity: hovered ? 1 : 0,
                    transition: "opacity 0.18s",
                    width: logoSize,
                    height: logoSize,
                    position: "absolute",
                    left: 0,
                    top: 0,
                    pointerEvents: "none",
                }}
            >
                <svg
                    width={logoSize}
                    height={logoSize}
                    viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {lines.map((line, i) => (
                        <rect
                            key={i}
                            x={line.x1}
                            y={line.y - lineThickness / 2}
                            width={line.x2 - line.x1}
                            height={lineThickness}
                            fill={color}
                            rx={2}
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
}
