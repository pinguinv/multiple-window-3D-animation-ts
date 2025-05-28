import BrowserWindowManager from "./windowManager.ts";
import * as three from "three";

type tetType = {
    x: number;
    y: number;
    z: number;
    flowDirection: number; // Radians
    theta: number;
    phi: number;
};

type sphereType = {
    r: number;
    tets: tetType[];
};

type animationInstanceType = sphereType[];

type windowOffsetType = { x: number; y: number };

// Window Manager Setup
let thisWindowManager: BrowserWindowManager;

// setup scene & renderer
let renderer: three.WebGLRenderer,
    camera: three.OrthographicCamera,
    scene: three.Scene,
    world: three.Object3D,
    animation: three.Object3D;

const near = 0.1,
    far = 1000;

const FIRST_SPHERE_RADIUS = 150;
const TETS_PER_SPHERE = 50;
const SPHERES_PER_INSTANCE = 4;

let animationInstances: animationInstanceType[];
// let initialized: boolean = false;

let windowOffsetTarget: windowOffsetType = { x: 0, y: 0 },
    windowOffset: windowOffsetType = { x: 0, y: 0 };

const FALLOFF = 0.1;
const tetsMovingSpeed = 0.01;

function updateWindowOffsetTarget() {
    windowOffsetTarget = { x: window.screenLeft, y: window.screenTop };
    console.log(windowOffsetTarget);
}

function setupAndInit() {
    setupWindowManager();
    setupRenderer();
    setupSceneAndCamera();

    updateWindowOffsetTarget();

    animationInstances = getAnimationInstancesData();

    setupWorldDependingOnData(animation!, animationInstances);
    activateAnimation();
    window.addEventListener("resize", resizeCameraAndRenderer);
}

function setupWindowManager() {
    thisWindowManager = new BrowserWindowManager();

    thisWindowManager.setInstanceShapeChangedCallback(updateWindowOffsetTarget);
    thisWindowManager.setInstancesCountChangedCallback(instancesCountChanged);

    thisWindowManager.initInstance();

    console.log("Instances at setup:");
    thisWindowManager.logInstances();
}

function windowShapeChanged() {}

function instancesCountChanged() {}

function setupRenderer() {
    renderer = new three.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.setAttribute("id", "renderer");
    document.body.appendChild(renderer.domElement);

    const pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
    renderer.setPixelRatio(pixelRatio);
}

function setupSceneAndCamera() {
    // coordinate system :
    //  --> x
    // |
    // V y

    camera = new three.OrthographicCamera(
        0,
        window.innerWidth,
        0,
        window.innerHeight,
        near,
        far
    );

    camera.position.z = 60;

    scene = new three.Scene();
    world = new three.Object3D();
    animation = new three.Object3D();

    world.add(animation);
    scene.add(world);

    scene.background = new three.Color().setHex(0x200050);

    adjustWorldPosition();
    // scene.add(camera);
}

// setup Data
function getAnimationInstancesData(): animationInstanceType[] {
    const animationInstances: animationInstanceType[] = [];
    const browserWindows = thisWindowManager.getInstances();

    for (let i = 0; i < browserWindows.length; i++) {
        animationInstances.push(
            generateAnimationInstanceData(FIRST_SPHERE_RADIUS + i * 2)
        );
    }

    return animationInstances;
}

function generateAnimationInstanceData(
    radiusOfSmallestSphere: number
): animationInstanceType {
    const spheres: sphereType[] = [];
    const animationInstanceData: animationInstanceType = [];

    let tet: tetType;
    let x, y, z, radiusAtY;

    let phi = Math.PI * (Math.sqrt(5) - 1); // golden angle in radians
    let theta = 0;

    for (let i = 0; i < SPHERES_PER_INSTANCE; i++) {
        const sphereRadius = radiusOfSmallestSphere;

        let sphere: sphereType = {
            r: sphereRadius,
            tets: [],
        };

        // evenly (with some random part) distributed tets on a sphere
        for (let j = 0; j < TETS_PER_SPHERE; j++) {
            // (from -sphereRadius TO sphereRadius) +- random value from -1 to 1
            y = (1 - (i / TETS_PER_SPHERE) * 2) * sphereRadius + (Math.random() * 2 - 1);

            radiusAtY = Math.sqrt(sphereRadius * sphereRadius - y * y);

            // theta += phi;
            theta = phi * i;

            x = radiusAtY * Math.cos(theta) + (Math.random() * 2 - 1);
            z = radiusAtY * Math.sin(theta) + (Math.random() * 2 - 1);

            tet = {
                x: x,
                y: y,
                z: z,
                flowDirection: 2 * Math.PI * Math.random(),
                theta: theta,
                phi: phi,
            };

            sphere.tets.push(tet);
        }

        spheres.push(sphere);
    }

    return spheres;
}

