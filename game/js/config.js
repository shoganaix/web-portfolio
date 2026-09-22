"use strict";

// ---------------------------------------------------------------------------
// Global configuration for the game.
// The world is expressed in "map pixels": the background art (Background.png)
// is 3600x1950 px. The internal view/canvas is a smaller window that the
// camera moves across, which lets the world feel much bigger than the screen.
// ---------------------------------------------------------------------------
const CFG = {
    WORLD_W: 3600,
    WORLD_H: 1950,
    // Wide 16:9 window so the camera shows far more of the valley.
    // The canvas cover-fits the browser window (see Game.fit), so the view
    // only defines the lens: a wider lens means the world feels smaller
    // and the player sees much more around them.
    VIEW_W: 1152,
    VIEW_H: 648,

    // Every sprite is authored ~3x smaller than the world, pixel-perfect.
    SPRITE_SCALE: 3,

    PLAYER_SPEED: 235,
    PLAYER_W: 45 * 3,
    PLAYER_H: 64 * 3,
    PLAYER_IFRAMES: 1.2,

    ATTACK_COOLDOWN: 0.5,
    ATTACK_DURATION: 0.28,

    CAMERA_SMOOTH: 6,
    CAMERA_SHAKE_FALLOFF: 2.2,
};

// Accessible global game state (used by UI + entities).
const GameState = {
    hearts: 4,
    maxHearts: 4,
    gems: 0,
    requiredGems: 5,
    chestOpened: false,
    enemiesKilled: 0,
    invuln: 0,
    paused: false,
    speakLock: false,
};