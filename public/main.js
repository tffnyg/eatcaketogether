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

// ----------- CAKE FLAVOURS ------------
const cakeFLAVOURS = {
  strawberry: {
    sponge: 0xE6D39A,
    cream: 0xE0A8A8,
    frosting: 0xFCFBF7,
    berry: 0xD93848,
    plateRim: 0x6E4229,
    hasDollop: true,
    hasBerry: true,
  },

  chocolate: {
    sponge: 0x573027,
    cream: 0x9E7955,
    frosting: 0x9E7955,
    plateRim: 0x114180,
    hasDollop: true,
    hasBerry: false,
  },

  pistachio: {
    sponge: 0xE8F8B0,
    cream: 0x8F2150,
    frosting: 0xF7DCE7,
    berry: 0x991828,
    plateRim: 0x3D5233,
    hasDollop: false,
    hasBerry: true,
  }
}


// -----PLATE with crumbs! Gemini updated the plate code in full ------------------
const plateColor = 0xFCFBF0;
const plateRimColor = cakeFLAVOURS.strawberry.plateRim;

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

const NumofCrumbs = Math.floor(Math.random() * 7) + 4;
console.log(NumofCrumbs);

for (let i = 0; i < NumofCrumbs; i++) {
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
function createCakeLayer(zFront, zBack, xLeftFront, xRightFront, xLeftBack, xRightBack, height, material) {

  // 1. Draw the 4 corners of the flat wedge, Gemini
  const shape = new THREE.Shape();
  shape.moveTo(xLeftFront, -zFront);
  shape.lineTo(xRightFront, -zFront);
  shape.lineTo(xRightBack, -zBack);
  shape.lineTo(xLeftBack, -zBack);
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

function createBitePair(zFront, zBack, xLeftFront, xRightFront, xLeftBack, xRightBack) {
  // Bottom layer (0.03 -> 0.33)
  const bottomSponge = createCakeLayer(zFront, zBack, xLeftFront, xRightFront, xLeftBack, xRightBack, 0.30, spongeMat);
  bottomSponge.position.y = 0.03;
  const filling = createCakeLayer(zFront, zBack, xLeftFront, xRightFront, xLeftBack, xRightBack, 0.09, creamMat);
  filling.position.y = 0.33;
  const bottomChunk = new THREE.Group();
  bottomChunk.add(bottomSponge, filling);

  // Top layer (0.42 -> 0.72 -> 0.83)
  const topSponge = createCakeLayer(zFront, zBack, xLeftFront, xRightFront, xLeftBack, xRightBack, 0.30, spongeMat);
  topSponge.position.y = 0.42;
  const frosting = createCakeLayer(zFront, zBack, xLeftFront, xRightFront, xLeftBack, xRightBack, 0.11, frostingMat);
  frosting.position.y = 0.72;
  const topChunk = new THREE.Group();
  topChunk.add(topSponge, frosting);

  return { topChunk, bottomChunk };
}

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

let dollopMesh;
let berry;

// for loop to create the bite sections, Gemini Code but bulit block by block (guided)
for (let i = 0; i < 5; i++) {
  const zFront = 1.1 - i * 0.39;
  const zBack = 1.1 - (i + 1) * 0.39;
  const wFront = i * 0.15;
  const wBack = (i + 1) * 0.15;

  if (i < 4) {
    // Sections 0–3: Full-width bites (-w to +w)
    const { topChunk, bottomChunk } = createBitePair(zFront, zBack, -wFront, wFront, -wBack, wBack);
    biteChunks.push(topChunk, bottomChunk);
    cakeGroup.add(topChunk, bottomChunk);
  } else {
    // Section 4: Split into Left half (-w to 0) and Right half (0 to +w)
    const left = createBitePair(zFront, zBack, -wFront, 0, -wBack, 0);
    const right = createBitePair(zFront, zBack, 0, wFront, 0, wBack);

    // Piped dollop & berry -- biteChunks[8]
    const extrasGroup = new THREE.Group();
    // dollop
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
    dollopMesh = new THREE.Mesh(dollopGeo, frostingMat);
    dollopMesh.position.set(0, 0.83, -0.48);
    extrasGroup.add(dollopMesh);

    // berry
    berry = new THREE.Mesh(new THREE.SphereGeometry(0.135, 24, 24), berryMat);
    berry.scale.set(1, 1.15, 1);
    const berryY = hasDollop ? 1.07 : 0.94;
    berry.position.set(0, berryY, -0.48);
    extrasGroup.add(berry);


    // Angled back frosting wall split into Left and Right halves
    const backCreamThickness = 0.08;
    const zCreamBack = -0.85 - backCreamThickness;
    const wCreamBack = 0.75 + (backCreamThickness * 0.385);

    const backCreamLeftTop = createCakeLayer(-0.8501, zCreamBack, -0.75, 0, -wCreamBack, 0, 0.4102, frostingMat);
    backCreamLeftTop.position.y = 0.4199;
    left.topChunk.add(backCreamLeftTop);

    const backCreamLeftBottom = createCakeLayer(-0.8501, zCreamBack, -0.75, 0, -wCreamBack, 0, 0.40, frostingMat);
    backCreamLeftBottom.position.y = 0.03;
    left.bottomChunk.add(backCreamLeftBottom);

    const backCreamRightTop = createCakeLayer(-0.8501, zCreamBack, 0, 0.75, 0, wCreamBack, 0.4102, frostingMat);
    backCreamRightTop.position.y = 0.4199;
    right.topChunk.add(backCreamRightTop);

    const backCreamRightBottom = createCakeLayer(-0.8501, zCreamBack, 0, 0.75, 0, wCreamBack, 0.40, frostingMat);
    backCreamRightBottom.position.y = 0.03;
    right.bottomChunk.add(backCreamRightBottom);

    if (hasDollop || hasBerry) {
      biteChunks.push(extrasGroup);
      cakeGroup.add(extrasGroup);
    }

    biteChunks.push(left.topChunk, left.bottomChunk, right.topChunk, right.bottomChunk);
    cakeGroup.add(left.topChunk, left.bottomChunk, right.topChunk, right.bottomChunk);
  }
}
// end for loop for cake layers

scene.add(cakeGroup);
// biteChunks[9].visible = false; - test bites

// Put applyCakeFlavor right here!
function applyCakeFlavor(flavorKey) {
  const flavor = cakeFLAVOURS[flavorKey] || cakeFLAVOURS.strawberry; // strawberry is default

  spongeMat.color.setHex(flavor.sponge);
  creamMat.color.setHex(flavor.cream);
  frostingMat.color.setHex(flavor.frosting);
  if (flavor.berry) berryMat.color.setHex(flavor.berry);
  outerRimMat.color.setHex(flavor.plateRim);

  if (dollopMesh) dollopMesh.visible = flavor.hasDollop;
  if (berry) {
    berry.visible = flavor.hasBerry;
    berry.position.y = flavor.hasDollop ? 1.07 : 0.94;
  }
}

// Optional 1-line test (delete or comment out after testing):
applyCakeFlavor('strawberry');

// ----- CAKE END ----------------------------------------------------

// ----- JELLY WOBBLE PHYSICS (s3-7), Gemini ----------------------------------
let wobblePos = 0;      // Current vertical stretch/squash offset
let wobbleVel = 0;      // Current bounce speed
const stiffness = 220;  // Higher = snappier jiggle
const damping = 16;     // Higher = settles faster

function pokeCake(strength = -2.2) {
  wobbleVel += strength; // Negative pushes the cake down so it rebounds up
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let isHoveringCake = false;

function checkCakeHit(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  // Only check visible cake chunks
  const hits = raycaster.intersectObjects(cakeGroup.children, true)
    .filter(hit => hit.object.visible && hit.object.parent?.visible !== false);
  return hits.length > 0;
}

window.addEventListener('pointermove', (e) => {
  const hovering = checkCakeHit(e);
  if (hovering && !isHoveringCake) {
    pokeCake(-0.5); // Subtle jiggle when your cursor brushes the cake
  }
  isHoveringCake = hovering;
  document.body.style.cursor = hovering ? 'pointer' : 'default';
});

window.addEventListener('pointerdown', (e) => {
  if (checkCakeHit(e)) {
    pokeCake(-2.0); // Juicy bounce when poked/clicked
  }
});

// SETUP 7. Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// SETUP 8. Animation Loop
let lastTime = performance.now();
let lastAzimuth = controls.getAzimuthalAngle();

function animate(now = performance.now()) {
  requestAnimationFrame(animate);
  controls.update();
  // testBox.rotation.y += 0.01;

  //JELLY PHYSICS ANIMATION, Gemini
  // Cap dt at 0.05s so switching browser tabs never explodes the spring
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  // Hooke's law spring + damping
  const force = -stiffness * wobblePos - damping * wobbleVel;
  wobbleVel += force * dt;
  wobblePos += wobbleVel * dt;

  // Squash Y, widen X & Z slightly to preserve volume
  const scaleY = 1 + wobblePos;
  const scaleXZ = 1 - wobblePos * 0.45;
  cakeGroup.scale.set(scaleXZ, scaleY, scaleXZ);

  //JELLY PHYSICS ANIMATION - Camera Orbit, Gemini 
  // Subtle jiggle when orbiting the camera around the plate
  const currentAzimuth = controls.getAzimuthalAngle();
  let deltaAngle = currentAzimuth - lastAzimuth;
  // Handle wrap-around at +PI / -PI so spinning past 180° doesn't cause a sudden spike
  if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
  if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
  lastAzimuth = currentAzimuth;

  const orbitSpeed = Math.abs(deltaAngle) / Math.max(dt, 0.001);
  if (orbitSpeed > 0.15) {
    wobbleVel -= Math.min(orbitSpeed * 0.15, 0.9) * dt * 12;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// ThreeJS setup, credit: Gemini END