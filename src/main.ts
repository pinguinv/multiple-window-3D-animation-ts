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

type sphereType = tetType[];
type animationInstanceType = sphereType[];

type screenCoords = { x: number; y: number };

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
const ORT_CAMERA_SCALE = 20;
const arcOrtScale = 1 / ORT_CAMERA_SCALE;

const SPHERE_RADIUS = 10;
const TETS_PER_SPHERE = 50;
const SPHERES_PER_INSTANCE = 4;

let spheresData: sphereType[];
let animationInstances: animationInstanceType[];
// let initialized: boolean = false;

let windowScreenCoordsTarget = { x: 0, y: 0 },
    windowScreenCoords = { x: 0, y: 0 };

const FALLOFF = 0.05;
const tetsMovingSpeed = 0.01;

function updateWindowScreenCoordsTarget() {
    windowScreenCoordsTarget = { x: window.screenX, y: window.screenY };
    console.log(windowScreenCoordsTarget);
}

function setupAndInit() {
    setupWindowManager();
    setupRenderer();
    setupSceneAndCamera();
    spheresData = getSpheresData();
    setupWorldDependingOnData(animation!, spheresData);
    activateAnimation();
    window.addEventListener("resize", resizeCameraAndRenderer);
}

function setupWindowManager() {
    thisWindowManager = new BrowserWindowManager();

    thisWindowManager.setInstanceShapeChangedCallback(windowShapeChanged);
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
    camera =
        // new three.PerspectiveCamera(45, window.innerWidth / window.innerHeight, near, far);
        new three.OrthographicCamera(
            (-window.innerWidth / 2) * arcOrtScale,
            (window.innerWidth / 2) * arcOrtScale,
            (window.innerHeight / 2) * arcOrtScale,
            (-window.innerHeight / 2) * arcOrtScale,
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
    // scene.add(camera);
}

// setup Data
function getSpheresData(): sphereType[] {
    const spheres: sphereType[] = [];

    let tet: tetType;
    let x, y, z, radiusAtY;

    let phi = Math.PI * (Math.sqrt(5) - 1); // golden angle in radians
    let theta = 0;

    for (let i = 0; i < SPHERES_PER_INSTANCE; i++) {
        const sphere: tetType[] = [];

        // evenly (with some random part) distributed tets on a sphere
        for (let j = 0; j < TETS_PER_SPHERE; j++) {
            y = (1 - (i / TETS_PER_SPHERE) * 2) * SPHERE_RADIUS + (Math.random() * 2 - 1); // (from -SPHERE_RADIUS TO SPHERE_RADIUS) +- random value from -1 to 1

            radiusAtY = Math.sqrt(SPHERE_RADIUS * SPHERE_RADIUS - y * y);

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

            sphere.push(tet);
        }

        spheres.push(sphere);
    }

    return spheres;
}

// Make world depending on data
function setupWorldDependingOnData(
    parentObject: three.Object3D,
    spheresData: sphereType[]
): void {
    const tetrahedronGeometry = new three.TetrahedronGeometry(0.5);

    for (let i = 0; i < spheresData.length; i++) {
        const sphere: sphereType = spheresData[i];
        const sphereAnchor: three.Object3D = new three.Object3D();

        for (let j = 0; j < sphere.length; j++) {
            const tet: tetType = sphere[i];
            const tetrahedronMaterial = new three.MeshBasicMaterial({ wireframe: true });
            const tetrahedronObject: three.Mesh = new three.Mesh(
                tetrahedronGeometry,
                tetrahedronMaterial
            );

            // k - number of windows open
            // tetrahedronMaterial.color.setHSL(0.1 * k, 1, 0.55);
            tetrahedronMaterial.color.setHSL(0.1, 1, 0.55);

            tetrahedronObject.position.x = tet.x;
            tetrahedronObject.position.y = tet.y;
            tetrahedronObject.position.z = tet.z;

            // tetrahedronObject.name = "tet" + j;
            sphereAnchor.add(tetrahedronObject);
        }

        sphereAnchor.name = "sphereAnchor" + i;
        parentObject.add(sphereAnchor);
    }
}

function updateAnimation() {}

function animateWindow() {}

function moveAllTets() {
    let sphere: sphereType, sphereAnchor: three.Object3D;
    let dTheta: number, dPhi: number;
    let tet: tetType, tetObj: three.Object3D;
    let negative: boolean;

    for (let i = 0; i < spheresData.length; i++) {
        sphere = spheresData[i];
        sphereAnchor = animation.children[i];

        // move tets
        for (let j = 0; j < sphere.length; j++) {
            tet = sphere[j];
            tetObj = sphereAnchor.children[j];

            dTheta = (Math.cos(tet.flowDirection) * 2 - 1) * tetsMovingSpeed;
            dPhi = (Math.sin(tet.flowDirection) * 2 - 1) * tetsMovingSpeed;

            tet.theta += dTheta;
            tet.phi += dPhi;

            tetObj.position.x = SPHERE_RADIUS * Math.sin(tet.theta) * Math.cos(tet.phi);
            tetObj.position.y = SPHERE_RADIUS * Math.sin(tet.theta) * Math.sin(tet.phi);
            tetObj.position.z = SPHERE_RADIUS * Math.cos(tet.theta);

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
        // sphereAnchor.position.x;
        // sphereAnchor.position.y;
    }

    // const windows = thisWindowManager.getInstances();
    // for (let i = 0; i < instances.length; i++) {
    //     const element = [i];

    // }
}

function animate(time: number) {
    moveAllTets();

    // w oryginale jest tylko ten update i render
    thisWindowManager.updateInstanceShape();

    renderer.render(scene, camera);
}

function activateAnimation() {
    renderer.setAnimationLoop(animate);
}

function updateWindow() {
    // resizeCameraAndRenderer();
}

// is passed as a callback to shape update
function resizeCameraAndRenderer() {
    // Perspective camera
    // camera.aspect = window.innerWidth / window.innerHeight;

    // Ortographic camera
    const width = window.innerWidth,
        height = window.innerHeight;

    camera.left = -(width / 2) * arcOrtScale;
    camera.right = (width / 2) * arcOrtScale;
    camera.top = (height / 2) * arcOrtScale;
    camera.bottom = -(height / 2) * arcOrtScale;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    console.log("Camera and Renderer resized.");

    updateWindowScreenCoordsTarget();
}

if (window.location.pathname === "/clear") {
    localStorage.clear();
} else {
    setupAndInit();
}
