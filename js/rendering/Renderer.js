import { GAME, PLANET, HUD, LASER, GUNS } from '../config/Constants.js';
import { GameState } from '../state/GameStateManager.js';
import { LaserWeapon } from '../weapons/LaserWeapon.js';

export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.stars = [];
        this._generateStars();
    }

    _generateStars() {
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.5 + 0.5,
                twinkleSpeed: Math.random() * 2 + 1,
            });
        }
    }

    render(ctx, engine) {
        const w = engine.canvas.width;
        const h = engine.canvas.height;

        ctx.fillStyle = GAME.CANVAS_BG;
        ctx.fillRect(0, 0, w, h);

        this._drawStars(ctx, w, h, engine.elapsedTime);

        if (engine.planet) engine.planet.render(ctx);

        for (const entity of engine.entities) {
            entity.render(ctx);
        }

        for (const proj of engine.projectiles) {
            proj.render(ctx);
        }

        if (engine.player) {
            if (engine.player.activeWeapon instanceof LaserWeapon) {
                const laser = engine.player.activeWeapon;
                if (laser.isFiring) {
                    this._drawLaser(ctx, engine.player, laser);
                }
            }
            engine.player.render(ctx);
        }

        this._drawHUD(ctx, engine);

        if (engine.stateManager.isPaused()) {
            this._drawPauseOverlay(ctx, w, h);
        }
        if (engine.stateManager.isGameOver()) {
            this._drawGameOverOverlay(ctx, w, h, engine.scoreManager.getScore());
        }
    }

    _drawStars(ctx, w, h, time) {
        for (const star of this.stars) {
            const alpha = star.brightness * (0.7 + 0.3 * Math.sin(time * star.twinkleSpeed));
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(
                star.x * w,
                star.y * h,
                star.size,
                star.size
            );
        }
    }

    _drawLaser(ctx, player, laser) {
        const end = laser.getEndPos(player);

        ctx.strokeStyle = LASER.COLOR;
        ctx.lineWidth = LASER.WIDTH + 4;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(player.pos.x, player.pos.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.strokeStyle = LASER.CORE_COLOR;
        ctx.lineWidth = LASER.WIDTH;
        ctx.beginPath();
        ctx.moveTo(player.pos.x, player.pos.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    _drawHUD(ctx, engine) {
        const w = engine.canvas.width;
        const h = engine.canvas.height;
        const m = HUD.BAR_MARGIN;

        ctx.font = `${HUD.SCORE_FONT_SIZE}px ${HUD.FONT_FAMILY}`;
        ctx.fillStyle = HUD.COLORS.TEXT;
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${engine.scoreManager.getScore()}`, m + 4, m + HUD.SCORE_FONT_SIZE);

        const barX = (w - HUD.BAR_WIDTH) / 2;
        this._drawBar(ctx, barX, m, HUD.BAR_WIDTH, HUD.BAR_HEIGHT,
            engine.planet.hp / engine.planet.maxHp,
            HUD.COLORS.PLANET_BAR_BG, HUD.COLORS.PLANET_BAR_FILL, 'PLANET');

        if (engine.player) {
            const shieldBarX = m;
            const shieldBarY = h - m - HUD.BAR_HEIGHT;
            this._drawBar(ctx, shieldBarX, shieldBarY, HUD.BAR_WIDTH, HUD.BAR_HEIGHT,
                engine.player.hp / engine.player.maxHp,
                HUD.COLORS.SHIELD_BAR_BG, HUD.COLORS.SHIELD_BAR_FILL, 'SHIELD');
        }

        this._drawWeaponHUD(ctx, w, h, engine);
    }

    _drawBar(ctx, x, y, w, h, pct, bgColor, fillColor, label) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, w * Math.max(0, pct), h);
        ctx.strokeStyle = '#ffffff33';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        if (label) {
            ctx.font = `${HUD.LABEL_FONT_SIZE}px ${HUD.FONT_FAMILY}`;
            ctx.fillStyle = HUD.COLORS.TEXT;
            ctx.textAlign = 'center';
            ctx.fillText(label, x + w / 2, y + h - 3);
        }
    }

    _drawWeaponHUD(ctx, w, h, engine) {
        if (!engine.player) return;
        const m = HUD.BAR_MARGIN;
        const slotW = 50;
        const slotH = 20;
        const startX = w - m - slotW * 3 - 10;
        const startY = h - m - slotH - 25;

        const weaponKeys = engine.player.weaponOrder;
        const weaponLabels = ['1:GUN', '2:LAS', '3:MIS'];

        for (let i = 0; i < 3; i++) {
            const x = startX + i * (slotW + 5);
            const isActive = weaponKeys[i] === engine.player.activeWeaponKey;

            ctx.fillStyle = isActive ? HUD.COLORS.WEAPON_ACTIVE : HUD.COLORS.WEAPON_BG;
            ctx.fillRect(x, startY, slotW, slotH);
            ctx.strokeStyle = isActive ? '#ffffff' : HUD.COLORS.WEAPON_INACTIVE;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, startY, slotW, slotH);

            ctx.font = `${HUD.LABEL_FONT_SIZE - 2}px ${HUD.FONT_FAMILY}`;
            ctx.fillStyle = isActive ? '#000000' : HUD.COLORS.WEAPON_INACTIVE;
            ctx.textAlign = 'center';
            ctx.fillText(weaponLabels[i], x + slotW / 2, startY + slotH - 5);
        }

        const info = engine.player.activeWeapon.getDisplayInfo();
        const infoY = startY + slotH + 20;
        ctx.font = `${HUD.LABEL_FONT_SIZE}px ${HUD.FONT_FAMILY}`;
        ctx.textAlign = 'right';

        if (info.type === 'gun') {
            ctx.fillStyle = HUD.COLORS.TEXT;
            ctx.fillText('AMMO: ∞', w - m, infoY);
        } else if (info.type === 'laser') {
            const heatPct = info.heat / info.overheatMax;
            const barW = HUD.BAR_WIDTH;
            const barX = w - m - barW;
            ctx.fillStyle = '#333333';
            ctx.fillRect(barX, infoY - 12, barW, 10);
            ctx.fillStyle = info.overheatTimer > 0 ? '#ff0000' : heatPct > 0.8 ? '#ff8800' : '#ff4444';
            ctx.fillRect(barX, infoY - 12, barW * heatPct, 10);
            ctx.strokeStyle = '#ffffff33';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, infoY - 12, barW, 10);
            ctx.fillStyle = HUD.COLORS.TEXT;
            ctx.fillText(info.overheatTimer > 0 ? 'OVERHEAT!' : `HEAT: ${Math.floor(heatPct * 100)}%`, w - m, infoY);
        } else if (info.type === 'missile') {
            ctx.fillStyle = HUD.COLORS.TEXT;
            ctx.fillText(`MISSILES: ${info.ammo}/${info.maxAmmo}`, w - m, infoY);
            if (info.ammo < info.maxAmmo) {
                const regenPct = info.regenTimer / info.regenTime;
                const barW = HUD.BAR_WIDTH;
                const barX = w - m - barW;
                ctx.fillStyle = '#333333';
                ctx.fillRect(barX, infoY + 4, barW, 6);
                ctx.fillStyle = HUD.COLORS.WEAPON_FILL;
                ctx.fillRect(barX, infoY + 4, barW * regenPct, 6);
            }
        }
    }

    _drawPauseOverlay(ctx, w, h) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, w, h);
        ctx.font = `36px ${HUD.FONT_FAMILY}`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', w / 2, h / 2 - 20);
        ctx.font = `18px ${HUD.FONT_FAMILY}`;
        ctx.fillText('Press P to Resume', w / 2, h / 2 + 20);
    }

    _drawGameOverOverlay(ctx, w, h, score) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);
        ctx.font = `42px ${HUD.FONT_FAMILY}`;
        ctx.fillStyle = '#ff3333';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 40);
        ctx.font = `24px ${HUD.FONT_FAMILY}`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Score: ${score}`, w / 2, h / 2 + 10);
        ctx.font = `18px ${HUD.FONT_FAMILY}`;
        ctx.fillText('Press R to Restart', w / 2, h / 2 + 50);
    }
}
