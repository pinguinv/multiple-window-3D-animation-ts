export type BrowserWindowShape = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type BrowserWindowData = {
    id: number;
    shape: BrowserWindowShape;
    metadata: string | undefined;
};

export type tetType = {
    x: number;
    y: number;
    z: number;
};

export type sphereType = {
    r: number;
    tets: tetType[];
};

export type tetStorageType = {
    flowDirection: number; // Radians
    thetaBase: number;
    phiBase: number;
};

export type sphereStorageType = {
    tets: tetStorageType[];
};

export type animationDataStorageType = {
    id: number;
    spheres: sphereStorageType[];
};

export type windowScreenPositionType = { x: number; y: number };
