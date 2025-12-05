import * as THREE from "https://unpkg.com/three@0.152.2/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js";

//
// ----------------------------------- Base -----------------------------------
const canvas = document.getElementById("3d-container");

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

//
// ----------------------------------- Elements de scène -----------------------------------
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

// === OBJETS ===
let joycon;
const joyconPath = "public/blender/joycon_lowpoly.glb";

let floor;
const floorPath = "public/blender/floor.glb";

//
// ----------------------------------- Loader -----------------------------------
const gltfLoader = new GLTFLoader();

// Joycon loader
gltfLoader.load(
  joyconPath,
  (gltf) => {
    joycon = gltf.scene;
    joycon.scale.set(1.5, 1.5, 1.5);
    joycon.position.set(0, 0, 0);
    joycon.rotation.set(0, 0, 0);
    scene.add(joycon);
    console.log("✅ Joycon chargé:", joycon);

    // Montre les mesh disponibles de l'objet
    console.log("=== Parties disponibles ===");
    joycon.traverse((child) => {
      if (child.isMesh) {
        console.log("- " + child.name);
      }
    });

    animateJoyconFloat();
  },
  (xhr) => {
    if (xhr.total)
      console.log(`Joycon: ${((xhr.loaded / xhr.total) * 100).toFixed(0)}%`);
  },
  (error) => {
    console.error("❌ Erreur joycon:", error);
  }
);

// Floor loader
gltfLoader.load(
  floorPath,
  (gltf) => {
    floor = gltf.scene;
    floor.scale.set(1, 1, 1);
    floor.position.set(36, -1.5, -13);
    floor.rotation.set(0, 0, 0);
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

//
// ----------------------------------- Animations -----------------------------------
// === SCROLL PROGRESS ===
function getScrollProgress() {
  return window.scrollY / (document.body.scrollHeight - window.innerHeight);
}

// === KEYFRAMES ===
// Joycon
// const keyframesJoycon = [
//   { progress: 0, pos: [0, 0, -3], rotY: Math.PI * 0.1, rotX: Math.PI * 0.2 },
//   { progress: 0.2, pos: [0, 2, -3], rotY: Math.PI * 0.1, rotX: Math.PI * 0.2 },
//   { progress: 0.21, pos: [15, 0, 1], rotY: Math.PI * 0.1, rotX: Math.PI * 0.2 },
//   { progress: 0.22, pos: [15, 0, 1], rotY: Math.PI * 0.1, rotX: Math.PI * 0.2 },
//   { progress: 0.45, pos: [2, 0, 1], rotY: Math.PI * 0.1, rotX: Math.PI * 0.2 },
//   { progress: 0.7, pos: [2, 0, 1], rotY: Math.PI * 1.4, rotX: Math.PI * 0.1 },
//   { progress: 1, pos: [1, 0.6, 2.2], rotY: Math.PI * 1.4, rotX: Math.PI * 0.1 },
// ];

// Floor
const keyframesFloor = [
  { progress: 0, pos: [36, -1.5, -13], rotY: 0, rotX: 0 },
  { progress: 0.2, pos: [36, 4, -13], rotY: 0, rotX: 0 },
  { progress: 1, pos: [36, 4, -13], rotY: 0, rotX: 0 },
];

// === Fonction qui gère les animations ===
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

//
// === Activer les animations ===
function animate() {
  requestAnimationFrame(animate);

  const progress = getScrollProgress();

  // if (joycon) {
  //   applyKeyframesToModel(joycon, keyframesJoycon, progress);
  // }

  if (floor) {
    applyKeyframesToModel(floor, keyframesFloor, progress);
  }

  renderer.render(scene, camera);
}
animate();

//
//
// ----------------------------------- Functions -----------------------------------
function showOnlyPart(partNames) {
  if (!joycon) return;

  // Convertir en tableau si c'est une seule string
  const partsArray = Array.isArray(partNames) ? partNames : [partNames];

  // Parcourir tous les enfants du Joycon
  joycon.traverse((child) => {
    if (child.isMesh) {
      // Vérifier si le nom du mesh correspond à un des noms recherchés
      const isVisible = partsArray.some((partName) =>
        child.name.toLowerCase().includes(partName.toLowerCase())
      );
      child.visible = isVisible;
    }
  });
}

function showAll() {
  if (!joycon) return;

  joycon.traverse((child) => {
    if (child.isMesh) {
      child.visible = true;
    }
  });
}

// ----------------------------------- GSAP Animations -----------------------------------

// Enregistrer les plugins GSAP
gsap.registerPlugin(ScrollTrigger);

// Animation 2 : Flottement continu
function animateJoyconFloat() {
  if (!joycon) return;

  gsap.to(joycon.position, {
    y: "+=0.3",
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });
}
