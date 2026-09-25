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
    { title: "Veiled in Shadows", file: "Portfolio_00_ComicScene.png" },
    { title: "Jellyfish-Inspired Character", file: "Portfolio_01_OriginalCharacterDesigns.png" },
    { title: "Wonderland — Character Design", file: "Portfolio_01.1_OriginalCharacterDesigns.png" },
    { title: "Sunlit Forest", file: "Portfolio_02_Landscape.png" },
    { title: "Hatsune Miku — Fan Art", file: "Portfolio_03_HatsuneMikuFanArt-WIP.png" },
    { title: "Princess Mononoke — Portrait Study", file: "Portfolio_04_MononokePricessFanart.png" },
    { title: "A Day at Sea", file: "Portfolio_05_WIPPokemon.png" },
    { title: "Character Turnaround", file: "Portfolio_06_Character_TurnAround" },
    { title: "Little Croco — The Explorer", file: "Portfolio_07_AnimalCroco.png" },
    { title: "Little Sheep — The Wanderer", file: "Portfolio_07.1_AnimalSheep.png" },
    { title: "The Adventurer Crew", file: "Portfolio_08.00_GameCharacters.png" },
    { title: "Character Expressions — First Studies", file: "Portfolio_09.0_CharacterFaces.png" },
    { title: "Witch Expressions", file: "Portfolio_09.1_CharacterFaces.png" },
    { title: "Vertical City — Architectural Sketch", file: "Portfolio_10.0_Tarditional.png" },
    { title: "The Creative Attic — Interior Study", file: "Portfolio_10.1_TarditionalHouses.png" },
    { title: "Creature Anatomy — Skull Study", file: "Portfolio_11.0_TarditionalStudies.png" },
    { title: "Creature Anatomy — Clawed Foot", file: "Portfolio_11.2_TarditionalStudies.png" },
    { title: "03 — Traditional Study — 03", file: "Portfolio_11.3_TarditionalStudies.png" },
    { title: "The Fool — Early Character Development", file: "Portfolio_12.02_TFG.png" },
    { title: "The Fool — Research & Studies", file: "Portfolio_12.03_TFG.png" },
    { title: "The Fool — Character Exploration", file: "Portfolio_12.04_TFG.png" },
    { title: "The Fool — Concept Development", file: "Portfolio_12.05_TFG.png" },
    { title: "The Fool — Character Design Studies", file: "Portfolio_12.07_TFG.png" },
    { title: "The Fool — Character & Creature Concepts", file: "Portfolio_12.08_TFG.png" },
    { title: "The Fool — Character Turnaround", file: "Portfolio_12.09_TFG.png" },
    { title: "The Fool — Character Variations", file: "Portfolio_12.10_TFG.png" },
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