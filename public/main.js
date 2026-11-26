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

// -----PLATE with crumbs! Gemini updated the plate code in full ------------------
const plateColor = 0xFCFBF0;
const plateRimColor = 0x6E4229; // <-- Change this variable anytime to recolor the outer rim!

const plateMat = new THREE.MeshStandardMaterial({ color: plateColor, roughness: 0.25 });
const outerRimMat = new THREE.MeshStandardMaterial({ color: plateRimColor, roughness: 0.35 });

// 2D cross-section spun 360° around the Y-axis
const platePoints = [
  new THREE.Vector2(0.00, 0.00), // Center bottom
  new THREE.Vector2(1.45, 0.00), // Outer bottom foot
  new THREE.Vector2(1.95, 0.09), // Outer sloped rim edge
  new THREE.Vector2(1.88, 0.10), // Outer rounded rim lip
  new THREE.Vector2(1.46, 0.045), // Base of outer rim slope
  new THREE.Vector2(1.40, 0.065), // Inner rim ridge peak
  new THREE.Vector2(1.34, 0.03),  // Inner sunken well edge
  new THREE.Vector2(0.00, 0.03)   // Center of sunken well floor
];

const plateGeo = new THREE.LatheGeometry(platePoints, 64);
const plateMesh = new THREE.Mesh(plateGeo, plateMat);

// Dark outer rim ring hugging the outer lip (radius 1.915, height 0.095)
const outerRimGeo = new THREE.TorusGeometry(1.915, 0.02, 16, 64);
const outerRimMesh = new THREE.Mesh(outerRimGeo, outerRimMat);
outerRimMesh.rotation.x = Math.PI / 2;
outerRimMesh.position.y = 0.095;

// --- render plate onto scene
let plateGroup = new THREE.Group();
plateGroup.add(plateMesh);
plateGroup.add(outerRimMesh); // Gemini added outerRim (coloured)


// CRUMBS
const crumbGeo = new THREE.DodecahedronGeometry(0.03, 0);
let crumbColour = 0xD9A773;
const crumbMat = new THREE.MeshStandardMaterial({ color: crumbColour, roughness: 0.9 });
let crumbs = [];

const NumofCrumbs = Math.floor(Math.random()*7) +4; 
console.log(NumofCrumbs);

 for (let i=0; i < NumofCrumbs; i++) {
  const crumb = new THREE.Mesh(crumbGeo, crumbMat);
  const x = (Math.random() - 0.5) * 0.85;
  const z = (Math.random() - 0.5) * 1.1 + 0.125;
  crumb.position.set(x, 0.045, z);

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

//change cake layer colours
let spongeColour = 0xF5D59C;
let creamColour = 0xFFFDF8;
let frostingColour = 0xF28B9C;

// Garnish toggles & berry color (easy to swap per cake flavor!), Gemini
let hasDollop = true;
let hasBerry = true;
let berryColour = 0xD93848;

const berryMat = new THREE.MeshStandardMaterial({ color: berryColour, roughness: 0.25 });

const spongeMat = new THREE.MeshStandardMaterial({ color: spongeColour, roughness: 0.8 });
const creamMat = new THREE.MeshStandardMaterial({ color: creamColour, roughness: 0.5 });
const frostingMat = new THREE.MeshStandardMaterial({ color: frostingColour, roughness: 0.4 });

const cakeGroup = new THREE.Group();
const biteChunks = [];

// for loop to create the bite sections, Gemini Code but bulit block by block (guided)
for(let i = 0; i < 5; i++){
  const zFront = 1.1 - i* 0.39;
  const zBack = 1.1 - (i + 1)* 0.39; 
  const wFront = i* 0.15; 
  const wBack = (i + 1)* 0.15;
 
  // bulid bottom up 
  // bottom layer
  const bottomSponge = createCakeLayer(zFront, zBack, wFront, wBack, 0.30, spongeMat);
  bottomSponge.position.y = 0.03;
  const filling = createCakeLayer(zFront, zBack, wFront, wBack, 0.10, creamMat);
  filling.position.y = 0.33;
  const bottomChunk = new THREE.Group();
  bottomChunk.add(bottomSponge, filling);

  // top layer
  const topSponge = createCakeLayer(zFront, zBack, wFront, wBack, 0.3, spongeMat);
  topSponge.position.y = 0.42;
  const frosting = createCakeLayer(zFront, zBack, wFront, wBack, 0.11, frostingMat);
  frosting.position.y = 0.72;
  const topChunk = new THREE.Group();
  topChunk.add(topSponge, frosting); 

  /// Back crust frosting wall & optional top garnishes (section 4), Gemini
  if (i === 4) {
    // 1. Angled back frosting wall matching the slice's flare
    const backCreamThickness = 0.08;
    const zCreamBack = -0.85 - backCreamThickness;
    const wCreamBack = 0.75 + (backCreamThickness * 0.385);

    const backCreamTop = createCakeLayer(-0.85, zCreamBack, 0.75, wCreamBack, 0.41, frostingMat);
    backCreamTop.position.y = 0.42;
    topChunk.add(backCreamTop);

    const backCreamBottom = createCakeLayer(-0.85, zCreamBack, 0.75, wCreamBack, 0.40, frostingMat);
    backCreamBottom.position.y = 0.03;
    bottomChunk.add(backCreamBottom);

    // 2. Smooth, round whipped-cream dollop
    if (hasDollop) {
      const dollopProfile = [
        new THREE.Vector2(0.00, 0.00),
        new THREE.Vector2(0.20, 0.00),
        new THREE.Vector2(0.22, 0.05),
        new THREE.Vector2(0.18, 0.11),
        new THREE.Vector2(0.09, 0.16),
        new THREE.Vector2(0.02, 0.20),
        new THREE.Vector2(0.00, 0.21)
      ];
      const dollopGeo = new THREE.LatheGeometry(dollopProfile, 32);
      const dollopMesh = new THREE.Mesh(dollopGeo, creamMat);
      dollopMesh.position.set(0, 0.83, -0.48);

      topChunk.add(dollopMesh);
    }

    // 3. Larger, plumper berry
    if (hasBerry) {
      const berry = new THREE.Mesh(new THREE.SphereGeometry(0.135, 24, 24), berryMat);
      berry.scale.set(1, 1.15, 1);
      const berryY = hasDollop ? 1.07 : 0.94;
      berry.position.set(0, berryY, -0.48);

      topChunk.add(berry);
    }
  }

  biteChunks.push(topChunk, bottomChunk);
  cakeGroup.add(topChunk, bottomChunk);
}
// end for loop for cake layers

scene.add(cakeGroup);
biteChunks[8].visible = false; 

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