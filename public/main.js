// ThreeJS setup, credit: Gemini START ----------
import * as THREE from 'three';

// 1. Grab your container
const container = document.getElementById('ThreeJSCanvas');

// 2. Scene (leave scene.background null so it stays transparent)
const scene = new THREE.Scene();

// 3. Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3.2, 5.2);
camera.lookAt(0, 0.4, 0);

// 4. Transparent Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 5. Warm Cafe Lighting
const hemiLight = new THREE.HemisphereLight(0xFFF8E7, 0x8C6D53, 1.1);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xFFE6C2, 1.4);
dirLight.position.set(4, 7, 5);
scene.add(dirLight);

// // 6. Temporary Test Cube (to verify layering)
// const testBox = new THREE.Mesh(
//   new THREE.BoxGeometry(1, 1, 1),
//   new THREE.MeshStandardMaterial({ color: 0xD94E5A })
// );
// testBox.position.y = 0.5;
// scene.add(testBox);

// --- add PLATE with crumbs! Gemini Guidance + beginner Code
const plateMat = new THREE.MeshStandardMaterial({ color: 0xFCFBF0, roughness: 0.25 });
const outerRimMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.65, 0.08, 48), plateMat);
const innerBaseMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.09, 48), plateMat);
innerBaseMesh.position.y = 0.02;


// --- render plate onto scene
let plateGroup = new THREE.Group();
plateGroup.add(outerRimMesh);
plateGroup.add(innerBaseMesh);

// crumbs
const crumbGeo = new THREE.DodecahedronGeometry(0.03, 0);
let crumbColour = 0xD9A773;
const crumbMat = new THREE.MeshStandardMaterial({ color: crumbColour, roughness: 0.9 });
let crumbs = [];

for (let i=0; i < 5; i++) {
  const crumb = new THREE.Mesh(crumbGeo, crumbMat);
  const x = (Math.random() - 0.5) * 0.8;
  const z = (Math.random() - 0.5) * 0.8;
  crumb.position.set(x, 0.075, z);

  plateGroup.add(crumb);
  crumbs.push(crumb);
  crumb.visible = true; //boolean toogle crumbs visibility 
}

scene.add(plateGroup);
// --- end PLATE + crumbs


// 7. Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 8. Animation Loop
function animate() {
  requestAnimationFrame(animate);
  // testBox.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

// ThreeJS setup, credit: Gemini END ----------