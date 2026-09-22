"use strict";

// ---------------------------------------------------------------------------
// Interactable props: chest, sign, portal (tower). Each has a collision box
// at its base and reacts when the player presses E nearby.
// ---------------------------------------------------------------------------
class Interactable extends Entity {
    constructor(x, y, type) {
        const S = CFG.SPRITE_SCALE;
        let w, h, collW, collH;

        switch (type) {
            case "chest":
                w = 34 * S; h = 29 * S; collW = 34 * S; collH = 14 * S;
                break;
            case "sign":
                w = 27 * S; h = 32 * S; collW = 27 * S; collH = 10 * S;
                break;
            case "portal":
                w = 78 * S; h = 180 * S; collW = 110; collH = 100;
                break;
            default:
                w = 34 * S; h = 29 * S; collW = 34 * S; collH = 14 * S;
                break;
        }

        super(x, y, w, h);

        this.type = type;
        this.used = false;
        this.near = false;
        this.confirmPortal = false;

        // Chest opening animation state (5 frames, see img/openchestsheet.png).
        this.opening = false;
        this.openTimer = 0;
        this.openFrame = 0;

        if (type === "chest") {
            this.img = LoadImage("img/Cofre.png");
            this.imgSelected = LoadImage("img/CofreSeleccion.png");
            this.imgOpenSheet = LoadImage("img/openchestsheet.png");
        } else if (type === "sign") {
            this.img = LoadImage("img/Cartel.png");
            this.imgSelected = this.img;
            this.imgOpenSheet = null;
        } else if (type === "portal") {
            this.img = LoadImage("img/Tower.png");
            this.imgSelected = LoadImage("img/TowerSeleccion.png");
            this.imgOpenSheet = null;
        } else {
            this.img = null;
            this.imgSelected = null;
            this.imgOpenSheet = null;
        }

        // collision box sits just above the entity's feet
        this.colRect = () =>
            MakeRect(
                this.x + (this.w - collW) / 2,
                this.y + this.h - collH,
                collW,
                collH
            );
    }

    rect() {
        return this.colRect();
    }

    update(dt, player) {
        const wasNear = this.near;
        this.near = IsInTrigger(player.rect(), this.rect());

        // Leaving the tower cancels the confirm state.
        if (!this.near) {
            this.confirmPortal = false;
        }

        // Chest opening animation: play frames, then show the message below.
        if (this.opening) {
            const FRAME_TIME = 0.12;
            this.openTimer += dt;
            this.openFrame = Math.min(4, Math.floor(this.openTimer / FRAME_TIME));
            if (this.openTimer >= FRAME_TIME * 5) {
                this.opening = false;
                Dialogue.start("chest", GameState);
            }
        }

        // Confirmed portal: pressing E while still near the tower goes to web.
        if (this.type === "portal" && this.near && this.confirmPortal && !Dialogue.isOpen() && Input.Pressed(KEY.E)) {
            window.location.href = "../web/index.html";
            return;
        }

        return wasNear !== this.near;
    }

    interact() {
        switch (this.type) {
            case "chest":
                if (this.opening) break;
                if (GameState.chestOpened) {
                    Dialogue.start("empty", GameState);
                } else {
                    GameState.chestOpened = true;
                    GameState.gems += 1;
                    this.opening = true;
                    this.openTimer = 0;
                    this.openFrame = 0;
                }
                break;

            case "sign":
                Dialogue.start("sign", GameState);
                break;

            case "portal":
                if (this.confirmPortal) {
                    window.location.href = "../web/index.html";
                } else {
                    Dialogue.start("portal", GameState, () => {
                        this.confirmPortal = true;
                    });
                }
                break;
        }
    }

    draw(ctx) {
        if (!this.img) return;

        if (this.type === "chest" && GameState.chestOpened) {
            // Draw one frame of the open-chest sheet, anchored at the feet.
            const cellW = 43, cellH = 64;
            const drawW = cellW * CFG.SPRITE_SCALE;
            const drawH = cellH * CFG.SPRITE_SCALE;
            const dx = this.x + (this.w - drawW) / 2;
            const dy = this.y + this.h - drawH;
            ctx.drawImage(
                this.imgOpenSheet,
                this.openFrame * cellW, 0, cellW, cellH,
                dx, dy, drawW, drawH
            );
            return;
        }

        let sprite = this.img;
        if (this.near && this.imgSelected) {
            sprite = this.imgSelected;
        }

        ctx.drawImage(sprite, this.x, this.y, this.w, this.h);
    }
}