function setupAnimationInstance(
    parentObject: three.Object3D,
    animationInstanceData: animationInstanceType,
    colorIndex: number
) {
    const tetrahedronGeometry = new three.TetrahedronGeometry(10);
    const spheresData: sphereType[] = animationInstanceData;

    for (let i = 0; i < spheresData.length; i++) {
        const sphere: sphereType = spheresData[i];
        const sphereAnchor: three.Object3D = new three.Object3D();

        for (let j = 0; j < sphere.tets.length; j++) {
            const tet: tetType = sphere.tets[i];
            const tetrahedronMaterial = new three.MeshBasicMaterial({ wireframe: true });
            const tetrahedronObject: three.Mesh = new three.Mesh(
                tetrahedronGeometry,
                tetrahedronMaterial
            );

            tetrahedronMaterial.color.setHSL(0.1 * colorIndex, 1, 0.55);

            tetrahedronObject.position.x = tet.x;
            tetrahedronObject.position.y = tet.y;
            tetrahedronObject.position.z = tet.z;

            sphereAnchor.add(tetrahedronObject);
        }

        sphereAnchor.name = "sphereAnchor" + i;
        parentObject.add(sphereAnchor);
    }
}

// Make world depending on data
function setupWorldDependingOnData(
    world: three.Object3D,
    animationInstancesData: animationInstanceType[]
): void {
    for (let i = 0; i < animationInstancesData.length; i++) {
        const animationInstanceData: animationInstanceType = animationInstancesData[i];
        const animationInstanceObject: three.Object3D = new three.Object3D();

        setupAnimationInstance(animationInstanceObject, animationInstanceData, i);

        world.add(animationInstanceObject);
    }
}

function adjustWorldPosition() {
    world.position.x = -windowOffsetTarget.x;
    world.position.y = -windowOffsetTarget.y;
}

function adjustAnimationsPositions(animations: three.Object3D[]) {
    // Cube for orientation
    let cube = new three.Mesh(
        new three.BoxGeometry(50, 50, 50),
        new three.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    );

    cube.position.x = 50;
    cube.position.y = 50;

    world.add(cube);

    const windowInstances = thisWindowManager.getInstances();

    for (let i = 0; i < windowInstances.length; i++) {
        const window = windowInstances[i];
        const animationInstanceObj = animations[i];

        // windowOffset.x += (windowOffsetTarget.x - windowOffset.x) * FALLOFF;
        // windowOffset.y += (windowOffsetTarget.y - windowOffset.y) * FALLOFF;

        animationInstanceObj.position.x = window.shape.x + window.shape.width / 2;
        animationInstanceObj.position.y = window.shape.y + window.shape.height / 2;
    }
}

// TODO: add time to sync these animations

function animateOneInstance(
    animationInstanceData: animationInstanceType,
    animationInstanceObject: three.Object3D,
    index: number
) {
    let sphere: sphereType, sphereAnchor: three.Object3D;
    let dTheta: number, dPhi: number;
    let tet: tetType, tetObj: three.Object3D;
    let negative: boolean;

    const spheresData: sphereType[] = animationInstanceData;

    const myRadius = FIRST_SPHERE_RADIUS + 50 * index;

    for (let i = 0; i < spheresData.length; i++) {
        sphere = spheresData[i];
        sphereAnchor = animationInstanceObject.children[i];

        // move tets
        for (let j = 0; j < sphere.tets.length; j++) {
            tet = sphere.tets[j];
            tetObj = sphereAnchor.children[j];

            dTheta = (Math.cos(tet.flowDirection) * 2 - 1) * tetsMovingSpeed;
            dPhi = (Math.sin(tet.flowDirection) * 2 - 1) * tetsMovingSpeed;

            tet.theta += dTheta;
            tet.phi += dPhi;

            tetObj.position.x = myRadius * Math.sin(tet.theta) * Math.cos(tet.phi);
            tetObj.position.y = myRadius * Math.sin(tet.theta) * Math.sin(tet.phi);
            tetObj.position.z = myRadius * Math.cos(tet.theta);

            negative = j % 2 == 0;

            tetObj.rotateX(0.01 * (j % 3) * (negative ? -1 : 1));
            tetObj.rotateY(0.01 * ((j + 1) % 3) * (negative ? 1 : -1));
            tetObj.rotateZ(0.01 * ((j + 2) % 3) * (negative ? -1 : 1));
        }

        // rotate spheres
        sphereAnchor.rotateX(0.01 * (i % 3) * (i % 2 ? 1 : -1));
        sphereAnchor.rotateY(0.01 * ((i + 1) % 3) * (i % 2 ? -1 : 1));
        sphereAnchor.rotateZ(0.01 * ((i + 2) % 3) * (i % 2 ? 1 : -1));

        // spheres position, maybe change it later so every tet has its own position calculated
    }
}

function moveAllTets() {
    adjustWorldPosition();
    adjustAnimationsPositions(world.children[0].children);

    for (let i = 0; i < animationInstances.length; i++) {
        const animationInstanceData = animationInstances[i];
        const animationInstanceObject = world.children[0].children[i];

        animateOneInstance(animationInstanceData, animationInstanceObject, i);
    }
}

function animate(time: number) {
    moveAllTets();

    thisWindowManager.updateInstanceShape();

    renderer.render(scene, camera);
}

function activateAnimation() {
    renderer.setAnimationLoop(animate);
}

// is passed as a callback to shape update
function resizeCameraAndRenderer() {
    // Ortographic camera
    const width = window.innerWidth,
        height = window.innerHeight;

    camera.left = 0;
    camera.right = width;
    camera.top = 0;
    camera.bottom = height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    console.log("Camera and Renderer resized.");

    updateWindowOffsetTarget();
}

if (window.location.pathname === "/clear") {
    localStorage.clear();
} else {
    setupAndInit();
}
