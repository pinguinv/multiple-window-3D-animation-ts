type BrowserWindowShape = {
    x: number;
    y: number;
    width: number;
    height: number;
};

const INSTANCES_KEY: string = "browserWindows";
// Instance count is only for ID assigning purposes
const INSTANCES_COUNT_KEY: string = "browserWindowsCount";

export type BrowserWindowData = {
    id: number;
    shape: BrowserWindowShape;
    metadata: string | undefined;
};

export class BrowserWindowManager {
    private instanceData!: BrowserWindowData;

    private instances: BrowserWindowData[] = [];
    private instanceCount: number = 0;

    public instanceShapeChangedCallback: any | null = null;
    public instancesChangedCallback: any | null = null;

    constructor() {
        addEventListener("storage", (event) => {
            if (event.key == INSTANCES_KEY) {
                let newInstances: BrowserWindowData[] = JSON.parse(event.newValue!);

                const instancesChanged: boolean =
                    this.checkIfInstancesChanged(newInstances);

                this.instances = newInstances;

                if (instancesChanged) {
                    if (this.instancesChangedCallback != undefined)
                        this.instancesChangedCallback();
                }
            }
        });

        // Delete this instance before closing window
        window.addEventListener("beforeunload", (event) => {
            const index = this.findInstanceIndexById(this.instanceData.id);
            this.instances.splice(index, 1);
            this.instanceCount -= 1;

            //
            this.updateInstancesLocalStorage();
        });
    }

    public initInstance(metadata?: string): void {
        this.instances = JSON.parse(localStorage.getItem(INSTANCES_KEY) || "[]");

        this.instanceCount = parseInt(
            JSON.parse(localStorage.getItem(INSTANCES_COUNT_KEY) || "0")
        );

        this.instanceData = {
            id: this.instanceCount++,
            shape: this.getBrowserWindowShape(),
            metadata: metadata,
        };

        this.instances.push(this.instanceData);

        this.updateInstancesLocalStorage();
    }

    public getBrowserWindowShape(): BrowserWindowShape {
        return {
            x: window.screenLeft,
            y: window.screenTop,
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }

    public logInstances() {
        console.log(this.instances);
    }

    public updateInstanceShape(): void {
        const currWindowShape: BrowserWindowShape = this.getBrowserWindowShape();

        const shapeChanged =
            currWindowShape.x != this.instanceData.shape.x ||
            currWindowShape.y != this.instanceData.shape.y ||
            currWindowShape.width != this.instanceData.shape.width ||
            currWindowShape.height != this.instanceData.shape.height;

        // console.log(
        //     "x: " +
        //         (currWindowShape.x != this.instanceData.shape.x) +
        //         "\ny: " +
        //         (currWindowShape.y != this.instanceData.shape.y) +
        //         "\nwidth: " +
        //         (currWindowShape.width != this.instanceData.shape.width) +
        //         " \nheight: " +
        //         (currWindowShape.height != this.instanceData.shape.height)
        // );
        if (shapeChanged) {
            const index = this.findInstanceIndexById(this.instanceData.id);

            this.instanceData.shape = currWindowShape;
            this.instances[index] = this.instanceData;

            if (this.instanceShapeChangedCallback != null)
                this.instanceShapeChangedCallback();

            this.updateInstancesLocalStorage();

            console.log("Shape and position updated");
        }
    }

    private updateInstancesLocalStorage() {
        localStorage.setItem(INSTANCES_KEY, JSON.stringify(this.instances));
        localStorage.setItem(INSTANCES_COUNT_KEY, JSON.stringify(this.instanceCount));
    }

    private checkIfInstancesChanged(newInstances: BrowserWindowData[]): boolean {
        if (this.instances.length != newInstances.length) return true;

        for (let i = 0; i < this.instances.length; i++)
            if (this.instances[i].id != newInstances[i].id) return true;

        return false;
    }

    private findInstanceIndexById(id: number): number {
        // console.log("findInstanceIndexById ID: " + id);
        // console.log(this.instances);

        for (let i = 0; i < this.instances.length; i++) {
            if (this.instances[i].id == id) return i;
        }

        console.error("Instance index not found! Returning -1");

        return -1;
    }

    public getInstances() {
        return this.instances;
    }

    public setInstanceShapeChangedCallback(cb: any) {
        this.instanceShapeChangedCallback = cb;
    }

    public setInstancesChangedCallback(cb: any) {
        this.instancesChangedCallback = cb;
    }
}
