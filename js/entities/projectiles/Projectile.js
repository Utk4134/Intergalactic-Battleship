import { Entity } from '../Entity.js';

export class Projectile extends Entity {
    constructor(x, y, radius, faction, damage) {
        super(x, y, radius, faction);
        this.damage = damage;
        this.lifespan = 0;
        this.age = 0;
    }

    update(dt, world) {
        super.update(dt, world);
        this.age += dt;
        if (this.age >= this.lifespan) {
            this.alive = false;
        }
    }
}
