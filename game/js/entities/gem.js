"use strict";

// ---------------------------------------------------------------------------
// Collectible artwork. Picked up automatically on touch and added to the
// unlocked portfolio collection.
// ---------------------------------------------------------------------------
class Gem extends Entity {
    constructor(x, y, color, artworkIndex) {
        const S = CFG.SPRITE_SCALE;
        super(x, y, 22 * S, 18 * S);
        this.sprite = Placeholders.Gem(color || "#4fd6c1");
        this.artworkIndex = artworkIndex % ARTWORKS.length;
        this.artwork = LoadImage(`../web/images/${ARTWORKS[this.artworkIndex].file}`);
        this.baseY = y;
        this.time = Math.random() * 10;
        this.dead = false;
    }

    collect(player) {
        if (IsColliding(player.rect(), this.rect())) {
            GameState.gems += 1;
            if (!GameState.artworks.includes(this.artworkIndex)) {
                GameState.artworks.push(this.artworkIndex);
            }
            this.dead = true;
        }
    }

    draw(ctx) {
        this.time += 0.05;
        const bob = Math.sin(this.time * 3) * 3 * CFG.SPRITE_SCALE;
        const drawY = this.y + bob;
        ctx.fillStyle = "#172033";
        ctx.fillRect(this.x - 3, drawY - 3, this.w + 6, this.h + 6);
        if (this.artwork.complete && this.artwork.naturalWidth > 0) {
            ctx.drawImage(this.artwork, this.x, drawY, this.w, this.h);
        } else {
            ctx.drawImage(this.sprite, this.x, drawY, this.w, this.h);
        }
    }
}