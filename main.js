import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Color, LatheGeometry, Line2NodeMaterial, Vector2 } from 'three/webgpu';

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

const checkBase = {
    'ff0000': '00ff00',
    '00ff00': 'ff0000',
    '0000ff': 'ffff00',
    'ffff00': '0000ff',
}

let laggingPrimers = [];
let laggingDNAPol3s = [];
let leavingDNAPol3 = [];
const laggingTops = new THREE.Group();
laggingTops.position.y = -13.5;

let laggingDNAPol1s = [];

let ligaseArr = new THREE.Group();

let nucleotidePoints = [];

let pairPoints = [];

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xefefff);

const flyingBases = new THREE.Group();
scene.add(flyingBases);

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
let rot = 0;
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
const laggingPairs = new THREE.Group();
splitDNANew.position.y = 15
laggingPairs.position.y = -20
scene.add(splitDNANew);
scene.add(laggingPairs)

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
scene.add(laggingTops)

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
    new THREE.Vector2(4.1, 6),
    new THREE.Vector2(3.7, 7),
    new THREE.Vector2(3.6, 8),
    new THREE.Vector2(3.7, 9),
    new THREE.Vector2(3.9, 10),
    new THREE.Vector2(4.2, 11),
    new THREE.Vector2(4.3, 12),
    new THREE.Vector2(4, 13),
]);
const DNAPol3Mat = new THREE.MeshStandardMaterial({color: 0x770077});
const DNAPol3 = new THREE.Mesh(DNAPol3Geo, DNAPol3Mat);
DNAPol3.rotation.z = Math.PI / 2
DNAPol3.position.y = 20.15
DNAPol3.position.x = 60
DNAPol3.scale.x = 1.9
scene.add(DNAPol3)
DNAPol3.position.z = 30

const DNAPol1Geo = new THREE.LatheGeometry([
    new Vector2(6.5, -3.5),
    new Vector2(7.3, -3),
    new Vector2(7.9, -2.5),
    new Vector2(8.2, -2),
    new Vector2(8.3, -1.5),
    new Vector2(8.2, -1),
    new Vector2(7.9, -0.5),
    new Vector2(7.3, 0),
    new Vector2(7.9, 0.5),
    new Vector2(8.2, 1),
    new Vector2(8.3, 1.5),
    new Vector2(8.2, 2),
    new Vector2(7.9, 2.5),
    new Vector2(7.3, 3),
    new Vector2(6.5, 3.5),
]);
const DNAPol1Mat = new THREE.MeshStandardMaterial({color: 0x7c71ad});
const DNAPol1 = new THREE.Mesh(DNAPol1Geo, DNAPol1Mat);
DNAPol1.rotation.z = Math.PI / 2;

const ligaseGeo = new THREE.SphereGeometry(2)
const ligaseMat = new THREE.MeshStandardMaterial({color: 0xbfa55c});
const ligase = new THREE.Mesh(ligaseGeo, ligaseMat);
ligase.rotation.z = Math.PI / 2;
ligase.scale.y = 2
ligase.position.z = 5
scene.add(ligaseArr)

let illusion = new THREE.Group();
illusion.position.y = -50;
flyingBases.add(illusion);

let curDNALeading = '';
let curDNALagging = '';

let baseDNAColourLeading = '';
let baseDNAColourLagging = '';

const DNAPol2Geo = new THREE.LatheGeometry([
    new Vector2(4.2, -1.6),
    new Vector2(5, -1.5),
    new Vector2(5.5, -1),
    new Vector2(5.7, -0.5),
    new Vector2(5.8, 0),
    new Vector2(5.7, 0.5),
    new Vector2(5.5, 1),
    new Vector2(5, 1.5),
    new Vector2(4.2, 1.6),
]);
const DNAPol2Mat1 = new THREE.MeshStandardMaterial({color: 0x00ff00d});
const DNAPol2Mat2 = new THREE.MeshStandardMaterial({color: 0x00ff00d});
const DNAPol2Leading = new THREE.Mesh(DNAPol2Geo, DNAPol2Mat1);
DNAPol2Leading.rotation.z = Math.PI / 2
DNAPol2Leading.scale.x = 1.5
DNAPol2Leading.position.x = 50

const DNAPol2Lagging = new THREE.Mesh(DNAPol2Geo, DNAPol2Mat2);
DNAPol2Lagging.rotation.z = Math.PI / 2
DNAPol2Lagging.scale.x = 1.5
DNAPol2Lagging.position.x = 50
DNAPol2Leading.position.y = -40
DNAPol2Lagging.position.y = 40
scene.add(DNAPol2Leading)
scene.add(DNAPol2Lagging)

