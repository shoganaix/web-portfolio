"use strict";

// ---------------------------------------------------------------------------
// Collectible artwork.
//
// Artwork pieces are automatically collected when the player touches them.
// Once collected, they are added to the unlocked portfolio collection.
// ---------------------------------------------------------------------------

class ArtworkPickup extends Entity {

    constructor(x, y, artworkIndex) {

        const S = CFG.SPRITE_SCALE;

        super(
            x,
            y,
            22 * S,
            18 * S
        );

        this.artworkIndex =
            artworkIndex % ARTWORKS.length;

        this.artwork =
            LoadImage(
                `../web/images/${ARTWORKS[this.artworkIndex].file}`
            );

        this.baseY = y;

        this.time =
            Math.random() * 10;

        this.dead = false;
    }


    // -----------------------------------------------------------------------
    // Collection
    // -----------------------------------------------------------------------

    collect(player) {

        if (
            !this.dead &&
            IsColliding(
                player.rect(),
                this.rect()
            )
        ) {

            if (
                !GameState.artworks.includes(
                    this.artworkIndex
                )
            ) {

                GameState.artworks.push(
                    this.artworkIndex
                );

            }

            this.dead = true;
        }
    }


    // -----------------------------------------------------------------------
    // Drawing
    // -----------------------------------------------------------------------

    draw(ctx) {

        if (this.dead) {
            return;
        }


        // Floating animation

        this.time += 0.05;

        const bob =
            Math.sin(this.time * 3) *
            3 *
            CFG.SPRITE_SCALE;


        const drawY =
            this.baseY + bob;


        // ---------------------------------------------------------------
        // Shadow
        // ---------------------------------------------------------------

        ctx.save();

        ctx.globalAlpha = 0.22;

        ctx.fillStyle = "#000000";

        ctx.beginPath();

        ctx.ellipse(
            this.x + this.w / 2,
            this.baseY + this.h + 5,
            this.w * 0.42,
            4 * CFG.SPRITE_SCALE,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();


        // ---------------------------------------------------------------
        // Artwork glow
        // ---------------------------------------------------------------

        ctx.save();

        ctx.shadowColor =
            "rgba(255, 209, 102, 0.85)";

        ctx.shadowBlur =
            8 * CFG.SPRITE_SCALE;


        // Dark frame behind the artwork

        ctx.fillStyle = "#172033";

        ctx.fillRect(
            this.x - 3,
            drawY - 3,
            this.w + 6,
            this.h + 6
        );


        // Golden border

        ctx.strokeStyle = "#ffd166";

        ctx.lineWidth =
            Math.max(
                1,
                CFG.SPRITE_SCALE
            );

        ctx.strokeRect(
            this.x - 3,
            drawY - 3,
            this.w + 6,
            this.h + 6
        );


        // ---------------------------------------------------------------
        // Artwork
        // ---------------------------------------------------------------

        if (
            this.artwork.complete &&
            this.artwork.naturalWidth > 0
        ) {

            ctx.drawImage(
                this.artwork,
                this.x,
                drawY,
                this.w,
                this.h
            );

        } else {

            // Fallback while image loads

            ctx.fillStyle = "#252b3f";

            ctx.fillRect(
                this.x,
                drawY,
                this.w,
                this.h
            );


            ctx.fillStyle = "#ffd166";

            ctx.font =
                `${8 * CFG.SPRITE_SCALE}px sans-serif`;

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.fillText(
                "ART",
                this.x + this.w / 2,
                drawY + this.h / 2
            );
        }


        ctx.restore();
    }
}