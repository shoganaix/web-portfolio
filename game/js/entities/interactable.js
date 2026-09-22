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

        if (type === "chest") {
            this.img = LoadImage("img/Cofre.png");
            this.imgSelected = LoadImage("img/CofreSeleccion.png");
            this.imgOpen = Placeholders.ChestOpen();
        } else if (type === "sign") {
            this.img = LoadImage("img/Cartel.png");
            this.imgSelected = this.img;
            this.imgOpen = null;
        } else if (type === "portal") {
            this.img = LoadImage("img/Tower.png");
            this.imgSelected = LoadImage("img/TowerSeleccion.png");
            this.imgOpen = null;
        } else {
            this.img = null;
            this.imgSelected = null;
            this.imgOpen = null;
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
                if (GameState.chestOpened) {
                    Dialogue.start("empty", GameState);
                } else {
                    GameState.chestOpened = true;
                    GameState.gems += 1;
                    Dialogue.start("chest", GameState);
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

        let sprite = this.img;
        if (this.type === "chest" && GameState.chestOpened) {
            sprite = this.imgOpen;
        } else if (this.near && this.imgSelected) {
            sprite = this.imgSelected;
        }

        ctx.drawImage(sprite, this.x, this.y, this.w, this.h);
    }
}