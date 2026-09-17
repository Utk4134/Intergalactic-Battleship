import { Projectile } from './Projectile.js';
import { GUNS } from '../../config/Constants.js';

export class Bullet extends Projectile {
    constructor(x, y, angle) {
        super(x, y, GUNS.BULLET_RADIUS, 'player', GUNS.DAMAGE);
        this.lifespan = GUNS.LIFESPAN;
        this.vel.set(
            Math.cos(angle) * GUNS.SPEED,
            Math.sin(angle) * GUNS.SPEED
        );
    }

    render(ctx) {
        ctx.fillStyle = GUNS.COLOR;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
