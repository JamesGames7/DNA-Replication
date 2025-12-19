import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const colours = [
    0xff0000,
    0x00ff00,
    0x0000ff,
    0xffff00
]

const basePairs = {
    '0xff0000': 0x00ff00,
    '0x00ff00': 0xff0000,
    '0x0000ff': 0xffff00,
    '0xffff00': 0x0000ff,
    0xff0000: 0x00ff00,
    0x00ff00: 0xff0000,
    0x0000ff: 0xffff00,
    0xffff00: 0x0000ff
}

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

// Pair setup
const Pairs = new THREE.Group();
DNAGroup.traverse(function (group) {
    if (group.isGroup) {
        let material;
        for (let i = 0; i < group.children.length; i++) {
            if (group.children[i].isMesh && group.children[i].material) {
                material = group.children[i].material;
            }
        }
        if (material) {
            const colour = '0x' + material.color.getHexString();
            Pairs.add(makeDNA(group.position.x, group.rotation.x - Math.PI, basePairs[colour]));
        }
    }
})
scene.add(Pairs);

const coneMaterial = new THREE.MeshStandardMaterial({color: 0xff5500});
const coneGeo = new THREE.ConeGeometry(4, 4, 32);
const helicase = new THREE.Mesh(coneGeo, coneMaterial);
helicase.rotation.z = Math.PI / 2;
helicase.position.x = 44;
scene.add(helicase);

const splitDNA = new THREE.Group();
const splitDNAPair = new THREE.Group();
scene.add(splitDNA);
scene.add(splitDNAPair);

const tick = () => {
    renderer.render(scene, camera);

    DNAGroup.rotation.x -= Math.PI / 96;
    Pairs.rotation.x -= Math.PI / 96;
    DNAGroup.position.x += 0.04;
    Pairs.position.x += 0.04;
    splitDNA.position.x += 0.04;
    splitDNAPair.position.x += 0.04;

    for (let i = 0; i < DNAGroup.children.length + splitDNA.children.length; i++) {
        if (DNAGroup.children.length > i) {
            const child = DNAGroup.children[i];
            const pairChild = Pairs.children[i];
            if (child.position.x + DNAGroup.position.x >= helicase.position.x - 3) {
                splitDNA.add(child);
                splitDNAPair.add(pairChild);
                child.rotation.x = Math.PI / 16;
                pairChild.rotation.x = Math.PI / 16 - Math.PI;
            }
        } else {
            const child = splitDNA.children[i - DNAGroup.children.length]
            const pairChild = splitDNAPair.children[i - DNAGroup.children.length]
            if (child.position.x + DNAGroup.position.x > 44) {
                splitDNA.remove(child);
                splitDNAPair.remove(pairChild);
                const colour = colours[Math.floor(Math.random() * 4)];
                DNAGroup.add(makeDNA(-44 - splitDNA.position.x, rot, colour))
                Pairs.add(makeDNA(-44 - Pairs.position.x, rot - Math.PI, basePairs[colour]))
                rot += Math.PI / 8;
            }
            if (child.position.y < 20) {
                child.position.y += 0.4;
                pairChild.position.y -= 0.4;
            }
        }
    }

    let target = -1 * Math.PI / 3;

    if ((DNAGroup.rotation.x < target + 1/6 && DNAGroup.rotation.x > target - 1/6) || helicase.position.x < 44) {
        helicase.position.x -= 0.1275;
    }

    window.requestAnimationFrame(tick);
}
tick();

function makeDNA(xPos, rot, colour) {
    const material = new THREE.MeshStandardMaterial( { color: colour } );

    let geometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 32);
    const cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.y = 2.5;

    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 5, 0), new THREE.Vector3(-1, 5, 0.96), new THREE.Vector3(-2, 4.635, 1.92));
    const curveGeometry = new THREE.TubeGeometry(curve, 20, 0.5, 8, false);
    const curveMaterial = new THREE.LineBasicMaterial( { color: 0x555555 } );
    const tube = new THREE.Mesh(curveGeometry, curveMaterial);

    const nucleotide = new THREE.Group();
    nucleotide.add(tube);
    nucleotide.add(cylinder);

    nucleotide.position.x = xPos;
    nucleotide.rotation.x = rot

    return nucleotide;
}