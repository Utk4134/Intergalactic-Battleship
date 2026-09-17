import { Entity } from './Entity.js';
import { ASTEROID } from '../config/Constants.js';
import { randRange, randInt } from '../core/MathUtils.js';

export class Asteroid extends Entity {
    constructor(x, y, sizeKey, speedMult = 1) {
        const size = ASTEROID.SIZES[sizeKey];
        super(x, y, size.radius, 'enemy');
        this.sizeKey = sizeKey;
        this.hp = size.hp;
        this.maxHp = size.hp;
        this.planetDmg = size.planetDmg;
        this.scoreValue = size.score;
        this.splitType = size.splits;
        this.rotationSpeed = randRange(-2, 2);

        const speed = randRange(size.speedMin, size.speedMax) * speedMult;
        const angle = Math.atan2(1, 0) + randRange(-0.4, 0.4);
        this.vel.set(Math.cos(angle) * speed, Math.sin(angle) * speed);

        this.vertices = this._generateVertices();
    }

    _generateVertices() {
        const count = randInt(ASTEROID.VERTEX_COUNT_MIN, ASTEROID.VERTEX_COUNT_MAX);
        const verts = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const jag = 1 + randRange(-ASTEROID.JAGGEDNESS, ASTEROID.JAGGEDNESS);
            verts.push({
                x: Math.cos(angle) * this.radius * jag,
                y: Math.sin(angle) * this.radius * jag,
            });
        }
        return verts;
    }

    aimAtTarget(targetPos) {
        const dx = targetPos.x - this.pos.x;
        const dy = targetPos.y - this.pos.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
            this.vel.set((dx / len) * this.vel.length(), (dy / len) * this.vel.length());
        }
    }

    update(dt, world) {
        super.update(dt, world);
        this.rotation += this.rotationSpeed * dt;
    }

    split(world) {
        if (!this.splitType) return [];
        const children = [];
        for (let i = 0; i < 2; i++) {
            const offset = i === 0 ? -15 : 15;
            const child = new Asteroid(
                this.pos.x + offset,
                this.pos.y + offset,
                this.splitType,
                1
            );
            const perpAngle = Math.atan2(this.vel.y, this.vel.x) + (i === 0 ? 0.5 : -0.5);
            const speed = child.vel.length();
            child.vel.set(Math.cos(perpAngle) * speed, Math.sin(perpAngle) * speed);
            children.push(child);
        }
        return children;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.rotation);

        ctx.fillStyle = ASTEROID.COLOR;
        ctx.strokeStyle = ASTEROID.OUTLINE_COLOR;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}
