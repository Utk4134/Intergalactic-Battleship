# Intergalactic Battleground — Build Spec

A browser-based top-down 2D space shooter. Aliens and asteroids/comets converge on the player's home planet (fixed at the bottom/center of the screen); the player pilots a ship with three weapons (Guns, Laser, Missiles) to destroy them before the planet — or the player — is destroyed. Endless score-attack survival, no win condition, no menu/save system in this scope.

## Tech Stack & Constraints

- Pure HTML5 Canvas + vanilla JavaScript. **No framework, no bundler, no build step.**
- ES Modules for file separation (`<script type="module" src="js/main.js">` in `index.html`; everything else via `import`).
- Must run served over `http://` (e.g. `npx serve .`, VS Code Live Server, `python -m http.server`) — not opened as a bare `file://`, since some browsers block module imports over `file://`. Document this in the README.
- No external assets/sprites — all rendering is vector/shape-based (canvas `arc`/`lineTo` polygons). Zero load-time dependencies.
- No TypeScript, no npm dependencies unless there is a very strong reason.

## File Structure to Create

```
index.html                  loads only <script type="module" src="js/main.js">
style.css
README.md                   how to run locally (note the http:// requirement above)
js/
  main.js                   entry point — bootstraps canvas + GameEngine, starts loop
  core/
    GameEngine.js            RAF loop, fixed-timestep accumulator, owns game state
    InputManager.js           polled keyboard/mouse state (not event-driven game logic)
    Vector2.js                 x/y math helper (add/sub/scale/normalize/length)
    MathUtils.js                clamp, randRange, angle/wrap-around helpers
    CollisionSystem.js          circle-circle + segment-circle (laser) checks
  entities/
    Entity.js                  base class: pos, vel, radius, rotation, alive, update()/render()
    Player.js
    Planet.js
    Asteroid.js
    AlienShip.js
    projectiles/
      Projectile.js
      Bullet.js
      Missile.js
      (laser is NOT a projectile entity — handled inside LaserWeapon, see below)
  weapons/
    Weapon.js                  base: cooldown/heat/ammo tracking, fire()
    GunWeapon.js
    LaserWeapon.js
    MissileWeapon.js
  systems/
    SpawnDirector.js            timer-driven wave/difficulty scheduler
    ScoreManager.js
  rendering/
    Renderer.js                 clears canvas, draws starfield background, entities, HUD
  state/
    GameStateManager.js         playing / paused / gameover state machine
  config/
    Constants.js                 ALL tunable numbers below live here, nowhere else
assets/                         (empty — reserved for future sprites/audio, unused now)
```

Build order: `Constants.js` → `Entity.js` → `Vector2.js`/`MathUtils.js` → `CollisionSystem.js` → `GameStateManager.js` → `GameEngine.js` → entities → weapons → `SpawnDirector.js` → `Renderer.js` → `InputManager.js` → `main.js` wiring it all together.

## Architecture Rules

1. **Fixed timestep game loop.** Accumulator pattern at 60Hz for `update(dt)`; render once per `requestAnimationFrame`. Clamp frame time (e.g. to 250ms) to avoid a spiral of death when the tab is backgrounded.
2. **Strict update/render separation.** Every entity has `update(dt, world)` (logic only, no canvas access) and `render(ctx)` (drawing only, no state mutation). This is what keeps rendering swappable later (sprites instead of vectors) without touching game logic.
3. **One shallow `Entity` base class.** Not a full ECS — unnecessary for ~5 entity types (`Player`, `Planet`, `Asteroid`, `AlienShip`, `Bullet`, `Missile` all extend it).
4. **Weapons are composed onto `Player`, not inherited.** `player.weapons = { gun, laser, missile }`. Adding a 4th weapon later = one new `Weapon` subclass, no changes elsewhere.
5. **Laser is a special case, not an entity.** `LaserWeapon.update(dt)` does a direct segment-vs-circle check out to max range each tick while firing and applies damage-per-second directly; `Renderer` only draws a beam line while `laserWeapon.isFiring` is true. Do not spawn a projectile entity per frame for it.
6. **Collision is circle-circle**, `distSq <= (r1+r2)^2` (no `sqrt`), simple O(n²) pass over faction-filtered pairs (tag entities `faction: 'player' | 'enemy'` to skip friendly-fire checks cheaply). Entity counts stay well under 100 even at max difficulty — no spatial hashing/quadtree needed. Laser beam is the one exception, needing closest-point-on-segment-vs-circle instead.
7. **State machine, not scattered booleans.** `GameStateManager` has exactly three states: `playing`, `paused`, `gameover`. `GameEngine.update()` no-ops unless `playing`; `render()` always runs so overlays draw over the last frame. Restart = re-instantiate the world (player/planet/entities/spawnDirector/score) + reset state, no save system.
8. **All balance numbers live only in `Constants.js`.** `SpawnDirector.js`, `Weapon.js`, and entity classes read from it — never hardcode numbers inline, so future rebalancing touches one file.
9. **Vector rendering only.** Canvas primitives (arcs, polygons via `moveTo`/`lineTo`). Asteroids get randomized jagged-polygon vertex offsets generated once at spawn for visual variety without art assets.

