# AGENTS.md

## Project

Browser-based 2D space shooter. Pure HTML5 Canvas + vanilla JS ES Modules. No framework, no bundler, no build step.

## Run

Must be served over HTTP (ES Modules block on `file://`):

```
npx serve .
```

Then open `http://localhost:3000`. No other setup required.

## Architecture

All game logic lives in `js/`. Entry point: `js/main.js` → `GameEngine.js`.

- `js/config/Constants.js` — every tunable number. Edit here, nowhere else.
- `js/core/` — engine loop (fixed timestep 60Hz), input, vector math, collision
- `js/entities/` — Entity base class, Player, Planet, Asteroid, AlienShip
- `js/entities/projectiles/` — Bullet, Missile (NOT laser — see below)
- `js/weapons/` — GunWeapon, LaserWeapon, MissileWeapon composed onto Player
- `js/systems/` — SpawnDirector (difficulty curve), ScoreManager
- `js/rendering/Renderer.js` — all canvas drawing, HUD, overlays
- `js/state/GameStateManager.js` — playing/paused/gameover

## Key conventions

- Strict update/render split: entities have `update(dt, world)` (logic) and `render(ctx)` (drawing). Never mix.
- Laser is NOT an entity. LaserWeapon does segment-circle hitscan each tick and applies DPS directly. Renderer draws the beam while `laserWeapon.isFiring`.
- Weapons are composed: `player.weapons = { gun, laser, missile }`. Active weapon gets `startFiring()`/`stopFiring()` calls based on mouse state in Player.update().
- Collision uses `faction: 'player' | 'enemy'` tags to skip friendly-fire checks. O(n²) is fine for <100 entities.
- Asteroids split Large→2 Medium→2 Small on death. Children spawned from `Asteroid.split()`.

## Gotchas

- `Vector2.rotate()` returns a new vector — does NOT mutate. Assign result back.
- Weapon `active` flag must be set via `startFiring()`/`stopFiring()` — it is not automatic.
- Laser kills must be tracked via `laserWeapon.killedEntities` for score/split processing (done in main.js collision handler).
- AlienProjectile (inside AlienShip.js) needs `damage` and `planetDmg` properties for collision system.
- Pause/restart uses key-down edge detection (`_pauseKeyDown`/`_restartKeyDown` flags) to prevent repeated triggers.

## Testing

No test framework. Manual verification: serve locally, play the game, check the verification checklist in `GAME_PLAN.md`.
