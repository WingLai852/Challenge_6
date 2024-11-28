import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// HTML-elementen ophalen
const lacesColorInput = document.getElementById('laces-color');
const soleTopColorInput = document.getElementById('sole-top-color');
const soleBottomColorInput = document.getElementById('sole-bottom-color');
const shoeColorInput = document.getElementById('shoe-color');
const textureSelect = document.getElementById('texture-select');
const resetButton = document.getElementById('reset-button');

// Variabelen voor schoenonderdelen
let laces, soleTop, soleBottom, shoeBase;

// Texturen laden
const textureLoader = new THREE.TextureLoader();
const leatherTexture = textureLoader.load('/textures/leather.jpg');
const meshTexture = textureLoader.load('/textures/mesh.jpg');
const fabricTexture = textureLoader.load('/textures/fabric.jpg');



// Kleurwijzigingen
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
    shoeBase.material.map = null; // Verwijder huidige textuur
    shoeBase.material.color.set(event.target.value); // Pas kleur aan
    shoeBase.material.needsUpdate = true;
  }
});

// Textuurwijzigingen
textureSelect.addEventListener('change', (event) => {
  if (shoeBase) {
    switch (event.target.value) {
      case 'leather':
        shoeBase.material.map = leatherTexture;
        break;
      case 'mesh':
        shoeBase.material.map = meshTexture;
        break;
      case 'fabric':
        shoeBase.material.map = fabricTexture;
        break;
      default:
        shoeBase.material.map = null; // Geen textuur
    }
    shoeBase.material.needsUpdate = true;
  }
});

// Reset alle instellingen
resetButton.addEventListener('click', () => {
  if (laces) laces.material.color.set('#ffffff');
  if (soleTop) soleTop.material.color.set('#ffffff');
  if (soleBottom) soleBottom.material.color.set('#000000');
  if (shoeBase) {
    shoeBase.material.map = null; // Verwijder textuur
    shoeBase.material.color.set('#cccccc'); // Standaard kleur
    shoeBase.material.needsUpdate = true;
  }
});

// Three.js scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Environment map
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMap = cubeTextureLoader.load([
  '/envmap/px.png',
  '/envmap/nx.png',
  '/envmap/py.png',
  '/envmap/ny.png',
  '/envmap/pz.png',
  '/envmap/nz.png',
]);
scene.environment = environmentMap;
scene.background = environmentMap;

// Verlichting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// DracoLoader instellen
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
loader.setDRACOLoader(dracoLoader);

// Laad 3D-model
loader.load(
  '/models/Shoe_compressed.gltf',
  (gltf) => {
    const model = gltf.scene;

    // Zoek onderdelen
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
        }
      }
    });

    model.scale.set(10, 10, 10);
    scene.add(model);
  },
  undefined,
  (error) => console.error('Model kon niet geladen worden:', error)
);


// Animatie loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
