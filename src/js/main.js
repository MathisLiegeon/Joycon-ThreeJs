import * as THREE from "https://unpkg.com/three@0.152.2/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js";

//
//
//
//
//
//
// ===================================================== BASE ===================================================== //
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
//
//
//
//
//
// ===================================================== SCENE ELEMENTS ===================================================== //
// =============== CAMÉRA ===============
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5);

// =============== LIGHTS ===============
const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// =============== OBJECTS ===============
let joycon;
const joyconPath = "public/blender/joycon_lowpoly.glb";

let floor;
const floorPath = "public/blender/floor.glb";

//
//
//
//
//
//
// ===================================================== LOADER ===================================================== //
const gltfLoader = new GLTFLoader();

// =============== JOYCON ===============
gltfLoader.load(
  joyconPath,
  (gltf) => {
    joycon = gltf.scene;
    joycon.scale.set(1.5, 1.5, 1.5);
    joycon.position.set(0, 0, 0);
    joycon.rotation.set(0, 0, 0);
    scene.add(joycon);

    // pour gsap
    window.joycon = joycon;

    getParts();
    initTimeline();
  },
  (error) => {
    console.error("❌ Erreur joycon:", error);
  }
);

// =============== FLOOR ===============
gltfLoader.load(
  floorPath,
  (gltf) => {
    floor = gltf.scene;
    floor.scale.set(1, 1, 1);
    floor.position.set(36, -1.5, -13);
    floor.rotation.set(0, 0, 0);
    scene.add(floor);
  },
  (error) => {
    console.error("❌ Erreur floor:", error);
  }
);

//
//
//
//
//
//
// ===================================================== GSAP ANIMATIONS (floor) ===================================================== //
// =============== INIT ===============
function getScrollProgress() {
  return window.scrollY / (document.body.scrollHeight - window.innerHeight);
}

// =============== KEYFRAMES ===============
const keyframesFloor = [
  { progress: 0, pos: [36, -1.5, -20], rotY: 0, rotX: 0 },
  { progress: 0.2, pos: [36, 4, -20], rotY: 0, rotX: 0 },
  { progress: 1, pos: [36, 4, -20], rotY: 0, rotX: 0 },
];

// =============== APPLYING KEYFRAMES ===============
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
// =============== ACTIVATE ANIMATION ===============
function animate() {
  requestAnimationFrame(animate);

  const progress = getScrollProgress();

  if (floor) {
    applyKeyframesToModel(floor, keyframesFloor, progress);
  }

  renderer.render(scene, camera);
}
animate();

//
//
//
//
//
//
// ===================================================== FUNCTIONS ===================================================== //

// =============== FLOATING ===============
let floatTween = null;
function gsapFloatJoycon() {
  if (floatTween) return;
  floatTween = gsap.to(joycon.position, {
    y: 0.1,
    duration: 1.5,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });
}

function stopGsapFloatJoycon() {
  if (floatTween) {
    floatTween.kill();
    floatTween = null;
    joycon.position.y = 0;
  }
}

//
// =============== GET JOYCON PARTS ===============
window.joyconParts = {};
window.joyconOriginalPositions = {};

function getParts() {
  joycon.traverse((child) => {
    const componentName = child.userData.name;
    window.joyconParts[componentName] = child;
  });

  getMainBlueMeshes();
}

//
// =============== MODIFY TEXTURE COLOR ===============
window.mainBlueMeshes = [];

function getMainBlueMeshes() {
  window.mainBlueMeshes = [];
  joycon.traverse((child) => {
    if (child.isMesh && child.material?.name === "Main blue - export") {
      // Clone pour GSAP scrub
      child.originalMaterial = child.material.clone();
      child.material = child.originalMaterial.clone();
      window.mainBlueMeshes.push(child.material);
    }
  });
  console.log(
    `✅ ${window.mainBlueMeshes.length} meshes "Main blue - export" trouvés`
  );
}

function setMainBlueColor(hexColor) {
  window.mainBlueMeshes.forEach((material) => {
    material.color.set(hexColor);
  });
}

function resetMainBlueColor() {
  const originalColor = new THREE.Color(0.001, 0.658, 0.799); // Bleu original
  window.mainBlueMeshes.forEach((material) => {
    material.color.copy(originalColor);
  });
}

//
// =============== MAP POSITION OF EACH COMPONENT ===============
// Used for the first animation with animateParts()
const partsList = [
  { name: "screw-1", offset: { x: 0, y: -1.3, z: 0 } },
  { name: "screw-2", offset: { x: 0, y: -1.3, z: 0 } },
  { name: "screw-3", offset: { x: 0, y: -1.3, z: 0 } },
  { name: "screw-4", offset: { x: 0, y: -1.3, z: 0 } },
  { name: "Base", offset: { x: 0, y: -0.5, z: 0 } },
  { name: "clip-1", offset: { x: 0, y: -0.5, z: 0.7 } },
  { name: "clip-2", offset: { x: 0, y: -0.5, z: 0.7 } },
  { name: "Joystick", offset: { x: 0, y: 1, z: 0 } },
  { name: "Slideout", offset: { x: 0, y: -1, z: 0 } },
  { name: "trigger-1", offset: { x: 1, y: 0.15, z: 0 } },
  { name: "trigger-2", offset: { x: 0.5, y: 0.15, z: 0 } },
  { name: "arrow-down", offset: { x: 0, y: 0.5, z: 0 } },
  { name: "arrow-left", offset: { x: 0, y: 0.5, z: 0 } },
  { name: "arrow-right", offset: { x: 0, y: 0.5, z: 0 } },
  { name: "arrow-up", offset: { x: 0, y: 0.5, z: 0 } },
  { name: "Home", offset: { x: 0, y: 0.2, z: 0 } },
  { name: "Minus", offset: { x: 0, y: 0.1, z: 0 } },
];

