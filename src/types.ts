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

export type animationType = {
    colorIndex: number;
    spheres: sphereType[];
};

export type windowScreenPositionType = { x: number; y: number };
