// ThreeJS setup, credit: Gemini 
import * as THREE from 'three';

//add Controls (Camera)
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// SETUP 1. Grab your container
const container = document.getElementById('ThreeJSCanvas');

// SETUP 2. Scene (leave scene.background null so it stays transparent)
const scene = new THREE.Scene();

// SETUP 3. Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(4.5, 2, 2);
camera.lookAt(0, 0.4, 0);

// SETUP 4. Transparent Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

//Camera Controls, credit: Gemini
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.4, 0); // Orbit around the center of the cake
controls.enableDamping = true;   // Smooth, weighted inertia when dragging
controls.enablePan = false;      // Keeps the plate centered on screen
controls.minDistance = 2.5;      // Prevent zooming inside the cake
controls.maxDistance = 8.5;      // Prevent zooming too far away
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Stop camera from going under the table

// SETUP 5. Warm Cafe Lighting
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

// -----PLATE with crumbs! Gemini Guidance + beginner Code ------------------
const plateMat = new THREE.MeshStandardMaterial({ color: 0xFCFBF0, roughness: 0.25 });
const outerRimMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.65, 0.08, 48), plateMat);
const innerBaseMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.09, 48), plateMat);
innerBaseMesh.position.y = 0.02;


// --- render plate onto scene
let plateGroup = new THREE.Group();
plateGroup.add(outerRimMesh);
plateGroup.add(innerBaseMesh);

// CRUMBS
const crumbGeo = new THREE.DodecahedronGeometry(0.03, 0);
let crumbColour = 0xD9A773;
const crumbMat = new THREE.MeshStandardMaterial({ color: crumbColour, roughness: 0.9 });
let crumbs = [];

const NumofCrumbs = Math.floor(Math.random()*7) +4; 
console.log(NumofCrumbs);

 for (let i=0; i < NumofCrumbs; i++) {
  const crumb = new THREE.Mesh(crumbGeo, crumbMat);
  const x = (Math.random() - 0.5) * 0.8;
  const z = (Math.random() - 0.5) * 0.8;
  crumb.position.set(x, 0.075, z);

  plateGroup.add(crumb);
  crumbs.push(crumb);
  crumb.visible = false; //boolean toogle crumbs visibility 
}

scene.add(plateGroup);
// ----- end PLATE + CRUMBS ----------------------------------


// ----- CAKE BASE ------------------------------------------------
function createCakeLayer(zFront, zBack, wFront, wBack, height, material) {
  // 1. Draw the 4 corners of the flat wedge, Gemini
  const shape = new THREE.Shape();
  shape.moveTo(-wFront, -zFront);
  shape.lineTo(wFront, -zFront);
  shape.lineTo(wBack, -zBack);
  shape.lineTo(-wBack, -zBack);
  shape.closePath();

  // 2. Give the flat shape 3D thickness (height), Gemini
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false
  });

  // 3. Lay it flat on the table (by default extrusions stand up like a wall), Gemini
  geometry.rotateX(-Math.PI / 2);

  // 4. Combine shape + material into a Mesh (just like your plate!), Gemini
  return new THREE.Mesh(geometry, material);
}

const spongeMat = new THREE.MeshStandardMaterial({ color: 0xF5D59C, roughness: 0.8 });
const creamMat = new THREE.MeshStandardMaterial({ color: 0xFFFDF8, roughness: 0.5 });
const frostingMat = new THREE.MeshStandardMaterial({ color: 0xF28B9C, roughness: 0.4 });

const cakeGroup = new THREE.Group();
const biteChunks = [];

// for loop to create the bite sections, Gemini Code but bulit block by block (guided)
for(let i = 0; i < 5; i++){
  const zFront = 0.9 - i* 0.36;
  const zBack = 0.9 - (i + 1)* 0.36; 
  const wFront = i* 0.144; 
  const wBack = (i + 1)* 0.144;
 
  // bulid bottom up 
  // bottom layer
  const bottomSponge = createCakeLayer(zFront, zBack, wFront, wBack, 0.22, spongeMat);
  bottomSponge.position.y = 0.065;
  const filling = createCakeLayer(zFront, zBack, wFront, wBack, 0.08, creamMat);
  filling.position.y = 0.285;
  const bottomChunk = new THREE.Group();
  bottomChunk.add(bottomSponge, filling);

  // top layer
  const topSponge = createCakeLayer(zFront, zBack, wFront, wBack, 0.22, spongeMat);
  topSponge.position.y = 0.365;
  const frosting = createCakeLayer(zFront, zBack, wFront, wBack, 0.09, frostingMat);
  frosting.position.y = 0.585;
  const topChunk = new THREE.Group();
  topChunk.add(topSponge, frosting); 

  biteChunks.push(topChunk, bottomChunk);
  cakeGroup.add(topChunk, bottomChunk);
}
// end for loop for cake layers

scene.add(cakeGroup);
//biteChunks[3].visible = false; -test bites

// ----- CAKE END ----------------------------------------------------


// SETUP 7. Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// SETUP 8. Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  // testBox.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

// ThreeJS setup, credit: Gemini END