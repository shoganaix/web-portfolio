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
            { who: "Guide", text: "Press E close to people, chests and signs to interact." },
            { who: "Guide", text: "Press SPACE to swing your sword when enemies show up." },
            { who: "Guide", text: "Collect the glowing gemstones — the Sage to the east is looking for them." },
        ],
    },

    sage: {
        // Reacts to how many gems the player has gathered.
        lines: (state) => {
            if (state.gems >= state.requiredGems) {
                return [
                    { who: "Sage", text: "Magnificent! All five gemstones, just as the prophecy said." },
                    { who: "Sage", text: "You have proven yourself a true hero of the valley. The portal to my studio awaits you..." },
                    { who: "Sage", text: "Walk to the old tower in the west and press E to cross into the outer world." },
                ];
            }
            return [
                { who: "Sage", text: `The valley weakens, young one. I need ${state.requiredGems - state.gems} more gemstone(s) to reforge the crystal.` },
                { who: "Sage", text: "They sparkle near the chest, the trees and the edges of the map. Avoid the dark blobs!" },
            ];
        },
    },

    chest: {
        lines: [
            { who: "Chest", text: "You pry the lid open... a gemstone gleams inside! (+1)" },
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

    empty: {
        lines: [
            { who: "Chest", text: "Empty. Someone got here first..." },
        ],
    },

    respawn: {
        lines: [
            { who: "Guide", text: "You fainted from too many hits! Don't worry — the valley always brings you back." },
            { who: "Guide", text: "You kept your gemstones. Now watch your step!" },
        ],
    },
};