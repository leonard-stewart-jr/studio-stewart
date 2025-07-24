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

export function orientPin(pin, markerVec) {
  const surfaceNormal = markerVec.clone().normalize();
  const axis = new THREE.Vector3(0, 0, 1); // +Z axis for tip
  const towardCenter = surfaceNormal.clone().negate();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, towardCenter);
  pin.setRotationFromQuaternion(quaternion);
}

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

// For access in GlobeSection
export function getPinModel() {
  return pinModel;
}
