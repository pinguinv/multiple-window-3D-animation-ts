const INSTANCES_KEY = "browserWindows";
const INSTANCES_COUNT_KEY = "browserWindowsCount";
class BrowserWindowManager {
    constructor() {
        this.instances = [];
        this.instanceCount = 0;
        this.instanceShapeChangedCallback = null;
        this.instancesCountChangedCallback = null;
        addEventListener("storage", (event) => {
            if (event.key == "browserWindows") {
                let newInstances = JSON.parse(event.newValue);
                const instancesChanged = this.checkIfInstancesChanged(newInstances);
                this.instances = newInstances;
                if (instancesChanged) {
                    if (this.instancesCountChangedCallback != undefined)
                        this.instancesCountChangedCallback();
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
    initInstance(metadata) {
        this.instances = JSON.parse(localStorage.getItem(INSTANCES_KEY) || "[]");
        this.instanceCount = parseInt(JSON.parse(localStorage.getItem(INSTANCES_COUNT_KEY) || "0"));
        this.instanceData = {
            id: this.instanceCount++,
            shape: this.getBrowserWindowShape(),
            metadata: metadata,
        };
        this.instances.push(this.instanceData);
        this.updateInstancesLocalStorage();
    }
    getBrowserWindowShape() {
        return {
            x: window.screenLeft,
            y: window.screenTop,
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }
    logInstances() {
        console.log(this.instances);
    }
    updateInstanceShape() {
        const currWindowShape = this.getBrowserWindowShape();
        const shapeChanged = currWindowShape.x != this.instanceData.shape.x ||
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
    updateInstancesLocalStorage() {
        localStorage.setItem(INSTANCES_KEY, JSON.stringify(this.instances));
        localStorage.setItem(INSTANCES_COUNT_KEY, JSON.stringify(this.instanceCount));
    }
    checkIfInstancesChanged(newInstances) {
        if (this.instances.length != newInstances.length)
            return true;
        for (let i = 0; i < this.instances.length; i++)
            if (this.instances[i].id != newInstances[i].id)
                return true;
        return false;
    }
    findInstanceIndexById(id) {
        // console.log("findInstanceIndexById ID: " + id);
        // console.log(this.instances);
        for (let i = 0; i < this.instances.length; i++) {
            if (this.instances[i].id == id)
                return i;
        }
        console.error("Instance index not found! Returning -1");
        return -1;
    }
    getInstances() {
        return this.instances;
    }
    setInstanceShapeChangedCallback(cb) {
        this.instanceShapeChangedCallback = cb;
    }
    setInstancesCountChangedCallback(cb) {
        this.instancesCountChangedCallback = cb;
    }
}
export default BrowserWindowManager;
