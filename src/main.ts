import * as three from "three";

import { BrowserWindowManager, BrowserWindowData } from "./windowManager.ts";
import { tetType, animationType, sphereType, windowScreenPositionType } from "./types.ts";

// Names clarification: tet is an abbreviation for tetrahedron

// GLOBAL CONSTANTS
const NEAR = -1000,
    FAR = 1000;
const FIRST_SPHERE_RADIUS = 150;
const RADIUS_DIFFERENCE = 50;
const TETS_PER_SPHERE = 50;
const SPHERES_PER_INSTANCE = 4;
const TETS_MOVING_SPEED = 0.01;

// GLOBAL VARIABLES
let windowManager: BrowserWindowManager, browserWindows: BrowserWindowData[];
let windowCurrentScreenPosition: windowScreenPositionType = { x: 0, y: 0 };

let renderer: three.WebGLRenderer,
    camera: three.OrthographicCamera,
    scene: three.Scene,
    world: three.Object3D;

let animations: animationType[] = [];

function setupAndInit() {
    setupWindowManager(); // second callback?

    setupRenderer(); // OK

    setupSceneAndCamera(); // OK

    updateWindowCurrentScreenPosition(); // OK

    setupAnimationsData(); // OK

    fillTheWorldAccordingToData(); // OK

    activateAnimation();

    window.addEventListener("resize", resizeCameraAndRenderer);
}

function setupWindowManager(): void {
    windowManager = new BrowserWindowManager();

    windowManager.setInstanceShapeChangedCallback(updateWindowCurrentScreenPosition);
    windowManager.setInstancesChangedCallback(updatetBrowserWindowsData);
    // FIXME: update first animation after second window has appeared

    windowManager.initInstance();
}

function updateWindowCurrentScreenPosition(): void {
    windowCurrentScreenPosition = { x: window.screenLeft, y: window.screenTop };
    adjustWorldPosition();
}

function updatetBrowserWindowsData() {
    browserWindows = windowManager.getInstances();
}

function adjustWorldPosition(): void {
    world.position.x = -windowCurrentScreenPosition.x;
    world.position.y = -windowCurrentScreenPosition.y;
}

function setupRenderer(): void {
    renderer = new three.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.setAttribute("id", "renderer");
    document.body.appendChild(renderer.domElement);

    const pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
    renderer.setPixelRatio(pixelRatio);
}

function setupSceneAndCamera(): void {
    // coordinate system :
    //  --> x
    // |
    // V y
    camera = new three.OrthographicCamera(
        0,
        window.innerWidth,
        0,
        window.innerHeight,
        NEAR,
        FAR
    );

    camera.position.z = 50;

    scene = new three.Scene();
    scene.background = new three.Color().setHex(0x200050);

    // All animations will be added to `world`
    world = new three.Object3D();
    scene.add(world);
}

function setupAnimationsData(): void {
    updatetBrowserWindowsData();

    for (let i = 0; i < browserWindows.length; i++) {
        animations.push(
            generateAnimationData(FIRST_SPHERE_RADIUS + i * RADIUS_DIFFERENCE, i)
        );
    }
}

