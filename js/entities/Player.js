import { Entity } from './Entity.js';
import { PLAYER } from '../config/Constants.js';
import { Vector2 } from '../core/Vector2.js';
import { clamp, angleBetween } from '../core/MathUtils.js';
import { GunWeapon } from '../weapons/GunWeapon.js';
import { LaserWeapon } from '../weapons/LaserWeapon.js';
import { MissileWeapon } from '../weapons/MissileWeapon.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, PLAYER.RADIUS, 'player');
        this.hp = PLAYER.SHIELD_HP;
        this.maxHp = PLAYER.SHIELD_HP;
        this.invulnTimer = 0;
        this.invulnFlicker = false;

        this.weapons = {
            gun: new GunWeapon(),
            laser: new LaserWeapon(),
            missile: new MissileWeapon(),
        };
        this.activeWeaponKey = 'gun';
        this.weaponOrder = ['gun', 'laser', 'missile'];

        this.thrustDir = new Vector2(0, 0);
    }

    get activeWeapon() {
        return this.weapons[this.activeWeaponKey];
    }

    reset(world) {
        const planetY = world.canvas.height - 80;
        this.pos.set(world.canvas.width / 2, planetY);
        this.vel.set(0, 0);
        this.hp = PLAYER.SHIELD_HP;
        this.alive = true;
        this.invulnTimer = 0;
        this.activeWeaponKey = 'gun';

        this.weapons.gun.reset();
        this.weapons.laser.reset();
        this.weapons.missile.reset();
    }

    update(dt, world) {
        const input = world.input;

        this.thrustDir.set(0, 0);
        if (input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp')) this.thrustDir.y -= 1;
        if (input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown')) this.thrustDir.y += 1;
        if (input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft')) this.thrustDir.x -= 1;
        if (input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight')) this.thrustDir.x += 1;

        if (this.thrustDir.lengthSq() > 0) {
            this.thrustDir.normalizeSelf();
            this.vel.addSelf(this.thrustDir.scale(PLAYER.ACCELERATION * dt));
        } else {
            const speed = this.vel.length();
            if (speed > 0) {
                const decel = PLAYER.DRAG * dt;
                if (decel >= speed) {
                    this.vel.set(0, 0);
                } else {
                    this.vel.scaleSelf(1 - decel / speed);
                }
            }
        }

        const spd = this.vel.length();
        if (spd > PLAYER.MAX_SPEED) {
            this.vel.scaleSelf(PLAYER.MAX_SPEED / spd);
        }

        super.update(dt, world);

        const halfR = this.radius;
        this.pos.x = clamp(this.pos.x, halfR, world.canvas.width - halfR);
        this.pos.y = clamp(this.pos.y, halfR, world.canvas.height - halfR);

        this.rotation = angleBetween(this.pos, input.mousePos);

        if (this.invulnTimer > 0) {
            this.invulnTimer -= dt;
            this.invulnFlicker = Math.floor(this.invulnTimer * 10) % 2 === 0;
        } else {
            this.invulnFlicker = false;
        }

        const scroll = input.consumeScroll();
        if (scroll !== 0) {
            const idx = this.weaponOrder.indexOf(this.activeWeaponKey);
            const next = scroll > 0 ? (idx + 1) % 3 : (idx + 2) % 3;
            this.activeWeaponKey = this.weaponOrder[next];
        }

        if (input.isKeyDown('Digit1')) this.activeWeaponKey = 'gun';
        if (input.isKeyDown('Digit2')) this.activeWeaponKey = 'laser';
        if (input.isKeyDown('Digit3')) this.activeWeaponKey = 'missile';

        if (input.mouseDown) {
            this.activeWeapon.startFiring();
        } else {
            this.activeWeapon.stopFiring();
        }

        this.activeWeapon.update(dt, this, world);
    }

    takeDamage(amount) {
        if (this.invulnTimer > 0) return;
        this.hp -= amount;
        this.invulnTimer = PLAYER.INVULN_TIME;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        }
    }

    render(ctx) {
        if (this.invulnFlicker) return;

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.rotation);

        ctx.fillStyle = PLAYER.COLOR;
        ctx.beginPath();
        ctx.moveTo(this.radius + 4, 0);
        ctx.lineTo(-this.radius, -this.radius * 0.7);
        ctx.lineTo(-this.radius * 0.5, 0);
        ctx.lineTo(-this.radius, this.radius * 0.7);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff33';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }
}
