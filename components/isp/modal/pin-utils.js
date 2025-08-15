import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// Pin model cache and loader
let pinModel = null;
let pinModelPromise = null;

export function loadPinModel() {
  if (pinModel) return Promise.resolve(pinModel);
  if (pinModelPromise) return pinModelPromise;
  pinModelPromise = new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    // Use local draco decoder for best performance
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);
    loader.load("/models/3D_map_pin.glb", (gltf) => {
      gltf.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.metalness = 0.2;
              mat.roughness = 0.6;
              mat.envMapIntensity = 0.3;
            });
          } else {
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

export function getPinModel() {
  return pinModel ? pinModel.clone(true) : null;
}

// --- 3D FLAG MODEL LOADER ---
let flagModel = null;
let flagModelPromise = null;

export function loadFlagModel() {
  if (flagModel) return Promise.resolve(flagModel);
  if (flagModelPromise) return flagModelPromise;
  flagModelPromise = new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    // Use local draco decoder for best performance
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);
    loader.load('/models/3D_flag.glb', (gltf) => {
      flagModel = gltf.scene;
      resolve(flagModel);
    }, undefined, reject);
  });
  return flagModelPromise;
}

export function getFlagModel() {
  return flagModel ? flagModel.clone(true) : null;
}

/**
 * Converts latitude, longitude, and altitude to a THREE.Vector3 position on a sphere.
 */
export function latLngAltToVec3(lat, lng, altitude = 0) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const r = 1 + altitude;
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Orients the pin so that its +Z axis (the "tip") points toward the center of the globe.
 * The pin should be positioned on the surface using the markerVec, and then oriented.
 */
export function orientPin(pin, markerVec) {
  // The pin's +Z axis should point toward the center (0,0,0)
  const target = new THREE.Vector3(0, 0, 0);
  pin.lookAt(target);
  // If your model points the wrong way, you may need to rotate it here.
  // pin.rotateX(Math.PI); // Uncomment if needed based on your model orientation
}

/**
 * Positions the pin at an offset (in local Z) from its parent group (which is at markerVec).
 * By default, no offset (tip at globe surface).
 */
export function positionPin(pin, offset = 0) {
  pin.position.set(0, 0, offset);
}

/**
 * Helper: Create a buffered bounding box geometry for hitboxes around the pin mesh.
 */
export function bufferedBoundingGeometry(mesh, buffer = 1.07) {
  const box = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  const geom = new THREE.BoxGeometry(size.x * buffer, size.y * buffer, size.z * buffer);
  geom.translate(center.x, center.y, center.z);
  return geom;
}

/**
 * Helper: Convert SVG string to a THREE.Texture.
 */
export function svgStringToTexture(svgString, size = 128) {
  const svg = encodeURIComponent(svgString);
  const img = new window.Image();
  img.src = "data:image/svg+xml;utf8," + svgString;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  return new Promise((resolve) => {
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      resolve(texture);
    };
  });
}

// --- COLOR THEMES FOR PINS/TOC ---
// 2. Earthtones Palette (for World/Globe)
export const EARTHTONES_PALETTE = [
  "#A0522D", // brown
  "#CD853F", // tan
  "#C19A6B", // camel
  "#F4E2D8", // sand
  "#B6B09A", // sage
  "#7E6651", // coffee
  "#3B3A30", // dark olive
  "#A3B18A", // moss
  "#C2B280", // khaki
  "#7C6F57", // taupe
];

// 3. USA Theme Palette (for USA Map)
export const USA_THEME_PALETTE = [
  "#B22234", // red
  "#FFFFFF", // white
  "#3C3B6E", // navy blue
  "#0052A5", // bright blue
  "#C60C30", // bright red
  "#A2AAAD", // silver/gray
  "#FFD700", // gold
  "#B0B7C6", // steel blue
];

// 4. SD Theme Palette (for South Dakota Map)
export const SD_THEME_PALETTE = [
  "#8B4513", // prairie brown
  "#E1C699", // dry grass
  "#B2D7E4", // sky blue
  "#A9A583", // sage
  "#F5EEDC", // cloud
  "#B4654A", // badlands clay
  "#8CA087", // prairie green
  "#5D737E", // river blue
  "#D0B49F", // sandstone
  "#AAB7B8", // granite gray
];

// ---- PALETTE SELECTOR UTILITY ----
/**
 * Get the color palette for a given theme key.
 * @param {string} theme "world" | "usa" | "sd" | "analogous" (default: "world")
 * @returns {string[]} color palette array
 */
export function getPinPalette(theme = "world") {
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

// ---- RANDOM COLOR ASSIGNMENT (works for any palette) ----
/**
 * Randomly assign a color from the palette for each marker, but keep it matched between pins and TOC.
 * Uses a seeded shuffle for consistency.
 * @param {number} count Number of pins/markers
 * @param {number} seed Seed for deterministic assignment
 * @param {string[]} palette Color palette array (defaults to analogous reds)
 */
export function getPaletteAssignments(count, seed = 42, palette) {
  let arr = [...palette];
  while (arr.length < count) arr = arr.concat(arr);
  arr = arr.slice(0, count);

  // Fisher-Yates shuffle with seed
  function seededRandom() {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
