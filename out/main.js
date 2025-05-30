import * as three from "three";
import { BrowserWindowManager } from "./windowManager.js";
import { MultiSphereAnimation } from "./multiSphereAnimation.js";
// Names clarification: tet is an abbreviation for tetrahedron
// GLOBAL CONSTANTS
const NEAR = -1000, FAR = 1000;
// GLOBAL VARIABLES
let windowManager;
let windowCurrentScreenPosition = { x: 0, y: 0 };
let renderer, camera, scene, world;
let browserWindows = [];
let animations = [];
function setupAndInit() {
    setupWindowManager();
    setupRenderer();
    setupSceneAndCamera();
    updateWindowCurrentScreenPosition();
    updateAnimations();
    renderAnimations();
    window.addEventListener("resize", resizeCameraAndRenderer);
}
function setupWindowManager() {
    windowManager = new BrowserWindowManager();
    windowManager.setInstanceShapeChangedCallback(updateWindowCurrentScreenPosition);
    windowManager.setInstancesChangedCallback(updateAnimations);
    windowManager.initInstance();
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
    // coordinate system :
    //  --> x
    // |
    // V y
    camera = new three.OrthographicCamera(0, window.innerWidth, 0, window.innerHeight, NEAR, FAR);
    camera.position.z = 50;
    scene = new three.Scene();
    scene.background = new three.Color().setHex(0x200050);
    // All animations will be added to `world`
    world = new three.Object3D();
    scene.add(world);
    // Temporary cube for orientation
    let cube = new three.Mesh(new three.BoxGeometry(50, 50, 50), new three.MeshBasicMaterial({ color: 0xffffff, wireframe: true }));
    cube.position.x = 50;
    cube.position.y = 50;
    world.add(cube);
}
function updateWindowCurrentScreenPosition() {
    windowCurrentScreenPosition = { x: window.screenLeft, y: window.screenTop };
    // Adjust world position
    world.position.x = -windowCurrentScreenPosition.x;
    world.position.y = -windowCurrentScreenPosition.y;
}
function updateAnimations() {
    const newBrowserWindows = windowManager.getInstances();
    if (newBrowserWindows.length != browserWindows.length) {
        browserWindows = newBrowserWindows;
        onBrowserWindowCountChanged();
    }
}
function onBrowserWindowCountChanged() {
    animations.forEach((animation) => world.remove(animation.object));
    animations = [];
    for (let i = 0; i < browserWindows.length; i++) {
        animations.push(new MultiSphereAnimation(browserWindows[i].id));
    }
    animations.forEach((animation) => world.add(animation.object));
}
function renderAnimations() {
    renderer.setAnimationLoop(render);
}
function render(time) {
    windowManager.updateInstanceShape();
    moveAnimations();
    renderer.render(scene, camera);
}
function moveAnimations() {
    adjustAnimationsPositions();
    for (let i = 0; i < animations.length; i++) {
        const animation = animations[i];
        MultiSphereAnimation.moveAnimation(animation);
    }
}
function adjustAnimationsPositions() {
    for (let i = 0; i < browserWindows.length; i++) {
        // TODO: position update needs to be done by browserWindowId, not index
        const window = browserWindows[i];
        const animation = findAnimationById(window.id);
        if (animation === null) {
            console.error("Couldn't find animation with BrowserWindowId: " + window.id);
            return;
        }
        // TODO: make position change smoother
        animation.object.position.x = window.shape.x + window.shape.width / 2;
        animation.object.position.y = window.shape.y + window.shape.height / 2;
    }
}
function findAnimationById(browserWindowId) {
    for (const animation of animations)
        if (animation.browserWindowId == browserWindowId)
            return animation;
    return null;
}
function resizeCameraAndRenderer() {
    // Ortographic camera
    const width = window.innerWidth, height = window.innerHeight;
    camera.left = 0;
    camera.right = width;
    camera.top = 0;
    camera.bottom = height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    console.log("Camera and Renderer resized.");
    // unnecessary call
    // updateWindowCurrentScreenPosition();
}
if (window.location.pathname === "/clear") {
    localStorage.clear();
}
else {
    setupAndInit();
}