//
// =============== ANIMATE JOYCON PARTS ===============
function animateParts(
  tl,
  action,
  startLabel = "25%",
  duration = 1,
  stagger = 0.15
) {
  const targets = partsList
    .map((part) => window.joyconParts[part.name]?.position)
    .filter(Boolean);

  // Direction selon l'action (disperse = +offset, reform = -offset)
  const direction = action === "disperse" ? "+" : "-";

  tl.to(
    targets,
    {
      x: (i) => `${direction}=${partsList[i].offset.x}`,
      y: (i) => `${direction}=${partsList[i].offset.y}`,
      z: (i) => `${direction}=${partsList[i].offset.z}`,
      duration,
      stagger,
    },
    startLabel
  );

  return tl;
}
//
//
//
//
//
//
// ===================================================== TIMELINE ===================================================== //
// Enregistrer les plugins GSAP
gsap.registerPlugin(ScrollTrigger);

function initTimeline() {
  const totalDuration = 30; // Durée de la timeline

  //
  // ============================== INIT TIMELINE ==============================
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".main",
      start: "top top",
      end: `+=${totalDuration * 625}`, // auto-calcul de la longueur de la timeline
      scrub: true,
      pin: true,
      // markers: true,
    },
  });

  //
  // ============================== PART 1 ==============================
  tl.call(gsapFloatJoycon, null, "0%") // start floating
    .fromTo(
      joycon.rotation, // rotation 1.1
      {
        y: Math.PI * 0.2,
        x: Math.PI * 0.15,
      },
      {
        y: Math.PI * 0.3,
        x: Math.PI * 0.3,
        duration: 2,
      },
      "5%"
    )
    .call(gsapFloatJoycon, null, "9%") // start floating
    .call(stopGsapFloatJoycon, null, "10%") // end floating
    .fromTo(
      "#card1",
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 2 },
      "10%"
    )
    .to(
      joycon.position,
      { z: 1.1, duration: 1.5, ease: "power2.inOut" }, // zoom in
      "10%"
    );

  animateParts(tl, "disperse", "10%"); // Animate parts

  tl.to(
    joycon.rotation, // rotation 1.2
    {
      y: Math.PI * 0.1,
      x: Math.PI * 0.3,
      duration: 2,
      ease: "power2.inOut",
    },
    "10%"
  );

  animateParts(tl, "reform", "10%+=3", 1.5, 0.1) // Animate parts
    .to(
      joycon.rotation, // rotation 1.3
      {
        y: Math.PI * -0.1,
        x: Math.PI * 0.2,
        duration: 1.5,
        ease: "power2.inOut",
      },
      "10%+=3"
    )
    .to(joycon.position, { z: 0, duration: 1, ease: "power2.inOut" }, ">") // zoom out
    .to("#card1", { opacity: 0, duration: 2 }, ">")

    //
    // ============================== PART 2 ==============================
    .fromTo(
      "#card2",
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 2 },
      "25%"
    )
    .fromTo(
      joycon.rotation, // rotation 2
      {
        y: Math.PI * -0.1,
        x: Math.PI * 0.2,
      },
      {
        y: Math.PI * -0.1,
        x: Math.PI * 2.4,
        duration: 4,
      },
      "25%"
    )
    .to(joycon.position, { z: 2, duration: 2, ease: "power2.inOut" }, "25%") // Color change
    .to({}, { duration: 0.1, onUpdate: resetMainBlueColor }, "25%")
    .to({}, { duration: 1, onUpdate: () => setMainBlueColor(0xff0000) }, ">")
    .to({}, { duration: 1, onUpdate: () => setMainBlueColor(0x00ff00) }, ">")
    .to({}, { duration: 1, onUpdate: () => setMainBlueColor(0x0000ff) }, ">")
    .to({}, { duration: 0.1, onUpdate: resetMainBlueColor }, ">")
    .to(joycon.position, { z: 0, duration: 1, ease: "power2.inOut" }, ">")

    .to("#card2", { opacity: 0, duration: 1 }, ">") // Part 2 End

    //
    // ============================== PART 3 ==============================
    .fromTo(
      "#card3",
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 2 },
      "40%"
    )
    .to("#card3", { opacity: 0, duration: 1 }, ">")

    //
    // ============================== PART 4 ==============================
    .fromTo(
      "#card4",
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 3 },
      "60%"
    )
    .to("#card4", { opacity: 0, duration: 1 }, ">")

    //
    // ============================== PART 5 ==============================
    .fromTo(
      "#card5",
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 3 },
      "85%"
    );
}
