import * as three from "three";
import { BrowserWindowManager } from "./windowManager.js";
import { MultiSphereAnimation } from "./multiSphereAnimation.js";
const NEAR = -1000, FAR = 1000;
const FALLOFF = 0.05;
let windowManager;
let windowCurrentScreenPosition = { x: 0, y: 0 };
let renderer, camera, scene, world;
let browserWindows = [];
let animations = [];
function setupAndInit() {
    setupRenderer();
    setupSceneAndCamera();
    setupWindowManager();
    updateWindowCurrentScreenPosition();
    setInitialAnimationsPositions();
    renderAnimations();
    window.addEventListener("resize", resizeCameraAndRenderer);
    saveStartTimeToLocalStorage();
}
function setupWindowManager() {
    windowManager = new BrowserWindowManager();
    windowManager.setWindowShapeChangedCallback(updateWindowCurrentScreenPosition);
    windowManager.setWindowCountChangedCallback(onBrowserWindowCountChanged);
    windowManager.initWindow();
    onBrowserWindowCountChanged();
}
function setupRenderer() {
    renderer = new three.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.setAttribute("id", "renderer");
    document.body.appendChild(renderer.domElement);
    const pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
    renderer.setPixelRatio(pixelRatio);
}
function setupSceneAndCamera() {
    camera = new three.OrthographicCamera(0, window.innerWidth, 0, window.innerHeight, NEAR, FAR);
    camera.position.z = 50;
    scene = new three.Scene();
    scene.background = new three.Color().setHex(0x200050);
    world = new three.Object3D();
    scene.add(world);
}
function onBrowserWindowCountChanged() {
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
    renderer.render(scene, camera);
}
function moveAnimationsAndUpdatePositions(time) {
    world.position.x = -windowCurrentScreenPosition.x;
    world.position.y = -windowCurrentScreenPosition.y;
    browserWindows = windowManager.getWindows();
    for (let i = 0; i < animations.length; i++) {
        const animation = animations[i];
        const browserWindowIndex = windowManager.findWindowIndexById(animation.browserWindowId);
        const browserWindow = browserWindows[browserWindowIndex];
        animation.object.position.x = computeSmoothChangeOfCoord(animation.object.position.x, browserWindow.shape.x + browserWindow.shape.width / 2);
        animation.object.position.y = computeSmoothChangeOfCoord(animation.object.position.y, browserWindow.shape.y + browserWindow.shape.height / 2);
        MultiSphereAnimation.moveAnimation(animation, time);
    }
}
function computeSmoothChangeOfCoord(currCoord, targetCoord) {
    const newCoord = currCoord + (targetCoord - currCoord) * FALLOFF;
    return newCoord;
}
function updateWindowCurrentScreenPosition() {
    windowCurrentScreenPosition = { x: window.screenLeft, y: window.screenTop };
}
function setInitialAnimationsPositions() {
    for (let i = 0; i < animations.length; i++) {
        const animation = animations[i];
        const browserWindowIndex = windowManager.findWindowIndexById(animation.browserWindowId);
        const browserWindow = browserWindows[browserWindowIndex];
        animation.object.position.x =
            browserWindow.shape.x + browserWindow.shape.width / 2;
        animation.object.position.y =
            browserWindow.shape.y + browserWindow.shape.height / 2;
    }
}
function resizeCameraAndRenderer() {
    const width = window.innerWidth, height = window.innerHeight;
    camera.left = 0;
    camera.right = width;
    camera.top = 0;
    camera.bottom = height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
function saveStartTimeToLocalStorage() {
    if (localStorage.getItem("startTime") !== null) {
        return;
    }
    const time = new Date().getTime();
    localStorage.setItem("startTime", JSON.stringify(time));
}
function getTimeDifference() {
    const currentTime = new Date().getTime();
    const startTime = JSON.parse(localStorage.getItem("startTime") || "0");
    if (startTime == 0)
        console.error("Could not get startTime");
    return currentTime - startTime;
}
if (window.location.pathname === "/clear") {
    localStorage.clear();
    window.location.pathname = "/";
}
else {
    setupAndInit();
}
