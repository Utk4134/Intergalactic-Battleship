import { SPAWN, ALIEN, ASTEROID } from '../config/Constants.js';
import { Asteroid } from '../entities/Asteroid.js';
import { AlienShip } from '../entities/AlienShip.js';
import { randRange, clamp } from '../core/MathUtils.js';

export class SpawnDirector {
    constructor() {
        this.asteroidTimer = SPAWN.ASTEROID_BASE_INTERVAL;
        this.alienTimer = SPAWN.ALIEN_BASE_INTERVAL;
    }

    reset(world) {
        this.asteroidTimer = SPAWN.ASTEROID_BASE_INTERVAL;
        this.alienTimer = SPAWN.ALIEN_BASE_INTERVAL;
    }

    update(dt, world) {
        if (!world.stateManager.isPlaying()) return;

        const difficulty = Math.min(
            Math.floor(world.elapsedTime / SPAWN.DIFFICULTY_INTERVAL),
            SPAWN.MAX_DIFFICULTY
        );
        const speedMult = Math.min(
            1 + difficulty * SPAWN.SPEED_MULT_PER_LEVEL,
            SPAWN.SPEED_MULT_CAP
        );

        const asteroidCount = world.entities.filter(e => e.alive && e instanceof Asteroid).length;
        if (asteroidCount < SPAWN.MAX_ASTEROIDS) {
            this.asteroidTimer -= dt;
            if (this.asteroidTimer <= 0) {
                const interval = Math.max(
                    SPAWN.ASTEROID_BASE_INTERVAL - difficulty * SPAWN.ASTEROID_INTERVAL_DECAY,
                    SPAWN.ASTEROID_MIN_INTERVAL
                );
                this.asteroidTimer = interval;
                this._spawnAsteroid(world, speedMult);
            }
        }

        if (difficulty >= ALIEN.SCOUT.unlockLevel) {
            const alienCount = world.entities.filter(e => e.alive && e instanceof AlienShip).length;
            if (alienCount < SPAWN.MAX_ALIENS) {
                this.alienTimer -= dt;
                if (this.alienTimer <= 0) {
                    const interval = Math.max(
                        SPAWN.ALIEN_BASE_INTERVAL - difficulty * SPAWN.ALIEN_INTERVAL_DECAY,
                        SPAWN.ALIEN_MIN_INTERVAL
                    );
                    this.alienTimer = interval;
                    this._spawnAlien(world, difficulty, speedMult);
                }
            }
        }
    }

    _spawnAsteroid(world, speedMult) {
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        const w = world.canvas.width;
        const h = world.canvas.height;

        switch (edge) {
            case 0: x = randRange(0, w); y = -ASTEROID.SIZES.LARGE.radius; break;
            case 1: x = w + ASTEROID.SIZES.LARGE.radius; y = randRange(0, h); break;
            case 2: x = randRange(0, w); y = h + ASTEROID.SIZES.LARGE.radius; break;
            case 3: x = -ASTEROID.SIZES.LARGE.radius; y = randRange(0, h); break;
        }

        const asteroid = new Asteroid(x, y, 'LARGE', speedMult);
        if (world.planet) {
            asteroid.aimAtTarget(world.planet.pos);
        }
        world.entities.push(asteroid);
    }

    _spawnAlien(world, difficulty, speedMult) {
        const w = world.canvas.width;
        const h = world.canvas.height;
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
            case 0: x = randRange(0, w); y = -30; break;
            case 1: x = w + 30; y = randRange(0, h); break;
            case 2: x = randRange(0, w); y = h + 30; break;
            case 3: x = -30; y = randRange(0, h); break;
        }

        let type = 'SCOUT';
        if (difficulty >= ALIEN.CRUISER.unlockLevel && Math.random() < 0.3) {
            type = 'CRUISER';
        }

        const alien = new AlienShip(x, y, type, speedMult);
        world.entities.push(alien);
    }
}
