import { Projectile } from './Projectile.js';
import { MISSILE } from '../../config/Constants.js';
import { angleBetween, normalizeAngle, angleDiff, isAngleInRange } from '../../core/MathUtils.js';

export class Missile extends Projectile {
    constructor(x, y, angle) {
        super(x, y, MISSILE.RADIUS, 'player', MISSILE.DAMAGE);
        this.lifespan = MISSILE.LIFESPAN;
        this.vel.set(
            Math.cos(angle) * MISSILE.SPEED,
            Math.sin(angle) * MISSILE.SPEED
        );
        this.target = null;
    }

    update(dt, world) {
        if (!this.target || !this.target.alive) {
            this.target = this._findTarget(world);
        }

        if (this.target) {
            const toTarget = angleBetween(this.pos, this.target.pos);
            const currentAngle = this.vel.angle();
            const diff = angleDiff(currentAngle, toTarget);
            const maxTurn = MISSILE.TURN_RATE * dt;

            if (Math.abs(diff) <= maxTurn) {
                this.vel = this.vel.rotate(diff);
            } else {
                this.vel = this.vel.rotate(Math.sign(diff) * maxTurn);
            }
        }

        super.update(dt, world);
    }

    _findTarget(world) {
        let nearest = null;
        let nearestDist = Infinity;
        const forwardAngle = this.vel.angle();

        for (const entity of world.entities) {
            if (!entity.alive || entity.faction !== 'enemy') continue;
            const toEntity = angleBetween(this.pos, entity.pos);
            if (!isAngleInRange(toEntity, forwardAngle, MISSILE.SEEK_CONE)) continue;
            const dist = this.pos.distanceTo(entity.pos);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = entity;
            }
        }
        return nearest;
    }

    onHit(target) {
        this.alive = false;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.vel.angle());

        ctx.fillStyle = MISSILE.COLOR;
        ctx.beginPath();
        ctx.moveTo(this.radius * 1.5, 0);
        ctx.lineTo(-this.radius, -this.radius * 0.7);
        ctx.lineTo(-this.radius * 0.5, 0);
        ctx.lineTo(-this.radius, this.radius * 0.7);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = MISSILE.THRUSTER_COLOR;
        ctx.beginPath();
        ctx.arc(-this.radius * 0.8, 0, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
