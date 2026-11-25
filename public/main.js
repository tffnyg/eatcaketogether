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

// 6. Temporary Test Cube (to verify layering)
const testBox = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xD94E5A })
);
testBox.position.y = 0.5;
scene.add(testBox);

// 7. Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 8. Animation Loop
function animate() {
  requestAnimationFrame(animate);
  testBox.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

// ThreeJS setup, credit: Gemini END ----------