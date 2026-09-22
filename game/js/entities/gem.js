"use strict";

// ---------------------------------------------------------------------------
// Collectible gemstone. Picked up automatically on touch; each one adds to
// GameState.gems (the Sage NPC reacts when you reach the required amount).
// ---------------------------------------------------------------------------
class Gem extends Entity {
    constructor(x, y, color) {
        const S = CFG.SPRITE_SCALE;
        super(x, y, 10 * S, 10 * S);
        this.sprite = Placeholders.Gem(color || "#4fd6c1");
        this.baseY = y;
        this.time = Math.random() * 10;
        this.dead = false;
    }

    collect(player) {
        if (IsColliding(player.rect(), this.rect())) {
            GameState.gems += 1;
            this.dead = true;
        }
    }

    draw(ctx) {
        this.time += 0.05;
        const bob = Math.sin(this.time * 3) * 3 * CFG.SPRITE_SCALE;
        ctx.drawImage(this.sprite, this.x, this.y + bob, this.w, this.h);
    }
}