import { GameEngine } from './core/GameEngine.js';
import { InputManager } from './core/InputManager.js';
import { CollisionSystem } from './core/CollisionSystem.js';
import { Player } from './entities/Player.js';
import { Planet } from './entities/Planet.js';
import { Asteroid } from './entities/Asteroid.js';
import { AlienShip } from './entities/AlienShip.js';
import { Missile } from './entities/projectiles/Missile.js';
import { LaserWeapon } from './weapons/LaserWeapon.js';
import { SpawnDirector } from './systems/SpawnDirector.js';
import { ScoreManager } from './systems/ScoreManager.js';
import { Renderer } from './rendering/Renderer.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = 960;
canvas.height = 720;

const input = new InputManager(canvas);
const engine = new GameEngine(canvas, input);

function initGame() {
    const planetY = canvas.height - 80;
    engine.planet = new Planet(canvas.width / 2, planetY);

    engine.player = new Player(canvas.width / 2, planetY);
    engine.entities = [];
    engine.projectiles = [];

    engine.spawnDirector = new SpawnDirector();
    engine.scoreManager = new ScoreManager();
    engine.renderer = new Renderer(engine.ctx);

    engine.elapsedTime = 0;
}

function handleCollisions() {
    const allTargets = [...engine.entities, ...engine.projectiles];
    if (engine.planet) allTargets.push(engine.planet);

    const player = engine.player;
    const planetsAndPlayer = [];
    if (engine.planet && engine.planet.alive) planetsAndPlayer.push(engine.planet);
    if (player && player.alive) planetsAndPlayer.push(player);

    for (const target of allTargets) {
        if (!target.alive) continue;
        if (target.faction !== 'enemy') continue;

        for (const defender of planetsAndPlayer) {
            if (!defender.alive) continue;
            if (defender.faction === target.faction) continue;

            if (CollisionSystem.circleCircle(
                target.pos.x, target.pos.y, target.radius,
                defender.pos.x, defender.pos.y, defender.radius
            )) {
                if (defender === engine.planet) {
                    const dmg = target.planetDmg || 10;
                    engine.planet.takeDamage(dmg);
                    target.alive = false;
                } else if (defender === player) {
                    const dmg = target.planetDmg || 10;
                    player.takeDamage(dmg);
                    target.alive = false;
                }
            }
        }
    }

    for (const proj of engine.projectiles) {
        if (!proj.alive || proj.faction !== 'player') continue;

        for (const entity of engine.entities) {
            if (!entity.alive || entity.faction !== 'enemy') continue;

            if (CollisionSystem.circleCircle(
                proj.pos.x, proj.pos.y, proj.radius,
                entity.pos.x, entity.pos.y, entity.radius
            )) {
                entity.takeDamage(proj.damage);

                if (proj instanceof Missile) {
                    const splashRadius = 60;
                    const splashDmg = 40;
                    for (const other of engine.entities) {
                        if (other === entity || !other.alive || other.faction !== 'enemy') continue;
                        const dx = other.pos.x - proj.pos.x;
                        const dy = other.pos.y - proj.pos.y;
                        if (dx * dx + dy * dy <= splashRadius * splashRadius) {
                            other.takeDamage(splashDmg);
                        }
                    }
                    proj.onHit(entity);
                } else {
                    proj.alive = false;
                }

                if (!entity.alive) {
                    if (entity instanceof Asteroid) {
                        engine.scoreManager.add(entity.scoreValue);
                        const children = entity.split(engine);
                        engine.entities.push(...children);
                    } else if (entity instanceof AlienShip) {
                        engine.scoreManager.add(entity.scoreValue);
                    }
                }

                if (proj instanceof Missile) {
                    for (const other of engine.entities) {
                        if (other === entity || other.alive || other.faction !== 'enemy') continue;
                        if (other instanceof Asteroid) {
                            engine.scoreManager.add(other.scoreValue);
                            const children = other.split(engine);
                            engine.entities.push(...children);
                        } else if (other instanceof AlienShip) {
                            engine.scoreManager.add(other.scoreValue);
                        }
                    }
                }

                break;
            }
        }
    }

    for (const proj of engine.projectiles) {
        if (!proj.alive || proj.faction !== 'enemy') continue;
        if (!player || !player.alive) continue;

        if (CollisionSystem.circleCircle(
            proj.pos.x, proj.pos.y, proj.radius,
            player.pos.x, player.pos.y, player.radius
        )) {
            player.takeDamage(proj.damage);
            proj.alive = false;
        }
    }

    if (engine.player && engine.player.activeWeapon instanceof LaserWeapon) {
        const laser = engine.player.activeWeapon;
        for (const entity of laser.killedEntities) {
            if (entity instanceof Asteroid) {
                engine.scoreManager.add(entity.scoreValue);
                const children = entity.split(engine);
                engine.entities.push(...children);
            } else if (entity instanceof AlienShip) {
                engine.scoreManager.add(entity.scoreValue);
            }
        }
    }
}

function handleGameState() {
    const input_keys = engine.input;

    if (input_keys.isKeyDown('KeyP') || input_keys.isKeyDown('Escape')) {
        if (!engine._pauseKeyDown) {
            engine.stateManager.togglePause();
            engine._pauseKeyDown = true;
        }
    } else {
        engine._pauseKeyDown = false;
    }

    if (engine.stateManager.isGameOver()) {
        if (input_keys.isKeyDown('KeyR')) {
            if (!engine._restartKeyDown) {
                initGame();
                engine.restart();
                engine._restartKeyDown = true;
            }
        } else {
            engine._restartKeyDown = false;
        }
    }

    if (!engine.player.alive || !engine.planet.alive) {
        if (engine.stateManager.isPlaying()) {
            engine.stateManager.gameOver();
        }
    }
}

const originalUpdate = engine.update.bind(engine);
engine.update = function(dt) {
    originalUpdate(dt);
    handleCollisions();
    handleGameState();
};

initGame();
engine.start();
