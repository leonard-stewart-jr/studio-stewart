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
              mat.color.set("#b32c2c");
              mat.metalness = 0.2;
              mat.roughness = 0.6;
              mat.envMapIntensity = 0.3;
            });
          } else {
            child.material.color.set("#b32c2c");
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
export function positionPin(pin, offset = -5) {
  pin.position.set(0, 0, -offset);
}

export function getPinModel() {
  return pinModel;
}
