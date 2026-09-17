export const GAME = {
    FIXED_TIMESTEP: 1 / 60,
    MAX_FRAME_TIME: 0.25,
    CANVAS_BG: '#000010',
};

export const PLANET = {
    RADIUS: 50,
    HP: 100,
    POS_Y_OFFSET: 80,
    COLOR: '#2277cc',
    RING_COLOR: '#44aaff',
    RING_COUNT: 3,
};

export const PLAYER = {
    RADIUS: 14,
    MAX_SPEED: 300,
    ACCELERATION: 800,
    DRAG: 600,
    SHIELD_HP: 100,
    INVULN_TIME: 1.0,
    COLOR: '#00ff88',
    ENGINE_COLOR: '#ff8800',
};

export const GUNS = {
    DAMAGE: 10,
    FIRE_RATE: 6,
    SPEED: 600,
    LIFESPAN: 1.2,
    BULLET_RADIUS: 3,
    COLOR: '#ffff00',
};

export const LASER = {
    DAMAGE_PER_SEC: 40,
    MAX_RANGE: 500,
    WIDTH: 3,
    HEAT_GAIN: 25,
    HEAT_DECAY: 15,
    OVERHEAT_THRESHOLD: 100,
    OVERHEAT_LOCKOUT: 2.5,
    COLOR: '#ff0000',
    CORE_COLOR: '#ffffff',
};

export const MISSILE = {
    DAMAGE: 80,
    SPLASH_DAMAGE: 40,
    SPLASH_RADIUS: 60,
    FIRE_COOLDOWN: 0.8,
    MAX_AMMO: 6,
    REGEN_TIME: 4,
    SPEED: 350,
    LIFESPAN: 3,
    RADIUS: 4,
    TURN_RATE: 3.5,
    SEEK_CONE: Math.PI / 4,
    COLOR: '#ff4488',
    THRUSTER_COLOR: '#ffaa44',
};

export const ALIEN_PROJ = {
    SPEED: 250,
    RADIUS: 4,
    COLOR: '#44ff44',
};

export const ASTEROID = {
    SIZES: {
        LARGE:  { radius: 40, hp: 60, speedMin: 40, speedMax: 60, planetDmg: 20, score: 50, splits: 'MEDIUM' },
        MEDIUM: { radius: 24, hp: 30, speedMin: 60, speedMax: 90, planetDmg: 10, score: 25, splits: 'SMALL' },
        SMALL:  { radius: 12, hp: 15, speedMin: 90, speedMax: 130, planetDmg: 5,  score: 10, splits: null },
    },
    COLOR: '#888877',
    OUTLINE_COLOR: '#666655',
    VERTEX_COUNT_MIN: 7,
    VERTEX_COUNT_MAX: 12,
    JAGGEDNESS: 0.4,
};

export const ALIEN = {
    SCOUT: {
        radius: 18,
        hp: 40,
        speedMin: 70,
        speedMax: 100,
        fireRate: 1.5,
        damage: 8,
        planetDmg: 15,
        score: 150,
        color: '#ff3333',
        unlockLevel: 2,
    },
    CRUISER: {
        radius: 28,
        hp: 120,
        speedMin: 40,
        speedMax: 60,
        fireRate: 2.5,
        burstCount: 3,
        burstDelay: 0.2,
        damage: 10,
        planetDmg: 30,
        score: 300,
        color: '#cc00cc',
        unlockLevel: 5,
    },
};

export const SPAWN = {
    DIFFICULTY_INTERVAL: 20,
    MAX_DIFFICULTY: 10,
    ASTEROID_BASE_INTERVAL: 3.0,
    ASTEROID_INTERVAL_DECAY: 0.15,
    ASTEROID_MIN_INTERVAL: 0.8,
    ALIEN_BASE_INTERVAL: 8.0,
    ALIEN_INTERVAL_DECAY: 0.4,
    ALIEN_MIN_INTERVAL: 3.0,
    SPEED_MULT_PER_LEVEL: 0.05,
    SPEED_MULT_CAP: 1.5,
    MAX_ASTEROIDS: 15,
    MAX_ALIENS: 5,
    PLANET_Y_OFFSET: 80,
};

export const HUD = {
    FONT_FAMILY: 'monospace',
    SCORE_FONT_SIZE: 24,
    LABEL_FONT_SIZE: 14,
    BAR_WIDTH: 200,
    BAR_HEIGHT: 16,
    BAR_MARGIN: 10,
    COLORS: {
        TEXT: '#ffffff',
        PLANET_BAR_BG: '#333333',
        PLANET_BAR_FILL: '#2277cc',
        SHIELD_BAR_BG: '#333333',
        SHIELD_BAR_FILL: '#00ff88',
        WEAPON_BG: '#333333',
        WEAPON_FILL: '#ff8800',
        WEAPON_ACTIVE: '#ffffff',
        WEAPON_INACTIVE: '#666666',
    },
};
