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
    // A wider lens makes the world feel farther away and more open.
    // The canvas still fits the browser window, but this lens shows more
    // of the valley and the player starts with a broader sense of space.
    VIEW_W: 2880,
    VIEW_H: 1620,

    // Every sprite is authored ~3x smaller than the world, pixel-perfect.
    SPRITE_SCALE: 3,

    PLAYER_SPEED: 235,
    PLAYER_W: 45 * 3,
    PLAYER_H: 64 * 3,
    PLAYER_IFRAMES: 1.2,
    HEALTH_REGEN_INTERVAL: 5,

    ATTACK_COOLDOWN: 0.5,
    ATTACK_DURATION: 0.28,

    CAMERA_SMOOTH: 6,
    CAMERA_SHAKE_FALLOFF: 2.2,
    ENEMY_WAVE_SIZE: 15,
    ENEMY_WAVE_INTERVAL: 0.45,
};

const ARTWORKS = [
    { title: "Portrait", file: "Portfolio_00_Portrait.png" },
    { title: "Vignette", file: "Portfolio_01_Vignette.png" },
    { title: "Clothing Design", file: "Portfolio_03_ClothingDesign.png" },
    { title: "Character Design", file: "Portfolio_04_CharacterDesign.png" },
    { title: "Skin Study", file: "Portfolio_05_Skin_design.png" },
    { title: "Side Views", file: "Portfolio_05_Skin_design_Sides.png" },
    { title: "Character Design 2", file: "Portfolio_06_CharacterDesign.png" },
    { title: "Cute Croco", file: "Portfolio_07_CuteLittleCroco.png" },
    { title: "Cute Sheep", file: "Portfolio_08_CuteLittleSheep.png" },
    { title: "Character Faces", file: "Portfolio_09_CharacterFaces.png" },
    { title: "Character Faces 2", file: "Portfolio_10_CharacterFaces.png" },
    { title: "Game Characters", file: "Portfolio_11_GameCharacters.png" },
    { title: "WIP Pokemon", file: "Portfolio_12_WIPPokemon.png" },
];

// Accessible global game state (used by UI + entities).
const GameState = {
    hearts: 4,
    maxHearts: 4,
    gems: 0,
    artworks: [],
    requiredGems: 5,
    chestOpened: false,
    rewardChestOpened: false,
    sageSpoken: false,
    endlessEnemies: false,
    enemiesKilled: 0,
    invuln: 0,
    paused: false,
    speakLock: false,
};