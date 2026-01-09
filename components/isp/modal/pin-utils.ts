import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

let pinModel: THREE.Group | null = null;
let pinModelPromise: Promise<THREE.Group> | null = null;

export function loadPinModel(): Promise<THREE.Group> {
    if (pinModel) return Promise.resolve(pinModel);
    if (pinModelPromise) return pinModelPromise;
    pinModelPromise = new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        loader.setDRACOLoader(dracoLoader);
        loader.load("/models/3D_map_pin.glb", (gltf) => {
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat) => {
                            if (mat instanceof THREE.MeshStandardMaterial) {
                                mat.metalness = 0.2;
                                mat.roughness = 0.6;
                                mat.envMapIntensity = 0.3;
                            }
                        });
                    } else if (child.material instanceof THREE.MeshStandardMaterial) {
                        child.material.metalness = 0.2;
                        child.material.roughness = 0.6;
                        child.material.envMapIntensity = 0.3;
                    }
                }
            });
            pinModel = gltf.scene;
            resolve(pinModel);
        }, undefined, reject);
    });
    return pinModelPromise;
}

export function getPinModel(): THREE.Group | null {
    return pinModel ? pinModel.clone(true) : null;
}

let flagModel: THREE.Group | null = null;
let flagModelPromise: Promise<THREE.Group> | null = null;

export function loadFlagModel(): Promise<THREE.Group> {
    if (flagModel) return Promise.resolve(flagModel);
    if (flagModelPromise) return flagModelPromise;
    flagModelPromise = new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        loader.setDRACOLoader(dracoLoader);
        loader.load('/models/3D_flag.glb', (gltf) => {
            flagModel = gltf.scene;
            resolve(flagModel);
        }, undefined, reject);
    });
    return flagModelPromise;
}

export function getFlagModel(): THREE.Group | null {
    return flagModel ? flagModel.clone(true) : null;
}

export function latLngAltToVec3(lat: number, lng: number, altitude: number = 0): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const r = 1 + altitude;
    return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
    );
}

export function orientPin(pin: THREE.Object3D, markerVec: THREE.Vector3) {
    const target = new THREE.Vector3(0, 0, 0);
    pin.lookAt(target);
}

export function positionPin(pin: THREE.Object3D, offset: number = 0) {
    pin.position.set(0, 0, offset);
}

export function bufferedBoundingGeometry(mesh: THREE.Object3D, buffer: number = 1.07): THREE.BoxGeometry {
    const box = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const geom = new THREE.BoxGeometry(size.x * buffer, size.y * buffer, size.z * buffer);
    geom.translate(center.x, center.y, center.z);
    return geom;
}

export function svgStringToTexture(svgString: string, size: number = 128): Promise<THREE.Texture> {
    const img = new window.Image();
    img.src = "data:image/svg+xml;utf8," + svgString;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    return new Promise((resolve) => {
        img.onload = () => {
            if (ctx) {
                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(img, 0, 0, size, size);
            }
            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            resolve(texture);
        };
    });
}

export const EARTHTONES_PALETTE = [
    "#A0522D", "#CD853F", "#C19A6B", "#F4E2D8", "#B6B09A", "#7E6651",
    "#3B3A30", "#A3B18A", "#C2B280", "#7C6F57",
];

export const USA_THEME_PALETTE = [
    "#B22234", "#FFFFFF", "#3C3B6E", "#0052A5", "#C60C30", "#A2AAAD",
    "#FFD700", "#B0B7C6",
];

export const SD_THEME_PALETTE = [
    "#8B4513", "#E1C699", "#B2D7E4", "#A9A583", "#F5EEDC", "#B4654A",
    "#8CA087", "#5D737E", "#D0B49F", "#AAB7B8",
];

export function getPinPalette(theme: string = "world"): string[] {
    switch (theme) {
        case "usa":
            return USA_THEME_PALETTE;
        case "sd":
            return SD_THEME_PALETTE;
        case "world":
        default:
            return EARTHTONES_PALETTE;
    }
}

export function getPaletteAssignments(count: number, seed: number = 42, palette: string[]): string[] {
    let arr = [...palette];
    while (arr.length < count) arr = arr.concat(arr);
    arr = arr.slice(0, count);

    function seededRandom(s: number) {
        let x = Math.sin(s) * 10000;
        return x - Math.floor(x);
    }
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