function generateAnimationData(
    animationRadius: number,
    colorIndex: number
): animationType {
    const animation: animationType = {
        colorIndex: colorIndex,
        spheres: [],
    };

    let tet: tetType;
    let x, y, z, radiusAtY, sphere: sphereType;

    let phi = Math.PI * (Math.sqrt(5) - 1); // golden angle in radians
    let theta = 0;

    for (let i = 0; i < SPHERES_PER_INSTANCE; i++) {
        sphere = {
            // passed radius + delta = +- 10%
            r: animationRadius * (1 + 0.1 * (Math.random() * 2 - 1)),
            tets: [],
        };

        // evenly distributing tets on a sphere using fibonacci sphere algorithm
        for (let j = 0; j < TETS_PER_SPHERE; j++) {
            // (from -sphere.r to sphere.r)
            y = (1 - (i / TETS_PER_SPHERE) * 2) * sphere.r;

            radiusAtY = Math.sqrt(sphere.r * sphere.r - y * y);

            theta = phi * i;

            x = radiusAtY * Math.cos(theta);
            z = radiusAtY * Math.sin(theta);

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

        animation.spheres.push(sphere);
    }

    return animation;
}

function fillTheWorldAccordingToData(): void {
    for (let i = 0; i < animations.length; i++) {
        const animationData: animationType = animations[i];
        const animationObject: three.Object3D = new three.Object3D();

        generateAnimationObject(animationObject, animationData);

        world.add(animationObject);
    }
}

function generateAnimationObject(
    animationObject: three.Object3D,
    animationData: animationType
): void {
    const tetrahedronGeometry = new three.TetrahedronGeometry(10);
    const spheresData: sphereType[] = animationData.spheres;

    for (let i = 0; i < spheresData.length; i++) {
        const sphere: sphereType = spheresData[i];
        const sphereAnchor: three.Object3D = new three.Object3D();

        for (let j = 0; j < sphere.tets.length; j++) {
            const tet: tetType = sphere.tets[i];

            const tetrahedronMaterial = new three.MeshBasicMaterial({ wireframe: true });
            tetrahedronMaterial.color.setHSL(0.1 * animationData.colorIndex, 1, 0.55);

            const tetrahedronObject: three.Mesh = new three.Mesh(
                tetrahedronGeometry,
                tetrahedronMaterial
            );

            tetrahedronObject.position.x = tet.x;
            tetrahedronObject.position.y = tet.y;
            tetrahedronObject.position.z = tet.z;

            sphereAnchor.add(tetrahedronObject);
        }

        sphereAnchor.name = "sphereAnchor" + i;
        animationObject.add(sphereAnchor);
    }
}

function activateAnimation() {
    renderer.setAnimationLoop(animate);
}

// FIXME: update first animation after second window has appeared - probably something in code below

function animate(time: number) {
    moveAnimations();

    windowManager.updateInstanceShape();

    renderer.render(scene, camera);
}

function moveAnimations() {
    adjustAnimationsPositions();
    for (let i = 0; i < animations.length; i++) {
        const animationData = animations[i];
        const animationObject = world.children[i];

        moveOneAnimation(animationData, animationObject);
    }
}

function adjustAnimationsPositions() {
    // console.log("adjustAnimationsPositions"); // check how many times is called and check if it works properly - if not, uncomment code below

    // Cube for orientation
    let cube = new three.Mesh(
        new three.BoxGeometry(50, 50, 50),
        new three.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    );

    cube.position.x = 50;
    cube.position.y = 50;

    world.add(cube);

    // necessary for now bcs windows' shapes don't update properly
    updatetBrowserWindowsData();

    for (let i = 0; i < browserWindows.length; i++) {
        const window = browserWindows[i];
        const animationObject = world.children[i];

        // TODO: make position change smoother
        animationObject.position.x = window.shape.x + window.shape.width / 2;
        animationObject.position.y = window.shape.y + window.shape.height / 2;
    }
}

// TODO: add time to sync these animations

function moveOneAnimation(animationData: animationType, animationObject: three.Object3D) {
    let sphere: sphereType, sphereObj: three.Object3D;
    let negative: boolean;

    for (let i = 0; i < animationData.spheres.length; i++) {
        sphere = animationData.spheres[i];
        sphereObj = animationObject.children[i];

        // move tets
        moveTetsOfSphere(sphere, sphereObj);

        negative = i % 2 == 1;

        // rotate spheres
        sphereObj.rotateX(0.01 * (i % 3) * (negative ? 1 : -1));
        sphereObj.rotateY(0.01 * ((i + 1) % 3) * (negative ? -1 : 1));
        sphereObj.rotateZ(0.01 * ((i + 2) % 3) * (negative ? 1 : -1));

        // spheres position, maybe change it later so every tet has its own position calculated
    }
}

function moveTetsOfSphere(sphere: sphereType, sphereObj: three.Object3D) {
    let dTheta: number, dPhi: number;
    let tet: tetType, tetObj: three.Object3D;
    let negative: boolean;

    for (let j = 0; j < sphere.tets.length; j++) {
        tet = sphere.tets[j];
        tetObj = sphereObj.children[j];

        dTheta = (Math.cos(tet.flowDirection) * 2 - 1) * TETS_MOVING_SPEED;
        dPhi = (Math.sin(tet.flowDirection) * 2 - 1) * TETS_MOVING_SPEED;

        tet.theta += dTheta;
        tet.phi += dPhi;

        tetObj.position.x = sphere.r * Math.sin(tet.theta) * Math.cos(tet.phi);
        tetObj.position.y = sphere.r * Math.sin(tet.theta) * Math.sin(tet.phi);
        tetObj.position.z = sphere.r * Math.cos(tet.theta);

        negative = j % 2 == 0;

        tetObj.rotateX(0.01 * (j % 3) * (negative ? -1 : 1));
        tetObj.rotateY(0.01 * ((j + 1) % 3) * (negative ? 1 : -1));
        tetObj.rotateZ(0.01 * ((j + 2) % 3) * (negative ? -1 : 1));
    }
}

// is passed as a callback to resize
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

    updateWindowCurrentScreenPosition();
}

if (window.location.pathname === "/clear") {
    localStorage.clear();
} else {
    setupAndInit();
}
