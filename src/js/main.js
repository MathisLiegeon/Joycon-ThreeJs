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
camera.position.set(0, 0, 5); // Positionne la caméra pour voir le modèle

// === LUMIÈRES ===
const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// === VARIABLES DE ROTATION LIEE À LA SOURIS ===
let model; // variable globale pour ton objet
let targetRotationY = 0;
let currentRotationY = 0;

window.addEventListener("mousemove", (e) => {
  const mouseX = (e.clientX / window.innerWidth) * 2 - 1; // -1 à 1
  targetRotationY = mouseX * 0.1; // amplitude de rotation
});

// === LOADER (maintenant après scene/camera/lights) ===
const gltfLoader = new GLTFLoader();
const modelPath = "public/blender/joycon_lowpoly.glb";

gltfLoader.load(
  modelPath,
  (gltf) => {
    model = gltf.scene;
    model.scale.set(2, 2, 2); // Ajuste si trop petit/grand
    model.position.set(0, 0, 0);
    model.rotation.set(0.5, Math.PI, 0); // Optionnel : rotation pour mieux voir

    scene.add(model);
    console.log("Modèle chargé et ajouté:", model);
  },
  (xhr) => {
    if (xhr.total)
      console.log(
        `Chargement: ${((xhr.loaded / xhr.total) * 100).toFixed(0)}%`
      );
  },
  (error) => {
    console.error("Erreur chargement:", error);
  }
);

// === RESIZE ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ------------------- SCROLL PROGRESS ------------------- */
function getScrollProgress() {
  return window.scrollY / (document.body.scrollHeight - window.innerHeight);
}

const keyframes = [
  { progress: 0, pos: [0, 0, 0], rotY: Math.PI * 0.1, rotX: Math.PI * 0.2 },
  { progress: 0.5, pos: [0, 0, 0], rotY: Math.PI * 0.7, rotX: Math.PI * 1.2 },
  { progress: 1, pos: [0, 1, 0], rotY: Math.PI * 1.7, rotX: Math.PI * 2.2 },
];

function updateAnimation(progress) {
  let prev = keyframes[0];
  let next = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (
      progress >= keyframes[i].progress &&
      progress <= keyframes[i + 1].progress
    ) {
      prev = keyframes[i];
      next = keyframes[i + 1];
      break;
    }
  }

  const localProgress =
    (progress - prev.progress) / (next.progress - prev.progress);

  // position
  model.position.set(
    prev.pos[0] + (next.pos[0] - prev.pos[0]) * localProgress,
    prev.pos[1] + (next.pos[1] - prev.pos[1]) * localProgress,
    prev.pos[2] + (next.pos[2] - prev.pos[2]) * localProgress
  );

  // rotation horizontale
  model.rotation.y = prev.rotY + (next.rotY - prev.rotY) * localProgress;

  // rotation verticale
  model.rotation.x = prev.rotX + (next.rotX - prev.rotX) * localProgress;
}

// === BOUCLE D'ANIMATION ESSENTIELLE ===
function animate() {
  requestAnimationFrame(animate);

  if (model) {
    // interpolation douce
    currentRotationY += (targetRotationY - currentRotationY) * 0.05;
    model.rotation.y = currentRotationY;

    const progress = getScrollProgress();
    updateAnimation(progress);
  }
  renderer.render(scene, camera);
}
animate();
