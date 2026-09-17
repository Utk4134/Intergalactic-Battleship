# Intergalactic Battleground

A browser-based top-down 2D space shooter. Defend your planet from waves of aliens and asteroids using three weapons: Guns, Laser, and Missiles.

## How to Run

This game uses ES Modules and **must** be served over HTTP — opening `index.html` directly via `file://` will not work.

### Option 1: npx serve (recommended)
```bash
npx serve .
```
Then open `http://localhost:3000` in your browser.

### Option 2: Python
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

### Option 3: VS Code Live Server
Install the Live Server extension, right-click `index.html`, and choose "Open with Live Server".

## Controls

| Action | Input |
|---|---|
| Move | WASD / Arrow Keys |
| Aim | Mouse |
| Fire | Hold Left Mouse Button |
| Switch Weapon | 1 / 2 / 3 or Scroll Wheel |
| Pause | P / Escape |
| Restart | R (on game-over screen) |

## Weapons

- **Guns (1)**: Unlimited ammo, fast-firing bullets
- **Laser (2)**: Continuous beam, builds heat — overheats if held too long
- **Missiles (3)**: Homing missiles with splash damage, limited ammo that regenerates over time

## Tech Stack

Pure HTML5 Canvas + vanilla JavaScript. No frameworks, no build tools, no external assets.
