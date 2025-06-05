import { MultiSphereAnimation } from "./multiSphereAnimation.js";
const WINDOWS_KEY = "browserWindows";
// WindowNextId is only for ID assigning purposes
const NEXT_WINDOW_ID_KEY = "browserWindowsNextId";
export class BrowserWindowManager {
    constructor() {
        this.windows = [];
        this.windowNextId = 0;
        this.windowShapeChangedCallback = null;
        this.windowCountChangedCallback = null;
        // event listener for when localStorage is changed - FROM ANOTHER WINDOW ONLY!!!
        addEventListener("storage", (event) => {
            if (event.key == WINDOWS_KEY) {
                const newWindows = JSON.parse(event.newValue);
                const windowCountChanged = this.windows.length != newWindows.length;
                this.windows = newWindows;
                if (windowCountChanged) {
                    if (this.windowCountChangedCallback != null)
                        this.windowCountChangedCallback();
                }
            }
        });
        // Delete this window before closing actual window
        window.addEventListener("beforeunload", (event) => {
            const index = this.findWindowIndexById(this.windowData.id);
            this.windows.splice(index, 1);
            this.windowNextId -= 1;
            MultiSphereAnimation.removeAnimationDataFromLocalStorageById(this.windowData.id);
            this.updateWindowsLocalStorage();
        });
    }
    initWindow(metadata) {
        this.windows = JSON.parse(localStorage.getItem(WINDOWS_KEY) || "[]");
        this.windowNextId = parseInt(JSON.parse(localStorage.getItem(NEXT_WINDOW_ID_KEY) || "0"));
        this.windowData = {
            id: this.windowNextId++,
            shape: this.getBrowserWindowShape(),
            metadata: metadata,
        };
        this.windows.push(this.windowData);
        this.updateWindowsLocalStorage();
    }
    getBrowserWindowShape() {
        return {
            x: window.screenLeft,
            y: window.screenTop,
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }
    logWindows() {
        console.log(this.windows);
    }
    updateWindowShape() {
        const currWindowShape = this.getBrowserWindowShape();
        const shapeChanged = !this.checkIfEqualShapes(currWindowShape, this.windowData.shape);
        if (shapeChanged) {
            const index = this.findWindowIndexById(this.windowData.id);
            this.windowData.shape = currWindowShape;
            this.windows[index] = this.windowData;
            if (this.windowShapeChangedCallback !== null)
                this.windowShapeChangedCallback();
            this.updateWindowsLocalStorage();
        }
    }
    updateWindowsLocalStorage() {
        localStorage.setItem(WINDOWS_KEY, JSON.stringify(this.windows));
        localStorage.setItem(NEXT_WINDOW_ID_KEY, JSON.stringify(this.windowNextId));
    }
    checkIfEqualShapes(shape1, shape2) {
        return (shape1.x == shape2.x &&
            shape1.y == shape2.y &&
            shape1.width == shape2.width &&
            shape1.height == shape2.height);
    }
    findWindowIndexById(id) {
        for (let i = 0; i < this.windows.length; i++) {
            if (this.windows[i].id == id)
                return i;
        }
        console.error("Window index not found! Returning -1");
        return -1;
    }
    getWindows() {
        return this.windows;
    }
    setWindowShapeChangedCallback(cb) {
        this.windowShapeChangedCallback = cb;
    }
    setWindowCountChangedCallback(cb) {
        this.windowCountChangedCallback = cb;
    }
}
