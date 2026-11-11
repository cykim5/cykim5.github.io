// 3D part viewer for the tilt stage popup.
//
// The printed parts are exported in print orientation rather than in
// assembly position, so they are shown one at a time rather than stacked
// into an assembly that would misrepresent the design.

import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const VERSIONS = {
  stepper: [
    { file: "assembly_stepper.stl", label: "Assembled" },
    { file: "base_2motor.stl", label: "Base" },
    { file: "platform_2motor.stl", label: "Platform" },
    { file: "cam_disc_2motor.stl", label: "Cam disc" },
    { file: "ball_cap_2motor.stl", label: "Ball cap" },
  ],
  linear: [
    { file: "assembly_linear.stl", label: "Assembled" },
    { file: "base.stl", label: "Base" },
    { file: "platform_6dish.stl", label: "Platform" },
    { file: "tip_cap.stl", label: "Tip cap" },
  ],
};

const stage = document.getElementById("viewerStage");
const note = document.getElementById("viewerNote");
const partList = document.getElementById("partList");

let renderer, scene, camera, controls, mesh;
let started = false;
let currentVersion = "stepper";
const loader = new STLLoader();
const cache = new Map();

function setNote(text) {
  note.textContent = text || "";
  note.hidden = !text;
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfcfcfa);

  camera = new THREE.PerspectiveCamera(38, 1, 1, 2000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  stage.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.addEventListener("change", render);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9a95, 2.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(1, 1.4, 1.2);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5);
  fill.position.set(-1, -0.6, -0.8);
  scene.add(fill);

  resize();
  window.addEventListener("resize", resize);
}

function render() {
  if (renderer) renderer.render(scene, camera);
}

function resize() {
  if (!renderer) return;
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  render();
}

function show(geometry) {
  if (mesh) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  }

  const geo = geometry.clone();
  geo.computeVertexNormals();
  geo.computeBoundingBox();

  // Center the part on the origin and sit it upright for viewing.
  const box = geo.boundingBox;
  const center = box.getCenter(new THREE.Vector3());
  geo.translate(-center.x, -center.y, -center.z);

  mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: 0x8d9099,
      roughness: 0.62,
      metalness: 0.08,
      flatShading: false,
    })
  );
  mesh.rotation.x = -Math.PI / 2;   // STL is Z-up, the viewer is Y-up
  scene.add(mesh);

  const size = box.getSize(new THREE.Vector3()).length();
  camera.position.set(size * 0.55, size * 0.45, size * 0.75);
  camera.near = size / 100;
  camera.far = size * 20;
  camera.updateProjectionMatrix();
  controls.target.set(0, 0, 0);
  controls.minDistance = size * 0.35;
  controls.maxDistance = size * 2.5;
  controls.update();
  render();
}

function load(file) {
  setNote("Loading the model");
  if (cache.has(file)) {
    show(cache.get(file));
    setNote("");
    return;
  }
  loader.load(
    "models/" + file,
    (geometry) => {
      cache.set(file, geometry);
      show(geometry);
      setNote("");
    },
    undefined,
    () => setNote("That model could not be loaded.")
  );
}

function renderPartButtons() {
  partList.innerHTML = "";
  VERSIONS[currentVersion].forEach((part, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = part.label;
    b.dataset.file = part.file;
    if (i === 0) b.classList.add("is-on");
    b.addEventListener("click", () => {
      partList.querySelectorAll("button").forEach((x) => x.classList.remove("is-on"));
      b.classList.add("is-on");
      load(part.file);
    });
    partList.appendChild(b);
  });
}

document.querySelectorAll("[data-version]").forEach((b) => {
  b.addEventListener("click", () => {
    if (b.dataset.version === currentVersion) return;
    document.querySelectorAll("[data-version]").forEach((x) => x.classList.remove("is-on"));
    b.classList.add("is-on");
    currentVersion = b.dataset.version;
    renderPartButtons();
    load(VERSIONS[currentVersion][0].file);
  });
});

// Only spin up WebGL when the popup is actually opened.
export function startViewer() {
  if (started) {
    // The canvas has no size while the dialog is closed, so it has to be
    // measured and drawn again every time the dialog reopens.
    requestAnimationFrame(() => { resize(); render(); });
    return;
  }
  started = true;
  try {
    init();
    renderPartButtons();
    load(VERSIONS[currentVersion][0].file);
  } catch (err) {
    setNote("3D preview is not available in this browser.");
  }
}
