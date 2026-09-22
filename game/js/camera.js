"use strict";

// ---------------------------------------------------------------------------
// Smooth-follow camera with screen shake. Clamped to the world bounds so the
// player never sees out-of-map emptiness.
// ---------------------------------------------------------------------------
class Camera {
    constructor(viewW, viewH) {
        this.viewW = viewW;
        this.viewH = viewH;
        this.x = 0;
        this.y = 0;
        this.target = null;
        this.shake = 0;
    }

    Follow(target) {
        this.target = target;
        this.x = Clamp(target.x + target.w / 2 - this.viewW / 2, 0, CFG.WORLD_W - this.viewW);
        this.y = Clamp(target.y + target.h / 2 - this.viewH / 2, 0, CFG.WORLD_H - this.viewH);
    }

    addShake(amount) {
        this.shake = Math.min(1, this.shake + amount);
    }

    update(dt) {
        if (!this.target) return;

        const tx = this.target.x + this.target.w / 2 - this.viewW / 2;
        const ty = this.target.y + this.target.h / 2 - this.viewH / 2;

        this.x = Lerp(this.x, tx, Math.min(1, dt * CFG.CAMERA_SMOOTH));
        this.y = Lerp(this.y, ty, Math.min(1, dt * CFG.CAMERA_SMOOTH));

        this.x = Clamp(this.x, 0, CFG.WORLD_W - this.viewW);
        this.y = Clamp(this.y, 0, CFG.WORLD_H - this.viewH);
        this.shake = Math.max(0, this.shake - dt * CFG.CAMERA_SHAKE_FALLOFF);
    }

    apply(ctx) {
        let ox = 0;
        let oy = 0;
        if (this.shake > 0) {
            ox = (Math.random() - 0.5) * 10 * this.shake;
            oy = (Math.random() - 0.5) * 10 * this.shake;
        }
        ctx.save();
        ctx.translate(-Math.round(this.x + ox), -Math.round(this.y + oy));
    }

    restore(ctx) {
        ctx.restore();
    }
}