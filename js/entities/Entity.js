import { Vector2 } from '../core/Vector2.js';

export class Entity {
    constructor(x, y, radius, faction) {
        this.pos = new Vector2(x, y);
        this.vel = new Vector2(0, 0);
        this.radius = radius;
        this.rotation = 0;
        this.faction = faction;
        this.alive = true;
        this.hp = 0;
        this.maxHp = 0;
    }

    update(dt, world) {
        this.pos.addSelf(this.vel.scale(dt));
    }

    render(ctx) {}

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        }
    }

    isOffScreen(width, height, margin = 100) {
        return (
            this.pos.x < -margin ||
            this.pos.x > width + margin ||
            this.pos.y < -margin ||
            this.pos.y > height + margin
        );
    }
}
