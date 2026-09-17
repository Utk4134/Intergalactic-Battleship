import { Entity } from './Entity.js';
import { ALIEN, ALIEN_PROJ } from '../config/Constants.js';
import { randRange, angleBetween } from '../core/MathUtils.js';
import { Vector2 } from '../core/Vector2.js';

export class AlienShip extends Entity {
    constructor(x, y, type, speedMult = 1) {
        const config = ALIEN[type];
        super(x, y, config.radius, 'enemy');
        this.type = type;
        this.config = config;
        this.hp = config.hp;
        this.maxHp = config.hp;
        this.planetDmg = config.planetDmg;
        this.scoreValue = config.score;
        this.fireTimer = randRange(0, config.fireRate);
        this.burstTimer = 0;
        this.burstCount = 0;
        this.shooting = false;

        const speed = randRange(config.speedMin, config.speedMax) * speedMult;
        this.vel.set(0, speed);
    }

    update(dt, world) {
        if (!world.player || !world.planet) {
            super.update(dt, world);
            return;
        }

        const planetPos = world.planet.pos;
        const toPlanet = planetPos.sub(this.pos);
        const distToPlanet = toPlanet.length();

        if (distToPlanet > 150) {
            const moveDir = toPlanet.normalize();
            const speed = this.vel.length();
            this.vel.lerp(moveDir.scale(speed), 0.02);
            this.vel.scaleSelf(this.vel.length() > 0 ? speed / this.vel.length() : 1);
        }

        super.update(dt, world);

        this.rotation = angleBetween(this.pos, world.player.pos);

        this.fireTimer -= dt;
        if (this.fireTimer <= 0 && !this.shooting) {
            this.shooting = true;
            this.burstCount = 0;
            this.burstTimer = 0;
        }

        if (this.shooting) {
            const burstDelay = this.config.burstDelay || 0;
            if (burstDelay > 0) {
                this.burstTimer -= dt;
                if (this.burstTimer <= 0) {
                    this._fire(world);
                    this.burstCount++;
                    this.burstTimer = burstDelay;
                    if (this.burstCount >= (this.config.burstCount || 1)) {
                        this.shooting = false;
                        this.fireTimer = this.config.fireRate;
                    }
                }
            } else {
                this._fire(world);
                this.shooting = false;
                this.fireTimer = this.config.fireRate;
            }
        }
    }

    _fire(world) {
        if (!world.player) return;
        const angle = angleBetween(this.pos, world.player.pos);
        const proj = new AlienProjectile(
            this.pos.x + Math.cos(angle) * this.radius,
            this.pos.y + Math.sin(angle) * this.radius,
            angle,
            this.config.damage
        );
        world.projectiles.push(proj);
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.rotation);

        const r = this.radius;
        ctx.fillStyle = this.config.color;

        if (this.type === 'SCOUT') {
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(-r * 0.7, -r * 0.6);
            ctx.lineTo(-r * 0.4, 0);
            ctx.lineTo(-r * 0.7, r * 0.6);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(r * 0.5, -r * 0.5);
            ctx.lineTo(-r * 0.3, -r * 0.7);
            ctx.lineTo(-r * 0.5, 0);
            ctx.lineTo(-r * 0.3, r * 0.7);
            ctx.lineTo(r * 0.5, r * 0.5);
            ctx.closePath();
            ctx.fill();
        }

        ctx.strokeStyle = '#ffffff33';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }
}

class AlienProjectile extends Entity {
    constructor(x, y, angle, damage = 8) {
        super(x, y, ALIEN_PROJ.RADIUS, 'enemy');
        this.damage = damage;
        this.planetDmg = damage;
        this.vel.set(
            Math.cos(angle) * ALIEN_PROJ.SPEED,
            Math.sin(angle) * ALIEN_PROJ.SPEED
        );
    }

    render(ctx) {
        ctx.fillStyle = ALIEN_PROJ.COLOR;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
