import { Entity } from './Entity.js';
import { PLANET } from '../config/Constants.js';

export class Planet extends Entity {
    constructor(x, y) {
        super(x, y, PLANET.RADIUS, 'friendly');
        this.hp = PLANET.HP;
        this.maxHp = PLANET.HP;
    }

    reset() {
        this.hp = PLANET.HP;
        this.alive = true;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        const gradient = ctx.createRadialGradient(0, 0, this.radius * 0.2, 0, 0, this.radius);
        gradient.addColorStop(0, '#66bbff');
        gradient.addColorStop(0.5, PLANET.COLOR);
        gradient.addColorStop(1, '#114466');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < PLANET.RING_COUNT; i++) {
            const ringR = this.radius + 6 + i * 5;
            ctx.strokeStyle = PLANET.RING_COLOR + (i === 0 ? '88' : '44');
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, ringR, ringR * 0.3, -0.3, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = '#88ddff44';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.3, -this.radius * 0.2, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
