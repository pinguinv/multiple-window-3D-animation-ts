import * as three from "three";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";

import { BrowserWindowManager } from "windowManager";
import { windowScreenPositionType, BrowserWindowData } from "types";
import { MultiSphereAnimation } from "multiSphereAnimation";

// Names clarification: tet is an abbreviation for tetrahedron

// GLOBAL CONSTANTS
const NEAR = -1000,
    FAR = 1000;

const FALLOFF = 0.05;

// GLOBAL VARIABLES
let windowManager: BrowserWindowManager;

let windowCurrentScreenPosition: windowScreenPositionType = { x: 0, y: 0 };

let renderer: three.WebGLRenderer,
    bloomComposer: EffectComposer,
    camera: three.OrthographicCamera,
    scene: three.Scene,
    world: three.Object3D;

let browserWindows: BrowserWindowData[] = [];
let animations: MultiSphereAnimation[] = [];

function setupAndInit() {
    setupRenderer();

    setupSceneAndCamera();

    setupBloomComposer();

    setupWindowManager();

    updateWindowCurrentScreenPosition();

    setInitialAnimationsPositions();

    renderAnimations();

    window.addEventListener("resize", resizeCameraAndRenderer);

    saveStartTimeToLocalStorage();

    document.getElementById("resetAppButton")!.addEventListener("click", resetApp);
}

function setupWindowManager(): void {
    windowManager = new BrowserWindowManager();

    windowManager.setWindowShapeChangedCallback(updateWindowCurrentScreenPosition);
    windowManager.setWindowCountChangedCallback(onBrowserWindowCountChanged);

    windowManager.initWindow();

    // initially call, afterwards it will be called as window count changed callback
    onBrowserWindowCountChanged();
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

function setupBloomComposer() {
    const renderScene = new RenderPass(scene, camera);
    bloomComposer = new EffectComposer(renderer);
    bloomComposer.addPass(renderScene);

    const bloomPass = new UnrealBloomPass(
        new three.Vector2(window.innerWidth, window.innerHeight),
        0.3,
        0.1,
        0.1
    );
    bloomComposer.addPass(bloomPass);

    const outputPass = new OutputPass();
    bloomComposer.addPass(outputPass);
}

function onBrowserWindowCountChanged(): void {
    // update browser windows and create/update animations objects
    browserWindows = windowManager.getWindows();

    animations.forEach((animation) => world.remove(animation.object));

    animations = [];
    MultiSphereAnimation.removeAllAnimationsDataFromLocalStorage();

    for (let i = 0; i < browserWindows.length; i++) {
        animations.push(new MultiSphereAnimation(browserWindows[i].id));
    }

    animations.forEach((animation) => world.add(animation.object));
}

function renderAnimations() {
    renderer.setAnimationLoop(render);
}

function render() {
    windowManager.updateWindowShape();

    const time = getTimeDifference();

    moveAnimationsAndUpdatePositions(time);

    bloomComposer.render();
}

function moveAnimationsAndUpdatePositions(time: number) {
    // Adjust world position
    world.position.x = -windowCurrentScreenPosition.x;
    world.position.y = -windowCurrentScreenPosition.y;

    browserWindows = windowManager.getWindows();

    for (let i = 0; i < animations.length; i++) {
        const animation = animations[i];
        const browserWindowIndex = windowManager.findWindowIndexById(
            animation.browserWindowId
        );
        const browserWindow = browserWindows[browserWindowIndex];

        animation.object.position.x = computeSmoothChangeOfCoord(
            animation.object.position.x,
            browserWindow.shape.x + browserWindow.shape.width / 2
        );

        animation.object.position.y = computeSmoothChangeOfCoord(
            animation.object.position.y,
            browserWindow.shape.y + browserWindow.shape.height / 2
        );

        MultiSphereAnimation.moveAnimation(animation, time);
    }
}

function computeSmoothChangeOfCoord(currCoord: number, targetCoord: number): number {
    const newCoord = currCoord + (targetCoord - currCoord) * FALLOFF;

    return newCoord;
}

function updateWindowCurrentScreenPosition(): void {
    windowCurrentScreenPosition = { x: window.screenLeft, y: window.screenTop };
}

function setInitialAnimationsPositions(): void {
    for (let i = 0; i < animations.length; i++) {
        const animation = animations[i];
        const browserWindowIndex = windowManager.findWindowIndexById(
            animation.browserWindowId
        );
        const browserWindow = browserWindows[browserWindowIndex];

        animation.object.position.x =
            browserWindow.shape.x + browserWindow.shape.width / 2;

        animation.object.position.y =
            browserWindow.shape.y + browserWindow.shape.height / 2;
    }
}

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
    bloomComposer.setSize(width, height);
}

function saveStartTimeToLocalStorage(): void {
    if (localStorage.getItem("startTime") !== null) {
        return;
    }

    const time = new Date().getTime();

    localStorage.setItem("startTime", JSON.stringify(time));
}

function getTimeDifference() {
    const currentTime: number = new Date().getTime();

    const startTime: number = JSON.parse(localStorage.getItem("startTime") || "0");

    if (startTime == 0) console.error("Could not get startTime");

    return currentTime - startTime;
}

function resetApp() {
    localStorage.clear();

    windowManager.onAppRestart();

    location.reload();
}

if (window.location.pathname === "/clear") {
    localStorage.clear();

    window.location.pathname = "/";
} else {
    setupAndInit();
}
