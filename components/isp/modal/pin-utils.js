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
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.3/');
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
export function positionPin(pin, offset = 4) {
  pin.position.set(0, 0, offset);
}

export function getPinModel() {
  return pinModel;
}

// --- COLOR UTILITIES FOR MONOCHROME SHADES ---
/**
 * Interpolates between a color and white, returning a lighter or darker shade.
 * amt should be between 0 (base color) and 1 (white).
 */
export function shadeColor(hex, amt = 0.5) {
  let c = parseInt(hex.slice(1), 16);
  let r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff;
  r = Math.round(r + (255 - r) * amt);
  g = Math.round(g + (255 - g) * amt);
  b = Math.round(b + (255 - b) * amt);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/**
 * Generates N monochrome shades from a base color.
 * Returns an array of hex colors.
 */
export function getMonochromeShades(base, count) {
  // amt from 0.12 to 0.62
  return Array.from({ length: count }, (_, i) =>
    shadeColor(base, 0.12 + 0.5 * (i / Math.max(1, count - 1)))
  );
}
