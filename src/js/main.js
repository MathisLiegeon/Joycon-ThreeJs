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

// === LOADER (maintenant après scene/camera/lights) ===
const gltfLoader = new GLTFLoader();
const modelPath = "public/blender/joycon_lowpoly.glb";

gltfLoader.load(
  modelPath,
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(2, 2, 2); // Ajuste si trop petit/grand
    model.position.set(0, 0, 0);
    model.rotation.set(0.5, Math.PI, 0); // Optionnel : rotation pour mieux voir

    scene.add(model);
    console.log("Modèle chargé et ajouté:", model);

    // // ANIMATION GSAP optionnelle
    // gsap.to(model.rotation, {
    //   y: Math.PI * 3,
    //   duration: 10,
    //   repeat: -1,
    //   ease: "none",
    // });
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

// === BOUCLE D'ANIMATION ESSENTIELLE ===
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// === RESIZE ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
