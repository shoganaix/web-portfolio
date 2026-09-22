"use strict";

// ---------------------------------------------------------------------------
// Base class for everything that lives in the world. Entities expose a simple
// AABB rect() and can draw either in the ground pass or in the "above player"
// pass (drawAfter), e.g. tree crowns.
// ---------------------------------------------------------------------------
class Entity {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.layer = 0;
    }

    rect() {
        return MakeRect(this.x, this.y, this.w, this.h);
    }

    update(dt) {}

    draw(ctx) {}

    drawAfter(ctx) {}
}