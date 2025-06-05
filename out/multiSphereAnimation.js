import * as three from "three";
export class MultiSphereAnimation {
    constructor(browserWindowId) {
        this.browserWindowId = browserWindowId;
        this.spheresData = MultiSphereAnimation.generateAnimationData(this.browserWindowId);
        this.object = MultiSphereAnimation.generateAnimationObject(this.spheresData, this.browserWindowId);
    }
    static generateAnimationData(browserWindowId) {
        const spheresData = [];
        const spheresStorageData = [];
        const animationRadius = this.FIRST_ANIMATION_RADIUS +
            browserWindowId * this.RADIUS_ANIMATIONS_DIFFERENCE;
        let tet, tetStorage;
        let x, y, z, flowDir, radiusAtY, sphere, sphereStorage;
        let phi = Math.PI * (Math.sqrt(5) - 1); // golden angle in radians
        let theta = 0;
        for (let i = 0; i < this.SPHERES_PER_INSTANCE; i++) {
            sphere = {
                r: animationRadius + this.RADIUS_SPHERE_DIFFERENCE * i,
                tets: [],
            };
            sphereStorage = {
                tets: [],
            };
            // evenly distributing tets on a sphere using fibonacci sphere algorithm
            for (let j = 0; j < this.TETS_PER_SPHERE; j++) {
                // from -sphere.r to sphere.r
                y = (1 - (j / this.TETS_PER_SPHERE) * 2) * sphere.r;
                radiusAtY = Math.sqrt(sphere.r * sphere.r - y * y);
                theta = phi * j;
                x = radiusAtY * Math.cos(theta);
                z = radiusAtY * Math.sin(theta);
                flowDir = 2 * Math.PI * Math.random();
                tet = {
                    x: x,
                    y: y,
                    z: z,
                };
                tetStorage = {
                    flowDirection: flowDir,
                    thetaBase: theta,
                    phiBase: phi,
                };
                sphere.tets.push(tet);
                sphereStorage.tets.push(tetStorage);
            }
            spheresData.push(sphere);
            spheresStorageData.push(sphereStorage);
        }
        const animationDataStorage = {
            id: browserWindowId,
            spheres: spheresStorageData,
        };
        this.pushAnimationDataToLocalStorage(animationDataStorage);
        return spheresData;
    }
    static generateAnimationObject(spheresData, colorOffset) {
        const animationObject = new three.Object3D();
        const tetrahedronGeometry = new three.TetrahedronGeometry(10);
        for (let i = 0; i < spheresData.length; i++) {
            const sphere = spheresData[i];
            const sphereAnchor = new three.Object3D();
            for (let j = 0; j < sphere.tets.length; j++) {
                const tet = sphere.tets[j];
                const tetrahedronMaterial = new three.MeshBasicMaterial({
                    wireframe: true,
                });
                tetrahedronMaterial.color.setHSL(0.1 * colorOffset, 1, 0.55);
                const tetrahedronObject = new three.Mesh(tetrahedronGeometry, tetrahedronMaterial);
                tetrahedronObject.position.x = tet.x;
                tetrahedronObject.position.y = tet.y;
                tetrahedronObject.position.z = tet.z;
                sphereAnchor.add(tetrahedronObject);
            }
            sphereAnchor.name = "sphereAnchor" + i;
            animationObject.add(sphereAnchor);
        }
        return animationObject;
    }
    static moveAnimation(animation, time) {
        let sphere, sphereObj, sphereStorage;
        let negative;
        this.t = time / 100;
        const animationStorage = this.getAnimationDataFromLocalStorageById(animation.browserWindowId);
        for (let i = 0; i < animation.spheresData.length; i++) {
            sphere = animation.spheresData[i];
            sphereStorage = animationStorage.spheres[i];
            sphereObj = animation.object.children[i];
            // move tets
            MultiSphereAnimation.moveTetsOfSphere(sphere, sphereObj, sphereStorage);
            negative = i % 2 == 1;
            // rotate spheres
            sphereObj.rotation.x = this.t * 0.02 * (i % 3) * (negative ? 1 : -1);
            sphereObj.rotation.y = this.t * 0.02 * ((i + 1) % 3) * (negative ? -1 : 1);
            sphereObj.rotation.z = this.t * 0.02 * ((i + 2) % 3) * (negative ? 1 : -1);
        }
    }
    static moveTetsOfSphere(sphere, sphereObj, sphereStorage) {
        let dTheta, dPhi;
        let currTetha, currPhi;
        let tetStorage, tetObj;
        let negative;
        for (let j = 0; j < sphere.tets.length; j++) {
            tetStorage = sphereStorage.tets[j];
            tetObj = sphereObj.children[j];
            dTheta =
                Math.cos(tetStorage.flowDirection) *
                    MultiSphereAnimation.TETS_MOVING_SPEED *
                    this.t;
            dPhi =
                Math.sin(tetStorage.flowDirection) *
                    MultiSphereAnimation.TETS_MOVING_SPEED *
                    this.t;
            currTetha = tetStorage.thetaBase + dTheta;
            currPhi = tetStorage.phiBase + dPhi;
            tetObj.position.x = sphere.r * Math.sin(currTetha) * Math.cos(currPhi);
            tetObj.position.y = sphere.r * Math.sin(currTetha) * Math.sin(currPhi);
            tetObj.position.z = sphere.r * Math.cos(currTetha);
            negative = j % 2 == 0;
            tetObj.rotation.x = this.t * 0.2 * (j % 3) * (negative ? -1 : 1);
            tetObj.rotation.y = this.t * 0.2 * ((j + 1) % 3) * (negative ? 1 : -1);
            tetObj.rotation.z = this.t * 0.2 * ((j + 2) % 3) * (negative ? -1 : 1);
        }
    }
    static getAnimationsDataFromLocalStorage() {
        const animationsInStorage = JSON.parse(localStorage.getItem(this.ANIMATIONS_DATA_KEY) || "[]");
        return animationsInStorage;
    }
    static getAnimationDataFromLocalStorageById(id) {
        const animationsInStorage = JSON.parse(localStorage.getItem(this.ANIMATIONS_DATA_KEY) || "[]");
        for (let i = 0; i < animationsInStorage.length; i++) {
            if (animationsInStorage[i].id === id)
                return animationsInStorage[i];
        }
        console.error("Could not find in local storage animation data with id: " +
            id +
            ", returning first one.");
        return animationsInStorage[0];
    }
    static pushAnimationDataToLocalStorage(animationData) {
        const animationsInStorage = this.getAnimationsDataFromLocalStorage();
        animationsInStorage.push(animationData);
        localStorage.setItem(this.ANIMATIONS_DATA_KEY, JSON.stringify(animationsInStorage));
    }
    static removeAnimationDataFromLocalStorageById(id) {
        const animationsInStorage = this.getAnimationsDataFromLocalStorage();
        let index = -1;
        for (let i = 0; i < animationsInStorage.length; i++) {
            if (animationsInStorage[i].id === id) {
                index = i;
                break;
            }
        }
        if (index !== -1)
            animationsInStorage.splice(index, 1);
        localStorage.setItem(this.ANIMATIONS_DATA_KEY, JSON.stringify(animationsInStorage));
    }
    static removeAllAnimationsDataFromLocalStorage() {
        localStorage.setItem(this.ANIMATIONS_DATA_KEY, "[]");
    }
}
MultiSphereAnimation.ANIMATIONS_DATA_KEY = "animationsData";
MultiSphereAnimation.FIRST_ANIMATION_RADIUS = 150;
MultiSphereAnimation.RADIUS_SPHERE_DIFFERENCE = 10;
MultiSphereAnimation.RADIUS_ANIMATIONS_DIFFERENCE = 30;
MultiSphereAnimation.TETS_PER_SPHERE = 50;
MultiSphereAnimation.SPHERES_PER_INSTANCE = 4;
MultiSphereAnimation.TETS_MOVING_SPEED = 0.1;
MultiSphereAnimation.t = 0;
