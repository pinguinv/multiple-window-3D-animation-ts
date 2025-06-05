import { MultiSphereAnimation } from "./multiSphereAnimation";
import { BrowserWindowData, BrowserWindowShape } from "./types";

const WINDOWS_KEY: string = "browserWindows";
// WindowNextId is only for ID assigning purposes
const NEXT_WINDOW_ID_KEY: string = "browserWindowsNextId";

export class BrowserWindowManager {
    private windowData!: BrowserWindowData;

    private windows: BrowserWindowData[] = [];
    private windowNextId: number = 0;

    public windowShapeChangedCallback: any | null = null;
    public windowCountChangedCallback: any | null = null;

    constructor() {
        // event listener for when localStorage is changed - FROM ANOTHER WINDOW ONLY!!!
        addEventListener("storage", (event) => {
            if (event.key == WINDOWS_KEY) {
                const newWindows: BrowserWindowData[] = JSON.parse(event.newValue!);

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

            MultiSphereAnimation.removeAnimationDataFromLocalStorageById(
                this.windowData.id
            );

            this.updateWindowsLocalStorage();
        });
    }

    public initWindow(metadata?: string): void {
        this.windows = JSON.parse(localStorage.getItem(WINDOWS_KEY) || "[]");

        this.windowNextId = parseInt(
            JSON.parse(localStorage.getItem(NEXT_WINDOW_ID_KEY) || "0")
        );

        this.windowData = {
            id: this.windowNextId++,
            shape: this.getBrowserWindowShape(),
            metadata: metadata,
        };

        this.windows.push(this.windowData);

        this.updateWindowsLocalStorage();
    }

    public getBrowserWindowShape(): BrowserWindowShape {
        return {
            x: window.screenLeft,
            y: window.screenTop,
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }

    public logWindows() {
        console.log(this.windows);
    }

    public updateWindowShape(): void {
        const currWindowShape: BrowserWindowShape = this.getBrowserWindowShape();

        const shapeChanged = !this.checkIfEqualShapes(
            currWindowShape,
            this.windowData.shape
        );

        if (shapeChanged) {
            const index = this.findWindowIndexById(this.windowData.id);

            this.windowData.shape = currWindowShape;
            this.windows[index] = this.windowData;

            if (this.windowShapeChangedCallback !== null)
                this.windowShapeChangedCallback();

            this.updateWindowsLocalStorage();
        }
    }

    private updateWindowsLocalStorage() {
        localStorage.setItem(WINDOWS_KEY, JSON.stringify(this.windows));
        localStorage.setItem(NEXT_WINDOW_ID_KEY, JSON.stringify(this.windowNextId));
    }

    private checkIfEqualShapes(
        shape1: BrowserWindowShape,
        shape2: BrowserWindowShape
    ): boolean {
        return (
            shape1.x == shape2.x &&
            shape1.y == shape2.y &&
            shape1.width == shape2.width &&
            shape1.height == shape2.height
        );
    }

    public findWindowIndexById(id: number): number {
        for (let i = 0; i < this.windows.length; i++) {
            if (this.windows[i].id == id) return i;
        }

        console.error("Window index not found! Returning -1");

        return -1;
    }

    public getWindows() {
        return this.windows;
    }

    public setWindowShapeChangedCallback(cb: any) {
        this.windowShapeChangedCallback = cb;
    }

    public setWindowCountChangedCallback(cb: any) {
        this.windowCountChangedCallback = cb;
    }
}