## Gameplay Spec — Exact Numbers

### Player Ship
- Collision radius: 14px
- Max speed: 300 px/s · acceleration: 800 px/s² · drag/friction deceleration: 600 px/s² when no input held
- Movement: WASD/arrows, free 8-directional thrust, decoupled from facing direction (twin-stick style)
- Rotation: always faces the mouse cursor
- **Player Shield**: 100 HP, separate from planet health. Enemy collisions and enemy projectiles damage this directly. Reaching 0 = player destroyed = immediate game over (independent of planet HP).
- ~1s invulnerability + visual flicker after taking a hit (prevents instant multi-hit death from overlapping enemies)

### The Planet
- Fixed position, bottom/center of screen. 100 HP, shown as a distinct "PLANET" HUD bar.
- Any asteroid/alien ship that reaches it (not destroyed first) impacts for damage per the tables below, then is removed.
- 0 HP = game over.

### Weapons

| Weapon | Damage | Rate / Limit | Behavior |
|---|---|---|---|
| Guns | 10/hit | 6 shots/sec, unlimited ammo | Straight bullets, 600 px/s, ~1.2s lifespan (~720px range). Default, no resource management. |
| Laser | 40 dmg/sec continuous | Heat +25/sec while firing, −15/sec while idle; overheat lockout at 100 heat for 2.5s | Instant hitscan beam, 500px fixed range, damages anything touched each tick. Best vs single tough targets. |
| Missiles | 80 direct + 40 splash (60px radius) | 1 per 0.8s, max 6 stock, regenerates 1 every 4s | Homes toward nearest enemy within a 90° forward cone, 350 px/s, 3s lifespan. Best vs groups (splash) or armored aliens (guaranteed hit). |

- Switch weapons: keys `1`/`2`/`3` or scroll wheel.
- Fire: hold left mouse button (guns/laser auto-repeat while held; missiles fire on cooldown while held).

### Asteroids (classic split-on-destruction)

| Size | Radius | HP | Speed | Planet dmg on impact | On death | Score |
|---|---|---|---|---|---|---|
| Large | 40px | 60 | 40–60 px/s | 20 | splits into 2 Medium | 50 |
| Medium | 24px | 30 | 60–90 px/s | 10 | splits into 2 Small | 25 |
| Small | 12px | 15 | 90–130 px/s | 5 | destroyed | 10 |

### Alien Ships

| Type | Radius | HP | Speed | Attack | Planet dmg | Score | Unlocks at |
|---|---|---|---|---|---|---|---|
| Scout | 18px | 40 | 70–100 px/s | 1 shot/1.5s, 8 dmg | 15 | 150 | difficulty lvl 2 (~40s) |
| Cruiser | 28px | 120 | 40–60 px/s | 3-shot burst/2.5s, 10 dmg each | 30 | 300 | difficulty lvl 5 (~100s) |

- Alien projectiles: 250 px/s, 4px radius, straight-line toward the player's position at time of firing (no homing).

### Spawning & Difficulty Curve
- `difficultyLevel = floor(elapsedTime / 20s)`, capped (e.g. level 10, then plateaus with randomized variation).
- Asteroid spawn interval: starts 3.0s, −0.15s/level, floor 0.8s. Spawn at random position on screen edge, velocity aimed at the planet with random spread (not a perfect beeline).
- Alien spawn interval (once unlocked): starts 8.0s, −0.4s/level, floor 3.0s.
- Enemy speed multiplier: +5%/level, capped at +50%.
- On-screen cap: max 15 asteroids + 5 aliens simultaneously (safety valve).
- No win condition — endless survival for high score.

### HUD & Controls
- HUD: score (top-left) · planet health bar (top-center, labeled "PLANET") · player shield bar (bottom-left) · active weapon + ammo/heat meter (bottom-right: laser = heat gauge, missiles = ammo count, guns = ∞) · weapon slots 1/2/3 highlighting the active one.
- Controls: `WASD`/arrows move · mouse aims · hold `LMB` fires · `1`/`2`/`3` or scroll switches weapon · `P`/`Esc` pauses · `R` restarts from game-over screen.
- Pause overlay: "PAUSED — Press P to Resume", drawn directly on canvas.
- Game-over overlay: "GAME OVER — Score: N — Press R to Restart", drawn directly on canvas. No DOM menu.
- Out of scope for MVP (optional stretch only if time allows): kill-streak score multiplier, `localStorage` high score.

## Verification Checklist

1. Serve locally, open in browser — no console errors, player ship renders at the planet's position.
2. Each weapon works as specified: guns never deplete; laser builds/decays heat and locks out correctly; missiles home, deplete, and regenerate ammo correctly.
3. Asteroids split Large→2 Medium→2 Small correctly on destruction; planet takes the correct damage per size on impact.
4. Alien ships spawn at their unlock times, fire back correctly, and damage the player shield; invulnerability flicker works after a hit.
5. Planet HP → 0 triggers game over with correct final score; `R` performs a full clean restart (HP/score/timers all reset).
6. Player shield → 0 (independently of planet HP) also triggers game over.
7. Pause/resume freezes and cleanly resumes all entities and timers with no time-skip glitches (e.g. no dumped weapon cooldown on resume).
