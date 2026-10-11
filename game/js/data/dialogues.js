"use strict";

// ---------------------------------------------------------------------------
// Dialogue data. Each entry is a block id and a list of lines.
// A `lines` value can be an array OR a function(state) => array, so NPCs can
// react to progress (e.g. the Sage's response changes once you have enough
// gemstones).
// ---------------------------------------------------------------------------
const DIALOGUES = { 
    guide: {
        lines: [
            { who: "Guide", text: "Hey there, adventurer! I'm the Guide." },
            { who: "Guide", text: "Move with WASD or the arrow keys." },
            { who: "Guide", text: "Hold SHIFT while moving to sprint!" },
            { who: "Guide", text: "Press E close to people, chests and signs to interact." },
            { who: "Guide", text: "Press SPACE to attack. Your projectiles follow the mouse cursor: move it to guide them towards enemies." },
            { who: "Guide", text: "Rest at the bench with E to recover hearts. Move to leave; damage interrupts your rest." },
            { who: "Guide", text: "Collect the scattered artworks — the Sage to the east is looking for them." },
        ],
    },

    sage: {
        // Reacts to how many gems the player has gathered.
        lines: (state) => {
            if (state.sageSpoken) return [
                { who: "Sage", text: "The west tower holds the arcane pulse. The east tower holds the final trial." },
                { who: "Sage", text: "Defeat its wave and find every artwork to restore the valley." },
            ];
            if (state.gems >= state.requiredGems) {
                return [
                    { who: "Sage", text: "Magnificent! Five artworks, just as the prophecy said." },
                    { who: "Sage", text: "With this energy I can awaken the west tower's forgotten magic. Your collection stays yours." },
                    { who: "Sage", text: "Visit the west tower and press E to learn the arcane pulse. Then face the east tower's trial." },
                ];
            }
            return [
                { who: "Sage", text: `The valley weakens, young one. I need ${state.requiredGems - state.gems} more artwork(s) to reforge the crystal.` },
                { who: "Sage", text: "They are scattered near the chest, the trees and the edges of the map. Avoid the dark blobs!" },
            ];
        },
    },

    prisoner: {
        lines: (state) => {
            if (state.enemiesKilled >= 3) {
                return [
                    { who: "Prisoner", text: "Uff, thanks!" },
                ];
            }
            return [
                { who: "Prisoner", text: "Help me!" },
            ];
        },
    },

    chest: {
        lines: [
            { who: "Chest", text: "You pry the lid open... an artwork is hidden inside! (+1)" },
        ],
    },

    sign: {
        lines: [
            { who: "Sign", text: "TOWER OF CREATION — bring five artworks to the Sage, then press E at the west tower to learn the arcane pulse." },
            { who: "Sign", text: "Press SPACE to cast projectiles; they follow your mouse cursor. Keep your distance and guide them towards enemies." },
        ],
    },

    portal: {
        lines: [
            { who: "Tower", text: "ARCANE PULSE UNLOCKED! Press F, or PULSE on mobile, to strike nearby enemies and push them back." },
            { who: "Tower", text: "The pulse deals two damage and recharges in five seconds. Use it when the slimes surround you." },
        ],
    },

    portalLocked: {
        lines: [
            { who: "Tower", text: "The pulse sleeps. Collect five artworks and speak to the Sage in the east to awaken it." },
        ],
    },

    enemyPortal: {
        lines: [
            { who: "Portal", text: "The final trial begins: defeat fifteen enemies. Collect their polaroids and claim the reward chest." },
        ],
    },

    waveComplete: {
        lines: [
            { who: "Portal", text: "The enemy wave is defeated. A reward chest has appeared!" },
        ],
    },

    empty: {
        lines: [
            { who: "Chest", text: "Empty. Someone got here first..." },
        ],
    },
    pulseReady: {
        lines: [{ who: "Tower", text: "Your arcane pulse is ready. Press F or PULSE on mobile; it recharges in five seconds." }],
    },
    trialComplete: {
        lines: [{ who: "Portal", text: "The trial is complete. Claim your reward chest and collect the remaining polaroids." }],
    },
    collectionComplete: {
        lines: [
            { who: "Sage", text: "Every artwork has returned, and the final trial is complete. The valley is restored!" },
            { who: "Sage", text: "You earned the Curator's Halo and an extra heart. Your complete gallery awaits. Thank you for exploring my world." },
        ],
    },

    respawn: {
        lines: [
            { who: "Guide", text: "You fainted from too many hits! Don't worry — the valley always brings you back." },
            { who: "Guide", text: "You kept your artworks. Now watch your step!" },
        ],
    },
};
