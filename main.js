import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

// Select HTML elements
const lacesColorInput = document.getElementById('laces-color');
const soleTopColorInput = document.getElementById('sole-top-color');
const soleBottomColorInput = document.getElementById('sole-bottom-color');
const shoeColorInput = document.getElementById('shoe-color');
const resetButton = document.getElementById('reset-button');

// Add event listeners for color inputs
lacesColorInput.addEventListener('input', (event) => {
  if (laces) laces.material.color.set(event.target.value);
});

soleTopColorInput.addEventListener('input', (event) => {
  if (soleTop) soleTop.material.color.set(event.target.value);
});

soleBottomColorInput.addEventListener('input', (event) => {
  if (soleBottom) soleBottom.material.color.set(event.target.value);

  shoeColorInput.addEventListener('input', (event) => {
    if (shoeBase) shoeBase.material.color.set(event.target.value);
  });
});

 
// Add reset functionality
resetButton.addEventListener('click', () => {
  laces.material.color.set('#ffffff');
  soleTop.material.color.set('#ffffff');
  soleBottom.material.color.set('#000000');
  laces.material.map = null;
  soleTop.material.map = null;
  soleBottom.material.map = null;
});



// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5); // Position camera to focus on the shoe

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Soft ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Directional light for shadows
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// OrbitControls for interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth interaction
controls.dampingFactor = 0.1;
controls.minDistance = 2; // Minimum zoom distance
controls.maxDistance = 10; // Maximum zoom distance
controls.target.set(0, 1, 0); // Focus on the shoe model

// DracoLoader for compressed GLTF models
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/'); // Path to Draco decoder files
loader.setDRACOLoader(dracoLoader);

// Variables to store parts of the model
let laces, soleTop, soleBottom, shoeBase;

// Load the 3D shoe model
loader.load(
  '/models/Shoe_compressed.gltf',
  (gltf) => {
    const model = gltf.scene;

    // Traverse the model to find parts
    model.traverse((child) => {
      if (child.isMesh) {
        switch (child.name) {
          case 'laces':
            laces = child;
            break;
          case 'sole_top':
            soleTop = child;
            break;
          case 'sole_bottom':
            soleBottom = child;
            break;
          case 'shoe': // Verander "shoe" in de echte naam van je basismesh
            shoeBase = child;
            break;
        }
      }
    });

    // Scale the model
    model.scale.set(3, 3, 3);

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


// Responsive resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// dat.GUI setup
const gui = new dat.GUI();

// GUI Settings for ambient light
const ambientLightFolder = gui.addFolder('Ambient Light');
ambientLightFolder.add(ambientLight, 'intensity', 0, 2, 0.1).name('Intensity'); // Adjust light intensity
ambientLightFolder.open(); // Open folder by default

// GUI Settings for directional light position
const directionalLightFolder = gui.addFolder('Directional Light');
directionalLightFolder.add(directionalLight.position, 'x', -10, 10, 0.1).name('X Position');
directionalLightFolder.add(directionalLight.position, 'y', -10, 10, 0.1).name('Y Position');
directionalLightFolder.add(directionalLight.position, 'z', -10, 10, 0.1).name('Z Position');
directionalLightFolder.open(); // Open folder by default

// GUI Settings for camera position
const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(camera.position, 'z', 1, 10, 0.1).name('Zoom (Z Position)');
cameraFolder.open(); // Open folder by default

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Update OrbitControls
  renderer.render(scene, camera); // Render the scene
}
animate();
