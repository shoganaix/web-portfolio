"use strict";

// ---------------------------------------------------------------------------
// PROCEDURAL PLACEHOLDER ART.
// These little pixel sprites are generated at runtime so the game can be
// played (and feel complete) before the final art is ready. When you have the
// real PNGs, swap each `Placeholders.getX()` for a LoadImage("img/...") call
// in the entity that renders it.
// ---------------------------------------------------------------------------
const Placeholders = {
    _make(w, h) {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        return c;
    },

    _px(ctx, x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    },

    _speckle(ctx, palette, w, h, blob = () => true) {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (!blob(x, y, w, h)) continue;
                this._px(ctx, x, y, 1, 1, palette[Math.floor(Math.random() * palette.length)]);
            }
        }
    },

    // Small humanoid: head + robe. Great stand-in for any NPC.
    Npc(robeColor, skinColor) {
        const w = 24, h = 34;
        const c = this._make(w, h);
        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, w, h);

        // robe (trapezoid)
        ctx.fillStyle = robeColor;
        ctx.fillRect(8, 16, 8, 16);
        ctx.fillRect(9, 14, 6, 3);
        ctx.beginPath();
        ctx.moveTo(8, 16); ctx.lineTo(16, 16); ctx.lineTo(19, 32); ctx.lineTo(5, 32);
        ctx.closePath(); ctx.fill();
        // head
        ctx.fillStyle = skinColor;
        ctx.fillRect(9, 4, 6, 6);
        // eyes
        ctx.fillStyle = "#14161f";
        ctx.fillRect(10, 6, 1, 2);
        ctx.fillRect(13, 6, 1, 2);
        // hat
        ctx.fillStyle = "#2b2f4a";
        ctx.fillRect(8, 3, 8, 1);
        ctx.fillRect(7, 0, 10, 1);
        return c;
    },

    Guide() {
        return this.Npc("#3f7fd6", "#f2c99b");
    },

    Sage() {
        return this.Npc("#b447a3", "#8f6b5c");
    },

    // Enemy blob with angry eyes.
    Enemy(color) {
        const w = 26, h = 20;
        const c = this._make(w, h);
        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, w, h);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(2, 12);
        ctx.quadraticCurveTo(13, 2, 24, 12);
        ctx.quadraticCurveTo(24, 18, 13, 18);
        ctx.quadraticCurveTo(2, 18, 2, 12);
        ctx.closePath();
        ctx.fill();

        // angry eyes
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(7, 8, 3, 2);
        ctx.fillRect(16, 8, 3, 2);
        ctx.fillStyle = "#7a1222";
        ctx.fillRect(8, 9, 1, 1);
        ctx.fillRect(17, 9, 1, 1);
        return c;
    },

    BossEye(color) {
        const w = 40, h = 32;
        const c = this._make(w, h);
        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(4, 18);
        ctx.quadraticCurveTo(20, 2, 36, 18);
        ctx.quadraticCurveTo(36, 28, 20, 28);
        ctx.quadraticCurveTo(4, 28, 4, 18);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(14, 12, 12, 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(8, 8, 4, 3);
        ctx.fillRect(28, 8, 4, 3);
        return c;
    },

    // Gemstone.
    Gem(color) {
        const w = 10, h = 10;
        const c = this._make(w, h);
        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(5, 0); ctx.lineTo(10, 5); ctx.lineTo(5, 10); ctx.lineTo(0, 5);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fillRect(3, 2, 2, 1);
        // sparkle aura dots
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillRect(1, 0, 1, 1);
        ctx.fillRect(9, 5, 1, 1);
        return c;
    },

    // Open chest (used after the chest is opened).
    ChestOpen() {
        const w = 34, h = 29;
        const c = this._make(w, h);
        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, w, h);
        // lid open
        ctx.fillStyle = "#6b4a2f";
        ctx.fillRect(4, 4, 26, 4);
        // body
        ctx.fillStyle = "#7a5534";
        ctx.fillRect(3, 8, 28, 18);
        ctx.fillStyle = "#8f6a41";
        ctx.fillRect(3, 8, 28, 6);
        // lock + glow
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(15, 13, 4, 5);
        ctx.fillStyle = "rgba(255,209,102,0.35)";
        ctx.fillRect(0, 0, 34, 29);
        return c;
    },

    // Small speech bubble used over an NPC that wants to talk.
    Bubbling() {
        const w = 16, h = 12;
        const c = this._make(w, h);
        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fillRect(1, 2, 14, 8);
        ctx.fillRect(5, 10, 3, 2);
        ctx.fillStyle = "#14161f";
        ctx.font = "6px monospace";
        ctx.fillText("!", 6, 9);
        return c;
    },
};