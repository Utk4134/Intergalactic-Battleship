export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function randRange(min, max) {
    return min + Math.random() * (max - min);
}

export function randInt(min, max) {
    return Math.floor(randRange(min, max + 1));
}

export function angleBetween(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
}

export function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
}

export function angleDiff(a, b) {
    return normalizeAngle(b - a);
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function isAngleInRange(angle, center, halfSpread) {
    const diff = Math.abs(normalizeAngle(angle - center));
    return diff <= halfSpread;
}