const illusionPol2Leading = makeNewDNA(50, 0x000000)[0];
flyingBases.add(illusionPol2Leading)
const illusionPol2Lagging = makeNewDNA(50, 0x000000)[0];
flyingBases.add(illusionPol2Lagging)

let animate = true;

document.addEventListener('keydown', (event) => {
    if (event.code == 'Space') {
        animate = false;
    }
})

document.addEventListener('keyup', (event) => {
    if (event.code == 'Space') {
        animate = true;
    }
})

document.addEventListener('keydown', (event) => {
    if (event.key == 'h') {
        scene.remove(flyingBases)
    }
})

document.addEventListener('keyup', (event) => {
    if (event.key == 'h') {
        scene.add(flyingBases)
    }
})

// ANCHOR tick
const tick = () => {
    if (animate) {
        renderer.render(scene, camera);

        DNAGroup.rotation.x -= Math.PI / 96;
        Pairs.rotation.x -= Math.PI / 96;
        DNAGroup.position.x += 0.04;
        Pairs.position.x += 0.04;
        splitDNA.position.x += 0.04;
        splitDNAPair.position.x += 0.04;
        splitDNANew.position.x += 0.04;
        if (leadTop) leadTop.position.x += 0.04;
        laggingTops.position.x += 0.04;
        laggingPairs.position.x += 0.04;
        ligaseArr.position.x += 0.04;
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

                    let newColour = Math.random() < 0.75 ? basePairs['0x' + colour] : colours[Math.floor(Math.random() * 4)]

                    splitDNANew.add(makeNewDNA(xPos - splitDNANew.position.x, newColour)[0])
                    let temp = makeNewDNA(Math.random() * 100 - 46, basePairs['0x' + colour])[0]
                    temp.rotation.z = Math.random() * Math.PI - Math.PI / 2
                    illusion.add(temp)
                }
            }
        }

        illusion.children.forEach(child => {
            if (!nearTarget(child.position.x, 10, 0.3)) {
                child.position.x += (10 - child.position.x) / 10
                child.position.y += (17 - getPos(child).y) / 6

                child.rotation.z += (-1 * child.rotation.z) / 5
            } else {
                child.removeFromParent();
            }
        })
        
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

        if (helicase.position.x <= 0) {
            DNAPol2Lagging.position.y -= (DNAPol2Lagging.position.y + 20) / 10
            DNAPol2Leading.position.y -= (DNAPol2Leading.position.y - 20) / 10
            DNAPol2Lagging.position.x -= (DNAPol2Lagging.position.x - 30) / 10
            DNAPol2Leading.position.x -= (DNAPol2Leading.position.x - 30) / 10

            if (nearTarget(DNAPol2Leading.position.y, 20)) {
                // REVIEW cur work
                let realDNA = splitDNA.children.filter(dna => nearTarget(getPos(dna).x, DNAPol2Leading.position.x, 2))[0];
                let base = splitDNANew.children.filter(dna => nearTarget(getPos(dna).x, DNAPol2Leading.position.x, 2))[0]
                if (realDNA && base) {
                    let realColour = realDNA.children[1].material.color.getHexString();
                    let baseColour = base.material.color.getHexString();
                    if (realDNA.uuid != curDNALeading) {
                        illusionPol2Leading.position.x = 50
                        illusionPol2Leading.position.y = 0
                        illusionPol2Leading.material.color = new THREE.Color().setHex(basePairs['0x' + realColour])
                        curDNALeading = realDNA.uuid
                        baseDNAColourLeading = baseColour;
                        DNAPol2Leading.material.color = realColour == checkBase[baseColour] ? new THREE.Color(0, 1, 0) : new THREE.Color(1, 0, 0)
                    }
                    if (realColour != checkBase[baseColour]) {
                        illusionPol2Leading.position.x -= (illusionPol2Leading.position.x - getPos(realDNA).x) / 4
                        illusionPol2Leading.position.y -= (illusionPol2Leading.position.y - 15) / 4
                        
                        if (nearTarget(illusionPol2Leading.position.y, 15, 0.2)) {
                            base.material.color = new THREE.Color().setHex(basePairs['0x' + realColour])
                        }
                    } else {
                        illusionPol2Leading.position.x -= (illusionPol2Leading.position.x - 45) / 10
                        illusionPol2Leading.position.y -= (illusionPol2Leading.position.y - 35) / 10

                        illusionPol2Leading.material.color = new THREE.Color().setHex("0x" + baseDNAColourLeading)
                    }
                }
                
                realDNA = splitDNAPair.children.filter(dna => nearTarget(getPos(dna).x, DNAPol2Lagging.position.x, 2))[0];
                base = laggingPairs.children.filter(dna => nearTarget(getPos(dna).x, DNAPol2Lagging.position.x, 2))[0]
                if (realDNA && base) {
                    if (base.children[0]) {
                        let realColour = realDNA.children[1].material.color.getHexString();
                        let baseColour = base.children[0].material.color.getHexString();
                        if (realDNA.uuid != curDNALagging) {
                            illusionPol2Lagging.position.x = 50
                            illusionPol2Lagging.position.y = 0
                            illusionPol2Lagging.material.color = new THREE.Color().setHex(basePairs['0x' + realColour])
                            curDNALagging = realDNA.uuid
                            baseDNAColourLagging = baseColour;
                            DNAPol2Lagging.material.color = realColour == checkBase[baseColour] ? new THREE.Color(0, 1, 0) : new THREE.Color(1, 0, 0)
                        }
                        if (realColour != checkBase[baseColour]) {
                            illusionPol2Lagging.position.x -= (illusionPol2Lagging.position.x - getPos(realDNA).x) / 4
                            illusionPol2Lagging.position.y -= (illusionPol2Lagging.position.y + 15) / 4
                            
                            if (nearTarget(illusionPol2Lagging.position.y, -15, 0.2)) {
                                base.children[0].material.color = new THREE.Color().setHex(basePairs['0x' + realColour])
                            }
                        } else {
                            illusionPol2Lagging.position.x -= (illusionPol2Lagging.position.x - 45) / 10
                            illusionPol2Lagging.position.y -= (illusionPol2Lagging.position.y + 35) / 10

                            illusionPol2Lagging.material.color = new THREE.Color().setHex("0x" + baseDNAColourLagging)
                        }
                    }
                }
            }
        }

        // DNA Pol 3 creation 
        if (laggingDNAPol3s.length < laggingPrimers.length
            && laggingPrimers.sort((a, b) => getPos(a).x - getPos(b).x)[0].children[0].position.y < 3) {
            let group = new THREE.Group();
            laggingDNAPol3s.push(group)

            let temp = DNAPol3.clone();
            group.add(temp)

            group.position.x = getPos(laggingPrimers.sort((a, b) => getPos(a).x - getPos(b).x)[0]).x - 8;
            group.position.y = -20.15
            group.rotation.z = Math.PI

            temp.position.x = Math.random() * 50;
            temp.position.y = 50;

            scene.add(group)
        }

        // Leaving DNA Pol 3
        leavingDNAPol3.forEach(pol => {
            pol.position.x += Math.max(((pol.position.y + 20) / 30) * -1, 0.08);
            pol.position.y += (pol.position.y + 20) / 15

            if (pol.position.y <= -50) {
                pol.removeFromParent();
                leavingDNAPol3.splice(leavingDNAPol3.indexOf(pol), 1)
            }
        })

        let j = 0;
        // Moving DNA Pol 3
        laggingDNAPol3s.forEach(pol => {
            if (typeof pol != "string") {
                pol.position.x += 0.08;

                let truePos = pol.children[0];
                if (!nearTarget(0, truePos.position.x)) {
                    let speedX = calcSpeed(truePos.position.x, 0, 10, 0);
                    if (speedX[1]) {
                        truePos.position.x += speedX[0];
                    }
                } else {
                    truePos.position.x = 0;
                }
                if (!nearTarget(0, truePos.position.y)) {
                    let speedY = calcSpeed(truePos.position.y, 0, 15, 0);
                    if (speedY[1]) {
                        truePos.position.y += speedY[0];
                    }
                } else {
                    truePos.position.y = 0;
                }

                let ahead = laggingPrimers.filter(primer => primer.position.x > pol.position.x + 8)
                if ((ahead[0] && ahead.sort((a, b) => a.position.x - b.position.x)[0].position.x - pol.position.x < 11) || pol.position.x > 42) {
                    leavingDNAPol3.push(pol)
                    laggingDNAPol3s[laggingDNAPol3s.lastIndexOf(pol)] = "toRemove";
                }

                // Adding base pairs
                let targetBase = splitDNAPair.children.filter(child => nearTarget(getPos(child).x, pol.position.x + 8, 0.05)).sort((a, b) => getPos(a).x - getPos(b).x)[0];
                if (targetBase) {
                    let colour = targetBase.children[1].material.color.getHexString();
                    let group = new THREE.Group();
                    let temp = makeNewDNA(0, Math.random() < 0.75 ? basePairs['0x' + colour] : colours[Math.floor(Math.random() * 4)])[0];
                    temp.position.y += 50
                    temp.position.x += Math.random() * 100 - 50
                    temp.rotation.z = Math.random() * Math.PI - Math.PI / 2
                    group.position.x = targetBase.position.x
                    group.add(temp)
                    laggingPairs.add(group)
                    let topPos = getPos(targetBase).x - laggingTops.position.x
                    if (!(ahead[0] && nearTarget(ahead[0].position.x - 4, getPos(targetBase).x))) {
                        laggingTops.add(makeNewDNA(topPos, 0x555555, true, false, false, 2, true)[1])
                    }
                }
            }
            j++;
        })

        // Movement of lagging pairs
        laggingPairs.children.forEach(pair => {
            if (pair.children[0]) pair.children[0].position.y -= (pair.children[0].position.y - 2.5) / 10
            if (pair.children[0]) pair.children[0].position.x -= pair.children[0].position.x / 10
            if (pair.children[0]) pair.children[0].rotation.z -= pair.children[0].rotation.z / 10
        })

        // Top of lagging pairs
        laggingTops.children.forEach(top => {
            if (top.material.opacity == 0) {
                let arr = laggingDNAPol3s.filter(pol => typeof pol != "string" && pol.position.x + 8 > getPos(top).x && pol.position.x + 8 - getPos(top).x < 10).sort((a, b) => getPos(a).x - getPos(b).x)
                if (arr[0] && nearTarget(arr[0].children[0].position.y, 0)) {
                    top.material.opacity = 1
                }
            }
            
            if (getPos(top).x > 42) {
                laggingTops.remove(top)
            }
        })

        // Lagging primer creation & Pol 1
        if (helicase.position.x <= -25
            && (laggingPrimers.length == 0
            || (getPos(laggingPrimers.sort((a, b) => getPos(a).x - getPos(b).x)[0]).x >= -6
                && Math.floor(Math.random() * 150) == 0))) {
            let group = new THREE.Group();
            let temp = primerBase.clone()
            laggingPrimers.push(group);

            temp.rotation.z = Math.PI

            let attachBase = splitDNAPair.children.filter(child => getPos(child).y <= -20).sort((a, b) => getPos(a).x - getPos(b).x)[0];
            group.position.x = getPos(attachBase).x;
            group.position.y = -15;

            temp.position.x = Math.random() * 100 - 50;
            temp.position.y = 30;

            scene.add(group)
            group.add(temp)

            // Creation of Pol 1
            let tempPol1 = new THREE.Group()
            tempPol1.position.y = -20

            let tempChild = DNAPol1.clone()
            laggingDNAPol1s.push(tempPol1);
            tempChild.position.x = Math.random() * 50
            tempChild.position.y = 60

            tempPol1.position.x = group.position.x - 1;
            
            tempPol1.add(tempChild)
            scene.add(tempPol1)
        }

        let i = 0;
        // Movement of lagging primer after creation and deletion
        laggingPrimers.sort((a, b) => getPos(a).x - getPos(b).x).forEach(primer => {
            primer.position.x += 0.04;

            let truePos = primer.children[0];
            if (!nearTarget(0, truePos.position.x)) {
                let speedX = calcSpeed(truePos.position.x, 0, 10, 0);
                if (speedX[1]) {
                    truePos.position.x += speedX[0];
                }
            } else {
                truePos.position.x = 0;
            }
            if (!nearTarget(0, truePos.position.y)) {
                let speedY = calcSpeed(truePos.position.y, 0, 15, 0);
                if (speedY[1]) {
                    truePos.position.y += speedY[0];
                }
            } else {
                truePos.position.y = 0;
            }

            if (primer.position.x > 80) {
                primer.removeFromParent();
                laggingPrimers = laggingPrimers.filter(item => item != primer);
                laggingDNAPol3s.splice(laggingDNAPol3s.indexOf("toRemove"), 1)
            }

            i++;
        })

        // Movement of DNAPol1
        laggingDNAPol1s.forEach(pol => {
            pol.position.x += 0.04;
            if (pol.position.x > -6 && pol.children[0].position.x > 0) {
                pol.children[0].position.x -= pol.children[0].position.x < 0.1 ? pol.children[0].position.x : pol.children[0].position.x / 10
            }
            if (pol.children[0].position.y > 0 && pol.position.x > -6) {
                pol.children[0].position.y -= pol.children[0].position.y < 0.1 ? pol.children[0].position.y : pol.children[0].position.y / 15
            }

            if (pol.children[0].position.y <= 0) {
                let targetPrimer = laggingPrimers.filter(primer => nearTarget(primer.position.x, pol.position.x, 3))[0]
                
                if (targetPrimer) {
                    let targetAn = targetPrimer.children[0];
                    targetAn.position.y += (targetAn.position.y + 1) / 8
                    targetAn.position.x += (targetAn.position.y + 1) / 9

                    if (targetAn.position.y > 30) {
                        let targetChildren = splitDNAPair.children.filter(child => nearTarget(pol.position.x, getPos(child).x, 4)).sort((a, b) => getPos(a).x - getPos(b).x)

                        if (laggingPairs.children.filter(child => nearTarget(getPos(child).x, pol.position.x, 4)).length == 0) {
                            let newDNA = makeNewDNA(getPos(targetChildren[0]).x - laggingPairs.position.x, basePairs['0x' + targetChildren[0].children[1].material.color.getHexString()])[0]
                            newDNA.position.y += 50
                            newDNA.rotation.z = Math.random() * Math.PI - Math.PI / 2
                            laggingPairs.add(newDNA)
                            newDNA = makeNewDNA(getPos(targetChildren[1]).x - laggingPairs.position.x, basePairs['0x' + targetChildren[1].children[1].material.color.getHexString()])[0]
                            newDNA.position.y += 50
                            newDNA.rotation.z = Math.random() * Math.PI - Math.PI / 2
                            laggingPairs.add(newDNA)
                        } else {
                            let firstTime = true;
                            laggingPairs.children.filter(child => nearTarget(getPos(child).x, pol.position.x, 4)).forEach(pair => {
                                pair.position.y -= (pair.position.y - 2.5) / 10
                                pair.rotation.z -= pair.rotation.z / 10

                                if (firstTime) {
                                    if (nearTarget(pair.position.y, 2.5) && pol.position.y == -20) {
                                        let newDNA = makeNewDNA(pol.position.x - laggingTops.position.x, 0x555555, true, true, false, 2)[1]
                                        newDNA.position.x += 1 - 0.04
                                        laggingTops.add(newDNA)
                                    }
                                    if (nearTarget(pair.position.y, 2.5) && pol.position.y > -50) {
                                        pol.position.y += pol.position.y / 60
                                    } else if (pol.position.y < -50 && pol.position.y != -100) {
                                        let group = new THREE.Group();
                                        ligaseArr.add(group);
                                        group.position.y = -14.25;
                                        group.position.x = pol.position.x - ligaseArr.position.x

                                        let ligaseClone = ligase.clone()

                                        ligaseClone.position.y = -50;
                                        ligaseClone.position.x = Math.random() * 100 - 50
                                        group.add(ligaseClone)
                                        pol.position.y = -100
                                    }
                                }
                                firstTime = false;
                            })
                        }
                    }
                }
            }
        })

        // Movement of ligase
        ligaseArr.children.forEach(child => {
            let lMove = child.children[0]
            if (lMove) {
                if (child.position.z == 0) {
                    lMove.position.x -= lMove.position.x / 10
                    lMove.position.y -= lMove.position.y / 10
                } else {
                    lMove.position.x += (lMove.position.x + 0.1) / 10
                    lMove.position.y += (lMove.position.y + 0.1) / 10
                    if (lMove.position.y > 50) {
                        lMove.removeFromParent()
                    }
                }

                if (child.position.z == 0 && nearTarget(lMove.position.y, 0)) {
                    laggingTops.add(makeNewDNA(getPos(child).x - laggingTops.position.x + 1, 0x555555, true, false, false, 2)[1]);
                    laggingTops.add(makeNewDNA(getPos(child).x - laggingTops.position.x - 2.1, 0x555555, true, false, false, 2)[1]);

                    child.position.z = 0.1
                }
            }
        })
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

function makeNewDNA(xPos, colour, top = false, flip = false, reduceColour = true, height = 2, opaque = false) {
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
        const topMaterial = new THREE.MeshBasicMaterial({color: trueColour, transparent: true, opacity: opaque ? 0 : 1})
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

function getPos(o) {
    return o.getWorldPosition(new THREE.Vector3());
}