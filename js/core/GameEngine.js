import { GAME } from '../config/Constants.js';
import { GameStateManager } from '../state/GameStateManager.js';

export class GameEngine {
    constructor(canvas, inputManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = inputManager;
        this.stateManager = new GameStateManager();
        this.accumulator = 0;
        this.lastTime = 0;
        this.elapsedTime = 0;
        this.running = false;

        this.player = null;
        this.planet = null;
        this.entities = [];
        this.projectiles = [];
        this.spawnDirector = null;
        this.scoreManager = null;
        this.renderer = null;
        this._pauseKeyDown = false;
        this._restartKeyDown = false;
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        this._loop(this.lastTime);
    }

    _loop(timestamp) {
        if (!this.running) return;

        const frameTime = Math.min((timestamp - this.lastTime) / 1000, GAME.MAX_FRAME_TIME);
        this.lastTime = timestamp;

        if (this.stateManager.isPlaying()) {
            this.accumulator += frameTime;
            while (this.accumulator >= GAME.FIXED_TIMESTEP) {
                this.update(GAME.FIXED_TIMESTEP);
                this.accumulator -= GAME.FIXED_TIMESTEP;
            }
            this.elapsedTime += frameTime;
        }

        this.render();
        requestAnimationFrame((t) => this._loop(t));
    }

    update(dt) {
        if (this.player) this.player.update(dt, this);
        if (this.planet) this.planet.update(dt, this);

        for (const entity of this.entities) {
            entity.update(dt, this);
        }

        for (const proj of this.projectiles) {
            proj.update(dt, this);
        }

        if (this.spawnDirector) this.spawnDirector.update(dt, this);

        this.projectiles = this.projectiles.filter(p => p.alive);
        this.entities = this.entities.filter(e => e.alive);
    }

    render() {
        if (this.renderer) this.renderer.render(this.ctx, this);
    }

    restart() {
        this.accumulator = 0;
        this.elapsedTime = 0;
        this.entities = [];
        this.projectiles = [];
        this.stateManager.restart();

        if (this.spawnDirector) this.spawnDirector.reset(this);
        if (this.scoreManager) this.scoreManager.reset();
        if (this.player) this.player.reset(this);
        if (this.planet) this.planet.reset();
    }
}
