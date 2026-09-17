import { Weapon } from './Weapon.js';
import { Missile as MissileEntity } from '../entities/projectiles/Missile.js';
import { MISSILE } from '../config/Constants.js';

export class MissileWeapon extends Weapon {
    constructor() {
        super();
        this.ammo = MISSILE.MAX_AMMO;
        this.regenTimer = 0;
        this.fireCooldown = 0;
    }

    canFire() {
        return this.ammo > 0 && this.fireCooldown <= 0;
    }

    update(dt, player, world) {
        super.update(dt, player, world);

        if (this.fireCooldown > 0) {
            this.fireCooldown -= dt;
        }

        this.regenTimer += dt;
        if (this.regenTimer >= MISSILE.REGEN_TIME) {
            this.regenTimer -= MISSILE.REGEN_TIME;
            if (this.ammo < MISSILE.MAX_AMMO) {
                this.ammo++;
            }
        }

        if (this.active && world.input.mouseDown && this.canFire()) {
            this._fire(player, world);
        }
    }

    _fire(player, world) {
        const angle = player.rotation;
        const missile = new MissileEntity(
            player.pos.x + Math.cos(angle) * player.radius,
            player.pos.y + Math.sin(angle) * player.radius,
            angle
        );
        world.projectiles.push(missile);
        this.ammo--;
        this.fireCooldown = MISSILE.FIRE_COOLDOWN;
        this.regenTimer = 0;
    }

    reset() {
        super.reset();
        this.ammo = MISSILE.MAX_AMMO;
        this.regenTimer = 0;
        this.fireCooldown = 0;
    }

    getDisplayInfo() {
        return {
            type: 'missile',
            ammo: this.ammo,
            maxAmmo: MISSILE.MAX_AMMO,
            regenTimer: this.regenTimer,
            regenTime: MISSILE.REGEN_TIME,
        };
    }
}
