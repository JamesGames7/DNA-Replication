import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LatheGeometry, Line2NodeMaterial, Vector2 } from 'three/webgpu';

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

const leadingNucleotides = [];

const laggingPrimers = [];

var nucleotidePoints = [];

var pairPoints = [];

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
    DNAGroup.add(makeDNA(x, rot, colours[Math.floor(Math.random() * 4)], false));
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
            Pairs.add(makeDNA(group.position.x, group.rotation.x - Math.PI, basePairs[colour], true));
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

const splitDNANew = new THREE.Group();
const splitDNAPairNew = new THREE.Group();
splitDNANew.position.y = 15
splitDNAPairNew.position.y = -15
scene.add(splitDNANew);
scene.add(splitDNAPairNew);

const nucleotideLineGeometry = new LineGeometry();
const pairLineGeometry = new LineGeometry();
nucleotideLineGeometry.setFromPoints(nucleotidePoints)
pairLineGeometry.setFromPoints(pairPoints);
const material = new LineMaterial( { linewidth: 15, color: 0x555555 } );
const line = new Line2( nucleotideLineGeometry, material );
const pairLine = new Line2( pairLineGeometry, material );
scene.add( line );
scene.add( pairLine );

const topoisomeraseGeometry = new THREE.TorusGeometry(6, 1, 16, 100);
const TIMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
const topoisomerase = new THREE.Mesh( topoisomeraseGeometry, TIMaterial );
topoisomerase.rotation.y = Math.PI / 2;
topoisomerase.position.y = 50
topoisomerase.position.z = 50;
scene.add(topoisomerase);

const primerBase = new THREE.Group();
primerBase.add(makeNewDNA(0, 0xff00ff, true)[0]);
primerBase.add(makeNewDNA(0, 0xff00ff, true)[1]);
primerBase.add(makeNewDNA(2, 0xff00ff)[0]);
let leadPrimer = primerBase.clone();
leadPrimer.position.x = 42;
leadPrimer.position.y = -15;
let targetLead;
scene.add(leadPrimer);

const leadTop = new THREE.Group();
leadTop.position.y = 15
scene.add(leadTop)

const DNAPol3Geo = new THREE.LatheGeometry([
    new THREE.Vector2(3.5, 0),
    new THREE.Vector2(4.4, 1),
    new THREE.Vector2(4.8, 2),
    new THREE.Vector2(4.9, 3),
    new THREE.Vector2(4.8, 4),
    new THREE.Vector2(4.5, 5),
    new THREE.Vector2(4.2, 6),
    new THREE.Vector2(3.7, 7),
    new THREE.Vector2(3.5, 8),
    new THREE.Vector2(3.6, 9),
    new THREE.Vector2(3.8, 10),
    new THREE.Vector2(4.1, 11),
    new THREE.Vector2(4.2, 12),
    new THREE.Vector2(4, 13),
]);
const DNAPol3Mat = new THREE.MeshStandardMaterial({color: 0x770077});
const DNAPol3 = new THREE.Mesh(DNAPol3Geo, DNAPol3Mat);
DNAPol3.rotation.z = Math.PI / 2
DNAPol3.position.y = 20.15
DNAPol3.position.x = 60
DNAPol3.scale.x = 1.9
scene.add(DNAPol3)

