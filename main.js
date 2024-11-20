import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 3); // Position camera to focus on the shoe

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.minDistance = 1;
controls.maxDistance = 10;
controls.target.set(0, 1, 0); // Focus on shoe

// DracoLoader
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/'); // Path to Draco decoder files
loader.setDRACOLoader(dracoLoader);

// Load 3D shoe model
loader.load(
  '/models/Shoe_compressed.gltf',
  (gltf) => {
    const model = gltf.scene;

    // Scale the model
    model.scale.set(3, 3, 3); // Scale (x, y, z)

    // Add the model to the scene
    scene.add(model);

    console.log('Model loaded successfully.');
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  (error) => {
    console.error('Error loading model:', error);
  }
);

// dat.GUI setup
const gui = new dat.GUI({ width: 300 }); // Initialize GUI
const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(camera.position, 'x', -10, 10, 0.1).name('X Position');
cameraFolder.add(camera.position, 'y', -10, 10, 0.1).name('Y Position');
cameraFolder.add(camera.position, 'z', -10, 10, 0.1).name('Z Position');
cameraFolder.open(); // Open the folder by default

const lightFolder = gui.addFolder('Lighting');
lightFolder.add(directionalLight.position, 'x', -10, 10, 0.1).name('Light X');
lightFolder.add(directionalLight.position, 'y', -10, 10, 0.1).name('Light Y');
lightFolder.add(directionalLight.position, 'z', -10, 10, 0.1).name('Light Z');
lightFolder.add(ambientLight, 'intensity', 0, 2, 0.1).name('Ambient Intensity');
lightFolder.add(directionalLight, 'intensity', 0, 2, 0.1).name('Directional Intensity');
lightFolder.open();

// Responsive window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Update OrbitControls
  renderer.render(scene, camera); // Render the scene
}
animate();
