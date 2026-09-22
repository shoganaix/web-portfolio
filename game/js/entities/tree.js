"use strict";

// ---------------------------------------------------------------------------
// Tree. Only the trunk collides; the crown is drawn AFTER the player so the
// hero disappears "behind" the leaves when walking above the tree (a small
// but satisfying depth trick).
// ---------------------------------------------------------------------------
class WorldTree extends Entity {
    constructor(x, y) {
        const S = CFG.SPRITE_SCALE;
        const artW = 113 * S;
        const artH = 110 * S;
        const trunkW = 11 * S;
        const trunkH = 29 * S;

        super(x, y + artH, trunkW, trunkH);

        this.artX = x;
        this.artY = y;
        this.artW = artW;
        this.artH = artH;

        this.imgTop = LoadImage("img/Arbol.png");
        this.imgTrunk = LoadImage("img/Tronco.png");

        // Center the trunk under the art.
        this.x = x + (artW - trunkW) / 2;
        this.y = y + artH - trunkH;
        this.layer = 1; // draw crown above the player
    }

    draw(ctx) {
        ctx.drawImage(this.imgTrunk, this.x, this.y, this.w, this.h);
    }

    drawAfter(ctx) {
        ctx.drawImage(this.imgTop, this.artX, this.artY, this.artW, this.artH);
    }
}