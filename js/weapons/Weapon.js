export class Weapon {
    constructor() {
        this.cooldown = 0;
        this.active = false;
    }

    canFire() {
        return this.cooldown <= 0;
    }

    startFiring() {
        this.active = true;
    }

    stopFiring() {
        this.active = false;
    }

    update(dt, player, world) {
        if (this.cooldown > 0) {
            this.cooldown -= dt;
        }
    }

    reset() {
        this.cooldown = 0;
        this.active = false;
    }

    getDisplayInfo() {
        return { type: 'none' };
    }
}
