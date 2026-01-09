'use client';

import dynamic from "next/dynamic";
import { useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import {
    loadPinModel,
    orientPin,
    latLngAltToVec3,
    getPinModel,
    positionPin,
    getPinPalette,
    getPaletteAssignments,
    loadFlagModel,
    getFlagModel
} from "./modal/pin-utils";

import globeLocations from "../../data/globe-locations";
import usaLocations from "../../data/usa-locations";
import sdEvents from "../../data/sd-events";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const NORMAL_PIN_SCALE = 9 * 1.5;
const DOT_ALTITUDE = 0.012;
const LONDON_CLUSTER_GROUP = "london";
const GLOBE_IMAGES: Record<string, string> = {
    world: "/images/globe/world-hd.jpg",
    usa: "/images/globe/usa-hd.jpg",
    sd: "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
};
const WORLD_PIN_COLORS = [
    "#906c5c", "#cc853e", "#3B3A30", "#bd9778", "#b6b09a", "#7e6651",
    "#7C6F57", "#A3B18A", "#A0522D", "#C19A6B", "#8a451f"
];

function toRoman(num: number): string {
    const map: [number, string][] = [
        [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
        [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
        [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
    ];
    let result = "";
    for (let [n, sym] of map) {
        while (num >= n) {
            result += sym;
            num -= n;
        }
    }
    return result;
}

function getLondonMarkers(allLocations: any[]) {
    return allLocations.filter((m) => m.clusterGroup === LONDON_CLUSTER_GROUP);
}

function getNonLondonMarkers(allLocations: any[]) {
    return allLocations.filter((m) => m.clusterGroup !== LONDON_CLUSTER_GROUP && !m.clusterExpand);
}

function getInitialPointOfView(mode: string) {
    if (mode === "usa" || mode === "world") {
        return { lat: 39, lng: -98, altitude: 1.18 };
    } else if (mode === "sd") {
        return { lat: 44, lng: -100, altitude: 1.5 };
    }
    return { lat: 39, lng: -98, altitude: 1.18 };
}

interface GlobeSectionProps {
    onMarkerClick: (marker: any) => void;
    mode?: "world" | "usa" | "sd";
}

export default function GlobeSection({ onMarkerClick, mode = "world" }: GlobeSectionProps) {
    const data = mode === "world" ? globeLocations : mode === "usa" ? usaLocations : sdEvents;
    const palette = useMemo(() => getPinPalette(mode), [mode]);
    const globeImageUrl = GLOBE_IMAGES[mode];

    const globeEl = useRef<any>();
    const setGlobeRef = (instance: any) => { globeEl.current = instance; };

    const [hovered, setHovered] = useState<any>(null);
    const [londonExpanded, setLondonExpanded] = useState(false);
    const [pinReady, setPinReady] = useState(false);
    const [flagReady, setFlagReady] = useState(false);
    const [globeIsReady, setGlobeIsReady] = useState(false);

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handleResize = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < 800);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        let m = true;
        loadPinModel().then(() => { if (m) setPinReady(true); });
        return () => { m = false; };
    }, []);

    useEffect(() => {
        let m = true;
        loadFlagModel().then(() => { if (m) setFlagReady(true); });
        return () => { m = false; };
    }, []);

    const colorAssignments = useMemo(() => {
        if (mode === "world") {
            const arr = [];
            for (let i = 0; i < data.length; i++) {
                if (i < WORLD_PIN_COLORS.length) arr.push(WORLD_PIN_COLORS[i]);
                else arr.push((palette && palette.length) ? palette[i % palette.length] : "#b32c2c");
            }
            return arr;
        } else return getPaletteAssignments(data.length, 42, palette);
    }, [data, palette, mode]);

    const { objectsData, customPointObject, tocList } = useMemo(() => {
        if (mode === "world") {
            const londonMarkers = getLondonMarkers(data);
            const nonLondonMarkers = getNonLondonMarkers(data);
            const clusterExpandMarker = data.find(m => m.clusterExpand);
            const clusterLat = clusterExpandMarker ? clusterExpandMarker.lat : 51.512;
            const clusterLon = clusterExpandMarker ? clusterExpandMarker.lon : -0.097;

            let entries: any[] = [];
            if (!londonExpanded) {
                entries = [
                    ...nonLondonMarkers.map(marker => ({
                        ...marker, idx: data.indexOf(marker), isStandardPin: true
                    })),
                    ...data.filter(m => m.clusterExpand).map(marker => ({
                        ...marker, idx: data.indexOf(marker), isExpandPin: true
                    }))
                ];
            } else {
                const N = londonMarkers.length;
                const radius = 1.2;
                entries = [
                    ...nonLondonMarkers.map(marker => ({
                        ...marker, idx: data.indexOf(marker), isStandardPin: true
                    })),
                    ...londonMarkers.map((marker, i) => {
                        const angle = (2 * Math.PI * i) / N;
                        const lat = clusterLat + radius * Math.cos(angle);
                        const lon = clusterLon + radius * Math.sin(angle);
                        return { ...marker, idx: data.indexOf(marker), isStandardPin: true, isLondon: true, lat, lon };
                    })
                ];
            }

            const tocList = data.map((marker, idx) => {
                let year = "";
                if (marker.timeline && marker.timeline.length > 0 && marker.timeline[0].year)
                    year = marker.timeline[0].year;
                return {
                    idx, roman: toRoman(idx + 1), name: marker.name,
                    marker, year, color: colorAssignments[idx]
                }
            }).filter(item => !item.marker.clusterExpand);

            const pinModel = getPinModel();
            const flagModel = getFlagModel();

            const customPointObject = (obj: any) => {
                const PIN_RADIUS = 3, FLAG_RADIUS = 5, CLUSTER_RADIUS = 1.5;
                if (obj.isExpandPin) {
                    if (flagModel) {
                        const group = new THREE.Group();
                        const scale = NORMAL_PIN_SCALE * 1.09 * 0.5;
                        const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);
                        const flag = flagModel.clone(true);
                        flag.scale.set(scale, scale, scale);
                        orientPin(flag, markerVec);
                        flag.rotateZ(Math.PI / 4);
                        positionPin(flag, -8);
                        const hitbox = new THREE.Mesh(
                            new THREE.SphereGeometry(FLAG_RADIUS, 16, 16),
                            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
                        );
                        hitbox.position.set(0, 0, 0);
                        hitbox.userData = flag.userData;
                        group.add(hitbox);
                        group.position.copy(markerVec);
                        flag.userData = { markerId: obj.markerId, label: obj.label };
                        group.add(flag);
                        group.userData = { markerId: obj.markerId, label: obj.label };
                        group.name = "expand-flag-group";
                        return group;
                    }
                    return new THREE.Object3D();
                }
                if (obj.isStandardPin && pinModel && obj.isLondon) {
                    const group = new THREE.Group();
                    let scale = NORMAL_PIN_SCALE * 0.75;
                    const pin = pinModel.clone(true);
                    pin.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = false;
                            child.material = child.material.clone();
                            child.material.color.set(obj.color || "#b32c2c");
                        }
                    });
                    pin.scale.set(scale, scale, scale);
                    const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);
                    group.position.copy(markerVec);
                    orientPin(pin, markerVec);
                    positionPin(pin, -6);
                    pin.userData = { markerId: obj.markerId, label: obj.label };
                    group.add(pin);
                    const hitbox = new THREE.Mesh(
                        new THREE.SphereGeometry(CLUSTER_RADIUS, 16, 16),
                        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
                    );
                    hitbox.position.set(0, 0, 0);
                    hitbox.userData = pin.userData;
                    group.add(hitbox);
                    group.userData = { markerId: obj.markerId, label: obj.label };
                    return group;
                }
                if (obj.isStandardPin && pinModel) {
                    const group = new THREE.Group();
                    let scale = NORMAL_PIN_SCALE;
                    const pin = pinModel.clone(true);
                    pin.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = false;
                            child.material = child.material.clone();
                            child.material.color.set(obj.color || "#b32c2c");
                        }
                    });
                    pin.scale.set(scale, scale, scale);
                    const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);
                    group.position.copy(markerVec);
                    orientPin(pin, markerVec);
                    positionPin(pin, -6);
                    pin.userData = { markerId: obj.markerId, label: obj.label };
                    group.add(pin);
                    const hitbox = new THREE.Mesh(
                        new THREE.SphereGeometry(PIN_RADIUS, 16, 16),
                        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
                    );
                    hitbox.position.set(0, 0, 0);
                    hitbox.userData = pin.userData;
                    group.add(hitbox);
                    group.userData = { markerId: obj.markerId, label: obj.label };
                    return group;
                }
                return new THREE.Object3D();
            };

            const objectsData = entries.map(obj => {
                if (obj.isExpandPin) {
                    return {
                        ...obj, lat: obj.lat, lng: obj.lon,
                        markerId: obj.name, isExpandPin: true, altitude: DOT_ALTITUDE,
                        color: colorAssignments[obj.idx], label: obj.name
                    };
                }
                return {
                    ...obj, lat: obj.lat, lng: obj.lon,
                    markerId: obj.name, isStandardPin: true, isLondon: !!obj.isLondon,
                    altitude: DOT_ALTITUDE, color: colorAssignments[obj.idx], label: obj.name
                };
            });

            return { objectsData, customPointObject, tocList };
        } else {
            const tocList = data.map((marker, idx) => {
                let year = "";
                if (marker.timeline && marker.timeline.length > 0 && marker.timeline[0].year)
                    year = marker.timeline[0].year;
                return {
                    idx, roman: toRoman(idx + 1), name: marker.name,
                    marker, year, color: colorAssignments[idx]
                }
            });
            const pinScale =
                mode === "usa"
                    ? NORMAL_PIN_SCALE * 0.5
                    : mode === "sd"
                        ? NORMAL_PIN_SCALE * 0.25
                        : NORMAL_PIN_SCALE;
            const objectsData = data.map((marker, idx) => ({
                ...marker,
                lat: marker.lat,
                lng: marker.lon,
                markerId: marker.name,
                isStandardPin: true,
                idx,
                altitude: DOT_ALTITUDE,
                color: colorAssignments[idx],
                label: marker.name,
                pinScale
            }));
            const customPointObject = (obj: any) => {
                const PIN_RADIUS = 3;
                const pinModel = getPinModel();
                if (obj.isStandardPin && pinModel) {
                    const group = new THREE.Group();
                    const scale = obj.pinScale || NORMAL_PIN_SCALE;
                    const pin = pinModel.clone(true);
                    pin.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = false;
                            child.material = child.material.clone();
                            child.material.color.set(obj.color || "#b32c2c");
                        }
                    });
                    pin.scale.set(scale, scale, scale);
                    const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);
                    group.position.copy(markerVec);
                    orientPin(pin, markerVec);
                    positionPin(pin, -6);
                    pin.userData = { markerId: obj.markerId, label: obj.label };
                    group.add(pin);
                    const hitbox = new THREE.Mesh(
                        new THREE.SphereGeometry(PIN_RADIUS, 16, 16),
                        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
                    );
                    hitbox.position.set(0, 0, 0);
                    hitbox.userData = pin.userData;
                    group.add(hitbox);
                    group.userData = { markerId: obj.markerId, label: obj.label };
                    return group;
                }
                return new THREE.Object3D();
            };
            return { objectsData, customPointObject, tocList };
        }
    }, [mode, data, palette, colorAssignments, londonExpanded, pinReady, flagReady]);

    if (!pinReady || !flagReady) {
        return (
            <section
                className="isp-globe-section"
                style={{
                    width: "100vw",
                    minHeight: 500,
                    height: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    color: "#b32c2c",
                }}
            >
                Loading globe...
            </section>
        );
    }

    const handleObjectClick = (obj: any) => {
        if (obj && obj.isExpandPin) {
            setLondonExpanded(true);
            setHovered(null);
            if (globeEl.current && typeof globeEl.current.pointOfView === "function" && obj.lat && obj.lng) {
                globeEl.current.pointOfView(
                    { lat: obj.lat, lng: obj.lng, altitude: 1.4 },
                    1700
                );
            }
            return;
        }
        if (londonExpanded && obj && obj.isStandardPin && obj.isLondon) {
            const marker = data.find((m) => m.name === obj.markerId);
            if (marker) onMarkerClick(marker);
            setLondonExpanded(false);
            setHovered(null);
            return;
        }
        if (obj && obj.isStandardPin) {
            const marker = data.find((m) => m.name === obj.markerId);
            if (marker) onMarkerClick(marker);
            setLondonExpanded(false);
            setHovered(null);
            return;
        }
    };

    const handleBackgroundClick = () => {
        if (londonExpanded) {
            setLondonExpanded(false);
            setHovered(null);
        }
    };

    const handleObjectHover = (obj: any) => setHovered(obj);

    function handleTOCClick(marker: any) {
        if (marker.clusterExpand) {
            setLondonExpanded(true);
            setHovered(null);
            if (globeEl.current && typeof globeEl.current.pointOfView === "function" && marker.lat && marker.lon) {
                globeEl.current.pointOfView(
                    { lat: marker.lat, lng: marker.lon, altitude: 1.4 },
                    1700
                );
            }
            return;
        }
        onMarkerClick(marker);
        setLondonExpanded(false);
        setHovered(null);
    }

    return (
        <section
            className="isp-globe-section"
            style={{
                width: "100vw",
                minHeight: "500px",
                height: "auto",
                background: "transparent",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "stretch",
                justifyContent: "center",
                paddingTop: 0,
                paddingBottom: 0,
                margin: 0,
                overflow: "hidden",
                boxSizing: "border-box",
                position: "relative",
                marginTop: 57,
                zIndex: 0
            } as React.CSSProperties}
        >
            <div
                style={{
                    flex: "0 0 auto",
                    width: 1050,
                    height: 845,
                    maxWidth: 1050,
                    minWidth: 600,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: isMobile ? "0 auto 24px auto" : "0 0 0 0",
                    padding: 0,
                    background: "transparent",
                    overflow: "unset",
                    position: "relative",
                    borderRadius: 0,
                    boxShadow: "none",
                    transform: isMobile ? "none" : "translateX(60px)",
                    zIndex: 1
                } as React.CSSProperties}
            >
                <Globe
                    key={mode}
                    ref={setGlobeRef}
                    globeImageUrl={globeImageUrl}
                    // @ts-ignore
                    initialPointOfView={getInitialPointOfView(mode)}
                    atmosphereColor="#e6dbb9"
                    atmosphereAltitude={0.22}
                    backgroundColor="rgba(0,0,0,0)"
                    width={2000}
                    height={1050}
                    onPointHover={handleObjectHover}
                    onPointClick={onMarkerClick}
                    objectsData={objectsData}
                    objectLat="lat"
                    objectLng="lng"
                    objectAltitude={(obj: any) => obj.altitude || DOT_ALTITUDE}
                    objectThreeObject={customPointObject}
                    onObjectClick={handleObjectClick}
                    onObjectHover={handleObjectHover}
                    onGlobeReady={() => setGlobeIsReady(true)}
                    onBackgroundClick={handleBackgroundClick}
                />
            </div>
            <nav
                aria-label="Table of Contents"
                style={{
                    flex: "0 0 auto",
                    minWidth: 440,
                    maxWidth: isMobile ? "100%" : 900,
                    width: isMobile ? "100%" : 700,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMobile ? "center" : "flex-start",
                    justifyContent: isMobile ? "flex-start" : "center",
                    background: "rgba(255,255,255,0)",
                    boxShadow: "none",
                    position: "relative",
                    zIndex: 2000,
                    left: isMobile ? 0 : 0,
                    fontFamily: "coolvetica, sans-serif",
                    overflow: "visible",
                    paddingRight: isMobile ? 0 : 12,
                    paddingLeft: isMobile ? 0 : 24,
                } as React.CSSProperties}
            >
                <ol style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: isMobile ? 15.5 : 14,
                    width: "100%",
                    overflow: "visible",
                    zIndex: 2000
                } as React.CSSProperties}>
                    {tocList.map((item, idx) => (
                        <li key={item.name} style={{
                            width: "100%",
                            marginBottom: 0,
                            padding: "0 0 0 0",
                            display: "flex",
                            alignItems: "flex-start",
                            zIndex: 2000
                        }}>
                            <button
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: item.color,
                                    fontWeight: 400,
                                    fontSize: 14,
                                    cursor: "pointer",
                                    fontFamily: "coolvetica, sans-serif",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 10,
                                    padding: "0px 0px",
                                    borderRadius: 0,
                                    width: "100%",
                                    minHeight: 32,
                                    boxShadow: "none",
                                    lineHeight: 1.18,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    transition: "color 0.12s, background 0.12s",
                                    marginLeft: 0,
                                    justifyContent: "flex-start",
                                    textAlign: "left",
                                    zIndex: 2000
                                } as React.CSSProperties}
                                onClick={() => handleTOCClick(item.marker)}
                                onMouseEnter={() => setHovered({ ...item.marker, idx, label: item.name, markerId: item.marker.markerId })}
                                onMouseLeave={() => setHovered(null)}
                                tabIndex={0}
                                aria-label={`Jump to ${item.name}`}
                                title={item.name}
                            >
                                <span style={{
                                    fontFamily: "coolvetica, sans-serif",
                                    fontWeight: 400,
                                    fontSize: 14,
                                    minWidth: 26,
                                    letterSpacing: "0.5px",
                                    color: item.color,
                                    opacity: 0.93,
                                    flexShrink: 0,
                                    marginRight: 6,
                                    display: "inline-block",
                                    textAlign: "left",
                                    zIndex: 2000
                                } as React.CSSProperties}>{item.roman}.</span>
                                <span style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    textAlign: "left",
                                    minWidth: 0,
                                    maxWidth: "100%",
                                    zIndex: 2000
                                } as React.CSSProperties}>
                                    <span style={{
                                        fontWeight: 400,
                                        fontSize: 14,
                                        letterSpacing: "0.5px",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        fontFamily: "coolvetica, sans-serif",
                                        minWidth: 0,
                                        maxWidth: "100%",
                                        flex: 1,
                                        display: "block",
                                        zIndex: 2000
                                    } as React.CSSProperties}>
                                        {item.name}
                                    </span>
                                    {item.year && (
                                        <span style={{
                                            marginTop: 2,
                                            fontSize: 13,
                                            color: "#b1b1ae",
                                            fontWeight: 400,
                                            letterSpacing: "0.5px",
                                            fontFamily: "coolvetica, sans-serif",
                                            opacity: 0.95,
                                            textAlign: "left",
                                            zIndex: 2000
                                        } as React.CSSProperties}>
                                            {item.year}
                                        </span>
                                    )}
                                </span>
                            </button>
                        </li>
                    ))}
                </ol>
            </nav>
        </section>
    );
}
