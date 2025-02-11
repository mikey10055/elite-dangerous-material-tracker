export function distance3D(point1, point2) {
    const [x1, y1, z1] = point1;
    const [x2, y2, z2] = point2;

    return Math.sqrt(
        Math.pow(x2 - x1, 2) +
        Math.pow(y2 - y1, 2) +
        Math.pow(z2 - z1, 2)
    );
}
