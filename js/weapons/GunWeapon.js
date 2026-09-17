import { Weapon } from './Weapon.js';
import { Bullet } from '../entities/projectiles/Bullet.js';
import { GUNS } from '../config/Constants.js';

export class GunWeapon extends Weapon {
    constructor() {
        super();
        this.cooldown = 0;
    }

    update(dt, player, world) {
        super.update(dt, player, world);

        if (this.active && this.canFire() && world.input.mouseDown) {
            this._fire(player, world);
        }
    }

    _fire(player, world) {
        const angle = player.rotation;
        const bullet = new Bullet(
            player.pos.x + Math.cos(angle) * player.radius,
            player.pos.y + Math.sin(angle) * player.radius,
            angle
        );
        world.projectiles.push(bullet);
        this.cooldown = 1 / GUNS.FIRE_RATE;
    }

    getDisplayInfo() {
        return { type: 'gun', ammo: '∞' };
    }
}
