import { Weapon } from './Weapon.js';
import { LASER } from '../config/Constants.js';
import { CollisionSystem } from '../core/CollisionSystem.js';

export class LaserWeapon extends Weapon {
    constructor() {
        super();
        this.heat = 0;
        this.overheatTimer = 0;
        this.isFiring = false;
        this.hitEntities = [];
        this.killedEntities = [];
    }

    canFire() {
        return this.overheatTimer <= 0;
    }

    update(dt, player, world) {
        super.update(dt, player, world);

        this.hitEntities = [];
        this.killedEntities = [];

        if (this.overheatTimer > 0) {
            this.overheatTimer -= dt;
        }

        if (this.active && world.input.mouseDown && this.canFire()) {
            this.isFiring = true;
            this.heat += LASER.HEAT_GAIN * dt;

            if (this.heat >= LASER.OVERHEAT_THRESHOLD) {
                this.heat = LASER.OVERHEAT_THRESHOLD;
                this.overheatTimer = LASER.OVERHEAT_LOCKOUT;
                this.isFiring = false;
            }

            this._checkHits(player, world, dt);
        } else {
            this.isFiring = false;
        }

        if (!this.isFiring) {
            this.heat -= LASER.HEAT_DECAY * dt;
            if (this.heat < 0) this.heat = 0;
        }
    }

    _checkHits(player, world, dt) {
        const angle = player.rotation;
        const endX = player.pos.x + Math.cos(angle) * LASER.MAX_RANGE;
        const endY = player.pos.y + Math.sin(angle) * LASER.MAX_RANGE;

        const targets = [...world.entities];
        if (world.planet) targets.push(world.planet);

        for (const entity of targets) {
            if (!entity.alive || entity.faction !== 'enemy') continue;
            if (CollisionSystem.segmentCircle(
                player.pos.x, player.pos.y,
                endX, endY,
                entity.pos.x, entity.pos.y, entity.radius
            )) {
                entity.takeDamage(LASER.DAMAGE_PER_SEC * dt);
                this.hitEntities.push(entity);
                if (!entity.alive) {
                    this.killedEntities.push(entity);
                }
            }
        }
    }

    getEndPos(player) {
        const angle = player.rotation;
        return {
            x: player.pos.x + Math.cos(angle) * LASER.MAX_RANGE,
            y: player.pos.y + Math.sin(angle) * LASER.MAX_RANGE,
        };
    }

    reset() {
        super.reset();
        this.heat = 0;
        this.overheatTimer = 0;
        this.isFiring = false;
        this.hitEntities = [];
    }

    getDisplayInfo() {
        return {
            type: 'laser',
            heat: this.heat,
            overheatTimer: this.overheatTimer,
            overheatMax: LASER.OVERHEAT_THRESHOLD,
        };
    }
}