const tick = () => {
    renderer.render(scene, camera);

    DNAGroup.rotation.x -= Math.PI / 96;
    Pairs.rotation.x -= Math.PI / 96;
    DNAGroup.position.x += 0.04;
    Pairs.position.x += 0.04;
    splitDNA.position.x += 0.04;
    splitDNAPair.position.x += 0.04;
    splitDNANew.position.x += 0.04;
    if (leadTop) leadTop.position.x += 0.04;
    splitDNAPairNew.position.x += 0.04;
    nucleotidePoints = [];
    pairPoints = [];

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
            nucleotidePoints.push(child.children[0].getWorldPosition(new THREE.Vector3()))
            pairPoints.push(pairChild.children[0].getWorldPosition(new THREE.Vector3()))
        } else {
            const child = splitDNA.children[i - DNAGroup.children.length]
            const pairChild = splitDNAPair.children[i - DNAGroup.children.length]
            if (child.position.x + DNAGroup.position.x > 44) {
                splitDNA.remove(child);
                splitDNAPair.remove(pairChild);
                const colour = colours[Math.floor(Math.random() * 4)];
                DNAGroup.add(makeDNA(-44 - splitDNA.position.x, rot, colour, false))
                Pairs.add(makeDNA(-44 - Pairs.position.x, rot - Math.PI, basePairs[colour], true))
                rot += Math.PI / 8;
            }
            if (child.position.y < 20) {
                child.position.y += 0.2;
                pairChild.position.y -= 0.2;
            }
            pairPoints.push(pairChild.children[0].getWorldPosition(new THREE.Vector3()))
            nucleotidePoints.push(child.children[0].getWorldPosition(new THREE.Vector3()))

            let xPos = child.getWorldPosition(new THREE.Vector3()).x
            if (xPos >= DNAPol3.position.x - 8 && xPos < leadPrimer.position.x
                && splitDNANew.children.filter((child) => nearTarget(child.getWorldPosition(new THREE.Vector3()).x, xPos)).length == 0) {
                let colour = child.children[1].material.color.getHexString();
                leadTop.children.forEach(child => child.removeFromParent())
                leadTop.add(makeNewDNA(xPos - leadTop.position.x, 0x555555, true, true, false, splitDNANew.children.length + 1)[1])
                leadTop.children[0].position.x += 1 * splitDNANew.children.length + 1
                splitDNANew.add(makeNewDNA(xPos - splitDNANew.position.x, basePairs['0x' + colour])[0])
                
            }
        }
    }
    
    nucleotidePoints.sort((a, b) => a.x - b.x)
    pairPoints.sort((a, b) => a.x - b.x)
    nucleotideLineGeometry.setFromPoints(nucleotidePoints)
    pairLineGeometry.setFromPoints(pairPoints);

    let target = -1 * Math.PI / 3;

    if (((DNAGroup.rotation.x < target + 1/6 && DNAGroup.rotation.x > target - 1/6) || helicase.position.x < 44) && helicase.position.x > -25) {
        helicase.position.x -= 0.1275;
    } else if (helicase.position.x <= -25) {
        DNAGroup.rotation.x += Math.PI / 96 - 0.0078539816339745;
        Pairs.rotation.x += Math.PI / 96 - 0.0078539816339745;
        if (topoisomerase.position.x > -36.1) {
            let TIPos = topoisomerase.position.x;
            topoisomerase.position.x -= Math.max((TIPos + 36.1) / 50, 0.01);
        }
        if (topoisomerase.position.y > 0) {
            let TIPos = topoisomerase.position.y;
            topoisomerase.position.y -= Math.max(TIPos / 50, 0.01);
        }
        if (topoisomerase.position.z > 0) {
            let TIPos = topoisomerase.position.z;
            topoisomerase.position.z -= Math.max(TIPos / 50, 0.01);
        }
    }

    if (helicase.position.x <= 10) {
        if (!targetLead) {
            targetLead = splitDNA.children.filter(obj => obj.getWorldPosition(new THREE.Vector3()).x < 10)[0];
        }
        if (leadPrimer.parent == scene) {
            let speed = calcSpeed(leadPrimer.position.x, targetLead.getWorldPosition(new THREE.Vector3()).x, 15, 0.04);
            if (speed[1] && leadPrimer.position.x <= 42) {
                leadPrimer.position.x += speed[0];
            } else if (leadPrimer.position.x <= 42) {
                leadPrimer.position.x = targetLead.getWorldPosition(new THREE.Vector3()).x
                let speed = calcSpeed(DNAPol3.position.x, leadPrimer.position.x + 2, 15, 0.04);
                if (speed[1]) {
                    DNAPol3.position.x += speed[0]
                }
            } else {
                leadPrimer.position.x += 0.04
            }
            let speedY = calcSpeed(leadPrimer.position.y, 15, 20, 0);
            if (speedY[1]) {
                leadPrimer.position.y += speedY[0];
            } else {
                leadPrimer.position.y = targetLead.getWorldPosition(new THREE.Vector3()).y
            }
        }
    }

    window.requestAnimationFrame(tick);
}
tick();

function makeDNA(xPos, rot, colour, pair) {
    const material = new THREE.MeshStandardMaterial( { color: colour } );

    let geometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 32);
    const cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.y = 2.5;

    const endPoint = new THREE.SphereGeometry(1);
    const point = new THREE.Mesh(endPoint);

    const nucleotide = new THREE.Group();
    nucleotide.add(point);
    nucleotide.add(cylinder);
    point.visible = false;

    nucleotide.position.x = xPos;
    nucleotide.rotation.x = rot;
    point.position.y += 5.5;
    
    if (pair) {
        pairPoints.push(point.getWorldPosition(new THREE.Vector3()))
    } else {
        nucleotidePoints.push(point.getWorldPosition(new THREE.Vector3()))
    }

    return nucleotide;
}

function makeNewDNA(xPos, colour, top = false, flip = false, reduceColour = true, height = 2) {
    const material = new THREE.MeshStandardMaterial( { color: colour } );
    let topMesh;

    let geometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 32);
    const cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.y = 2.5;

    cylinder.position.x = xPos;

    if (top) {
        const topGeo = new THREE.CylinderGeometry(0.75, 0.75, height * 2 - 1, 32);
        let trueColour;
        if (reduceColour) {
            trueColour = new THREE.Color().setHex(colour).sub(new THREE.Color().setHex(0xdddddd))
        } else {
            trueColour = new THREE.Color().setHex(colour)
        }
        const topMaterial = new THREE.MeshBasicMaterial({color: trueColour})
        topMesh = new THREE.Mesh(topGeo, topMaterial);
        topMesh.rotation.z = Math.PI / 2;
        topMesh.position.x = xPos + 1;
        if (flip) {
            topMesh.position.x -= 2
        }
        topMesh.position.y = -0.75
    }

    return [cylinder, topMesh];
}

function calcSpeed(curPoint, nextPoint, speed, baseSpeed) {
    let calculatedSpeed = (nextPoint - curPoint) / speed;
    let newSpeed = Math.sign(calculatedSpeed) != Math.sign(baseSpeed) ? calculatedSpeed : baseSpeed;
    if (Math.abs(newSpeed) < 0.003) {
        newSpeed = nextPoint - curPoint;
    }
    return [newSpeed, Math.sign(calculatedSpeed) != Math.sign(baseSpeed) || Math.abs(newSpeed) < 0.003];
}

function nearTarget(a, b, distance = 0.1) {
    return (b - distance / 2) < a && (b + distance / 2) > a
}