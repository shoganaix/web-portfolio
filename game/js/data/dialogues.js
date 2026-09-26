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
            { who: "Guide", text: "Press SPACE to attack when enemies show up." },
            { who: "Guide", text: "Collect the scattered artworks — the Sage to the east is looking for them." },
        ],
    },

    sage: {
        // Reacts to how many gems the player has gathered.
        lines: (state) => {
            if (state.gems >= state.requiredGems) {
                return [
                    { who: "Sage", text: "Magnificent! Five artworks, just as the prophecy said." },
                    { who: "Sage", text: "Give me five artworks and I will open the portal to my studio." },
                    { who: "Sage", text: "Walk to the old tower in the west and press E to cross into the outer world." },
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
            { who: "Sign", text: "TOWER OF CREATION — press E near the tower to visit my website." },
            { who: "Sign", text: "Tip: enemies knock you back, keep your distance and time your SPACE attack." },
        ],
    },

    portal: {
        lines: [
            { who: "Tower", text: "The tower hums with energy... E to step through, ESC to stay." },
        ],
    },

    portalLocked: {
        lines: [
            { who: "Tower", text: "It seems I cannot enter yet... the tower gives off a strange magical energy." },
        ],
    },

    enemyPortal: {
        lines: [
            { who: "Portal", text: "The portal awakens... enemies will keep coming from the darkness." },
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

    respawn: {
        lines: [
            { who: "Guide", text: "You fainted from too many hits! Don't worry — the valley always brings you back." },
            { who: "Guide", text: "You kept your artworks. Now watch your step!" },
        ],
    },
};