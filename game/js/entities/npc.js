"use strict";

// ---------------------------------------------------------------------------
// NPC. Stands in the world, is solid, and starts a dialogue when the player
// interacts. A little "!" bubble pops up above the head when the player is
// close enough to talk.
// ---------------------------------------------------------------------------
class NPC extends Entity {
    constructor(x, y, name, dialogueId, sprite, path) {
        const S = CFG.SPRITE_SCALE;
        const w = 24 * S;
        const h = 34 * S;

        super(x, y, w, h);
        this.name = name;
        this.dialogueId = dialogueId;
        this.sprite = sprite;
        this.near = false;
        this.time = Math.random() * 10;
        this.path = path || [];
        this.pathIndex = 0;
        this.pathSpeed = 48;
        this.colRect = () => MakeRect(this.x + 5 * S, this.y + 20 * S, 14 * S, 14 * S);
    }

    rect() {
        return this.colRect();
    }

    update(dt, player) {
        this.time += dt;

        if (this.path.length > 0) {
            const target = this.path[this.pathIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 3) {
                this.x = target.x;
                this.y = target.y;
                this.pathIndex = (this.pathIndex + 1) % this.path.length;
            } else {
                this.x += (dx / distance) * this.pathSpeed * dt;
                this.y += (dy / distance) * this.pathSpeed * dt;
            }
        }

        this.near = IsInTrigger(player.rect(), this.rect());
    }

    interact() {
        const onClose = this.dialogueId === "sage"
            ? () => {
                if (GameState.gems >= GameState.requiredGems) {
                    GameState.gems -= GameState.requiredGems;
                    GameState.sageSpoken = true;
                }
            }
            : null;
        Dialogue.start(this.dialogueId, GameState, onClose);
    }

    draw(ctx) {
        const bob = Math.sin(this.time * 2) * 1.5 * CFG.SPRITE_SCALE;
        ctx.drawImage(this.sprite, this.x, this.y + bob, this.w, this.h);

        if (this.near && !Dialogue.isOpen()) {
            const bubble = Placeholders.Bubbling();
            const bw = 16 * CFG.SPRITE_SCALE;
            const bh = 12 * CFG.SPRITE_SCALE;
            ctx.drawImage(bubble, this.x + this.w / 2 - bw / 2, this.y - bh - 4, bw, bh);
        }
    }
}