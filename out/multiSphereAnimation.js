import * as three from "three";
export class MultiSphereAnimation {
    constructor(browserWindowId) {
        this.browserWindowId = browserWindowId;
        this.spheresData = MultiSphereAnimation.generateAnimationData(this.browserWindowId);
        this.object = MultiSphereAnimation.generateAnimationObject(this.spheresData, this.browserWindowId);
    }
    static generateAnimationData(browserWindowId) {
        const spheresData = [];
        const animationRadius = this.FIRST_ANIMATION_RADIUS +
            browserWindowId * this.RADIUS_ANIMATIONS_DIFFERENCE;
        let tet;
        let x, y, z, radiusAtY, sphere;
        let phi = Math.PI * (Math.sqrt(5) - 1); // golden angle in radians
        let theta = 0;
        for (let i = 0; i < this.SPHERES_PER_INSTANCE; i++) {
            sphere = {
                // radius + 10% * i
                r: animationRadius + this.RADIUS_SPHERE_DIFFERENCE * i,
                tets: [],
            };
            // evenly distributing tets on a sphere using fibonacci sphere algorithm
            for (let j = 0; j < this.TETS_PER_SPHERE; j++) {
                // (from -sphere.r to sphere.r)
                y = (1 - (j / this.TETS_PER_SPHERE) * 2) * sphere.r;
                radiusAtY = Math.sqrt(sphere.r * sphere.r - y * y);
                theta = phi * j;
                x = radiusAtY * Math.cos(theta);
                z = radiusAtY * Math.sin(theta);
                tet = {
                    x: x,
                    y: y,
                    z: z,
                    // flowDirection: 2 * Math.PI,
                    flowDirection: 2 * Math.PI * Math.random(),
                    theta: theta,
                    phi: phi,
                };
                sphere.tets.push(tet);
            }
            spheresData.push(sphere);
        }
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
    static moveAnimation(animation) {
        let sphere, sphereObj;
        let negative;
        const time = new Date().getTime();
        this.t = time / 100;
        for (let i = 0; i < animation.spheresData.length; i++) {
            sphere = animation.spheresData[i];
            sphereObj = animation.object.children[i];
            // move tets
            MultiSphereAnimation.moveTetsOfSphere(sphere, sphereObj);
            negative = i % 2 == 1;
            // rotate spheres
            sphereObj.rotation.x = this.t * 0.02 * (i % 3) * (negative ? 1 : -1);
            sphereObj.rotation.y = this.t * 0.02 * ((i + 1) % 3) * (negative ? -1 : 1);
            sphereObj.rotation.z = this.t * 0.02 * ((i + 2) % 3) * (negative ? 1 : -1);
        }
    }
    static moveTetsOfSphere(sphere, sphereObj) {
        let dTheta, dPhi;
        let tet, tetObj;
        let negative;
        for (let j = 0; j < sphere.tets.length; j++) {
            tet = sphere.tets[j];
            tetObj = sphereObj.children[j];
            dTheta = Math.cos(tet.flowDirection) * MultiSphereAnimation.TETS_MOVING_SPEED;
            dPhi = Math.sin(tet.flowDirection) * MultiSphereAnimation.TETS_MOVING_SPEED;
            tet.theta += dTheta;
            tet.phi += dPhi;
            tetObj.position.x = sphere.r * Math.sin(tet.theta) * Math.cos(tet.phi);
            tetObj.position.y = sphere.r * Math.sin(tet.theta) * Math.sin(tet.phi);
            tetObj.position.z = sphere.r * Math.cos(tet.theta);
            negative = j % 2 == 0;
            tetObj.rotation.x = this.t * 0.2 * (j % 3) * (negative ? -1 : 1);
            tetObj.rotation.y = this.t * 0.2 * ((j + 1) % 3) * (negative ? 1 : -1);
            tetObj.rotation.z = this.t * 0.2 * ((j + 2) % 3) * (negative ? -1 : 1);
        }
    }
}
MultiSphereAnimation.FIRST_ANIMATION_RADIUS = 150;
MultiSphereAnimation.RADIUS_SPHERE_DIFFERENCE = 10;
MultiSphereAnimation.RADIUS_ANIMATIONS_DIFFERENCE = 30;
// public static TETS_PER_SPHERE = 1 as const;
// public static SPHERES_PER_INSTANCE = 4 as const;
MultiSphereAnimation.TETS_PER_SPHERE = 50;
MultiSphereAnimation.SPHERES_PER_INSTANCE = 4;
MultiSphereAnimation.TETS_MOVING_SPEED = 0.015;
MultiSphereAnimation.t = 0;
