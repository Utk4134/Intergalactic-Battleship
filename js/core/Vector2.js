export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    addSelf(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    subSelf(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    scale(s) {
        return new Vector2(this.x * s, this.y * s);
    }

    scaleSelf(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vector2(0, 0);
        return new Vector2(this.x / len, this.y / len);
    }

    normalizeSelf() {
        const len = this.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    distanceTo(v) {
        return this.sub(v).length();
    }

    distanceSqTo(v) {
        return this.sub(v).lengthSq();
    }

    lerp(v, t) {
        return new Vector2(
            this.x + (v.x - this.x) * t,
            this.y + (v.y - this.y) * t
        );
    }

    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    static fromAngle(angle, length = 1) {
        return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
    }
}
