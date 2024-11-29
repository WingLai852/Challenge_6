import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'; // Import RGBELoader

// HTML elements
const lacesColorInput = document.getElementById('laces-color');
const soleTopColorInput = document.getElementById('sole-top-color');
const soleBottomColorInput = document.getElementById('sole-bottom-color');
const shoeColorInput = document.getElementById('shoe-color');
const shoeColorInput2 = document.getElementById('shoe-color2');
const shoeColorInput3 = document.getElementById('shoe-color3'); // New color input for outside_3
const textureSelect = document.getElementById('texture-select');
const resetButton = document.getElementById('reset-button');

// Variables for shoe parts
let laces, soleTop, soleBottom, shoeBase, outside_2, outside_3;

// Load textures
const textureLoader = new THREE.TextureLoader();
const leatherTexture = textureLoader.load('/textures/leather.jpg');
const meshTexture = textureLoader.load('/textures/mesh.jpg');
const fabricTexture = textureLoader.load('/textures/fabric.jpg');

// Color change events
lacesColorInput.addEventListener('input', (event) => {
  if (laces) laces.material.color.set(event.target.value);
});

soleTopColorInput.addEventListener('input', (event) => {
  if (soleTop) soleTop.material.color.set(event.target.value);
});

soleBottomColorInput.addEventListener('input', (event) => {
  if (soleBottom) soleBottom.material.color.set(event.target.value);
});

shoeColorInput.addEventListener('input', (event) => {
  if (shoeBase) {
    shoeBase.material.map = null;
    shoeBase.material.color.set(event.target.value);
    shoeBase.material.needsUpdate = true;
  }
});

shoeColorInput2.addEventListener('input', (event) => {
  if (outside_2) {
    outside_2.material.map = null;
    outside_2.material.color.set(event.target.value);
    outside_2.material.needsUpdate = true;
  }
});

shoeColorInput3.addEventListener('input', (event) => { // New event listener for outside_3
  if (outside_3) {
    outside_3.material.map = null;
    outside_3.material.color.set(event.target.value);
    outside_3.material.needsUpdate = true;
  }
});

// Texture change event
textureSelect.addEventListener('change', (event) => {
  const texturePath = event.target.value;
  let selectedTexture = null;

  switch (texturePath) {
    case 'leather':
      selectedTexture = leatherTexture;
      break;
    case 'mesh':
      selectedTexture = meshTexture;
      break;
    case 'fabric':
      selectedTexture = fabricTexture;
      break;
    default:
      selectedTexture = null;
  }

  if (shoeBase) {
    shoeBase.material.map = selectedTexture;
    shoeBase.material.needsUpdate = true;
  }
  if (outside_2) {
    outside_2.material.map = selectedTexture;
    outside_2.material.needsUpdate = true;
  }
  if (outside_3) {
    outside_3.material.map = selectedTexture;
    outside_3.material.needsUpdate = true;
  }
});

// Reset button event
resetButton.addEventListener('click', () => {
  if (laces) laces.material.color.set('#ffffff');
  if (soleTop) soleTop.material.color.set('#ffffff');
  if (soleBottom) soleBottom.material.color.set('#000000');
  if (shoeBase) {
    shoeBase.material.map = null;
    shoeBase.material.color.set('#cccccc');
    shoeBase.material.needsUpdate = true;
  }
  if (outside_2) {
    outside_2.material.map = null;
    outside_2.material.color.set('#cccccc');
    outside_2.material.needsUpdate = true;
  }
  if (outside_3) { // Reset color for outside_3
    outside_3.material.map = null;
    outside_3.material.color.set('#cccccc');
    outside_3.material.needsUpdate = true;
  }
});

// Three.js scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(3);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Load HDR environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load('/envmap/burnt_warehouse_4k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// DracoLoader setup
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
loader.setDRACOLoader(dracoLoader);

// Load 3D model
loader.load(
  '/models/Shoe_compressed.gltf',
  (gltf) => {
    const model = gltf.scene;

    // Find parts
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
          case 'outside_1':
            shoeBase = child;
            break;
          case 'outside_2':
            outside_2 = child;
            break;
          case 'outside_3': // Add case for outside_3
            outside_3 = child;
            break;
        }
      }
    });

    model.scale.set(10, 10, 10);
    scene.add(model);
  },
  undefined,
  (error) => console.error('Model could not be loaded:', error)
);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
