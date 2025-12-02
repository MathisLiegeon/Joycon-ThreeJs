import * as THREE from "https://unpkg.com/three@0.152.2/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.js";

const canvas = document.getElementById("3d-container");

// === SCENE, CAMERA, RENDERER ===
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// === CAMÉRA ===
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5);

// === LUMIÈRES ===
const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// === VARIABLES ===
let joycon;
const joyconPath = "public/blender/joycon_lowpoly.glb";

let floor;
const floorPath = "public/blender/floor.glb";

// === LOADER ===
const gltfLoader = new GLTFLoader();

gltfLoader.load(
  joyconPath,
  (gltf) => {
    joycon = gltf.scene;
    joycon.scale.set(1.5, 1.5, 1.5);
    joycon.position.set(0, 0, 0);
    joycon.rotation.set(0.5, Math.PI, 0);
    scene.add(joycon);
    console.log("✅ Joycon chargé:", joycon);
  },
  (xhr) => {
    if (xhr.total)
      console.log(`Joycon: ${((xhr.loaded / xhr.total) * 100).toFixed(0)}%`);
  },
  (error) => {
    console.error("❌ Erreur joycon:", error);
  }
);

gltfLoader.load(
  floorPath,
  (gltf) => {
    floor = gltf.scene;
    floor.scale.set(1, 1, 1); // Plus grand pour le sol
    floor.position.set(0, 0, 0); // SOUS le joycon
    floor.rotation.set(0, 0, 0); // Pas de rotation bizarre
    scene.add(floor);
    console.log("✅ Floor chargé:", floor);
  },
  (xhr) => {
    if (xhr.total)
      console.log(`Floor: ${((xhr.loaded / xhr.total) * 100).toFixed(0)}%`);
  },
  (error) => {
    console.error("❌ Erreur floor:", error);
  }
);

// === RESIZE ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === SCROLL PROGRESS ===
function getScrollProgress() {
  return window.scrollY / (document.body.scrollHeight - window.innerHeight);
}

const keyframesJoycon = [
  { progress: 0, pos: [0, -0.5, -3], rotY: Math.PI * 0.1, rotX: Math.PI * 0.2 },
  { progress: 0.2, pos: [0, 2, -3], rotY: Math.PI * 0.1, rotX: Math.PI * 0.2 },
  // { progress: 0.4, pos: [0, 2, -3], rotY: Math.PI * 0.1, rotX: Math.PI * 0.2 },
  { progress: 0.21, pos: [15, 0, -3], rotY: Math.PI * 0.1, rotX: Math.PI * 0.2 },
  { progress: 0.22, pos: [15, 0, 1], rotY: Math.PI * 0.1, rotX: Math.PI * 0.2 },
  { progress: 0.45, pos: [3, 0, 1], rotY: Math.PI * 0.1, rotX: Math.PI * 0.2 },
  { progress: 1, pos: [0, 0, 1], rotY: Math.PI * 0.1, rotX: Math.PI * 0.2 },
];

const keyframesFloor = [
  { progress: 0, pos: [13, -1.5, -13], rotY: 0, rotX: 0 },
  { progress: 0.2, pos: [13, 5, -13], rotY: 0, rotX: 0 },
  { progress: 1, pos: [13, 2, -13], rotY: 0, rotX: 0 },
];

// ✅ FONCTION CORRIGÉE avec gestion des rotations undefined
function applyKeyframesToModel(modelRef, frames, progress) {
  if (!modelRef) return;

  let prev = frames[0];
  let next = frames[frames.length - 1];

  for (let i = 0; i < frames.length - 1; i++) {
    if (progress >= frames[i].progress && progress <= frames[i + 1].progress) {
      prev = frames[i];
      next = frames[i + 1];
      break;
    }
  }

  const localProgress =
    (progress - prev.progress) / (next.progress - prev.progress);

  // Position
  modelRef.position.set(
    prev.pos[0] + (next.pos[0] - prev.pos[0]) * localProgress,
    prev.pos[1] + (next.pos[1] - prev.pos[1]) * localProgress,
    prev.pos[2] + (next.pos[2] - prev.pos[2]) * localProgress
  );

  // Rotation avec valeurs par défaut
  const prevRotY = prev.rotY ?? 0;
  const nextRotY = next.rotY ?? 0;
  const prevRotX = prev.rotX ?? 0;
  const nextRotX = next.rotX ?? 0;

  modelRef.rotation.y = prevRotY + (nextRotY - prevRotY) * localProgress;
  modelRef.rotation.x = prevRotX + (nextRotX - prevRotX) * localProgress;
}

// === ANIMATION ===
function animate() {
  requestAnimationFrame(animate);

  const progress = getScrollProgress();

  if (joycon) {
    applyKeyframesToModel(joycon, keyframesJoycon, progress);
  }

  if (floor) {
    applyKeyframesToModel(floor, keyframesFloor, progress);
  }

  renderer.render(scene, camera);
}
animate();
