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

    flowDirection: number; // Radians

    theta: number;
    phi: number;
};

export type sphereType = {
    r: number;
    tets: tetType[];
};

export type animationDataType = {
    spheres: sphereType[];
};

export type windowScreenPositionType = { x: number; y: number };
