import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const colours = [
    0xff0000,
    0x00ff00,
    0x0000ff,
    0xffff00
]

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xefefff);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 10);
scene.add(light);

// Camera
const camera = new THREE.OrthographicCamera(-40, 40, 30, -30);
camera.position.z = 50;
scene.add(camera);

// Canvas
const canvas = document.querySelector('#scene');

// Renderer
const renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setSize(800, 600);

// Initial setup
var rot = 0;
const DNAGroup = new THREE.Group();
for (let x = 44; x > -44; x -= 2) {
    DNAGroup.add(makeDNA(x, rot, colours[Math.floor(Math.random() * 4)]));
    rot += Math.PI / 8;
}
scene.add(DNAGroup);

const tick = () => {
    renderer.render(scene, camera);

    DNAGroup.rotation.x -= 0.01;
    DNAGroup.position.x += 0.03;

    for (let i = 0; i < DNAGroup.children.length; i++) {
        const child = DNAGroup.children[i];
        if (child.position.x + DNAGroup.position.x > 44) {
            DNAGroup.remove(child);
            DNAGroup.add(makeDNA(-44 - DNAGroup.position.x, rot, colours[Math.floor(Math.random() * 4)]))
            rot += Math.PI / 8;
        }
    }

    window.requestAnimationFrame(tick);
}
tick();

function makeDNA(xPos, rot, colour) {
    const material = new THREE.MeshStandardMaterial( { color: colour } );

    // Geometry
    let geometry = new THREE.SphereGeometry( 1, 32, 32 );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.y = 10;

    geometry = new THREE.CylinderGeometry(0.5, 0.5, 10, 32);
    const cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.y = 5;

    const nucleotide = new THREE.Group();
    nucleotide.add(sphere);
    nucleotide.add(cylinder);

    nucleotide.position.x = xPos;
    nucleotide.rotation.x = rot

    return nucleotide;
}