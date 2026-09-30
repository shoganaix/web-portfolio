"use strict";

// ---------------------------------------------------------------------------
// Bootstrap + game loop.
//
// The internal game resolution is controlled by CFG.VIEW_W / CFG.VIEW_H.
// The canvas is then visually scaled to COVER the browser viewport.
//
// IMPORTANT:
// Math.max() is used instead of Math.min().
//
// Math.min() = contain -> can create black/empty bars.
// Math.max() = cover   -> fills the entire screen, cropping overflow.
// ---------------------------------------------------------------------------

const Game = {

    canvas: null,
    ctx: null,
    scene: null,
    last: 0,


    /* =======================================================================
       INITIALIZATION
       ======================================================================= */

    onload() {

        const canvas =
            document.getElementById("myCanvas");


        /*
         * Internal game resolution.
         *
         * Do NOT use window.innerWidth / innerHeight here.
         * World coordinates, camera and sprites continue using
         * the game's logical resolution.
         */

        canvas.width =
            CFG.VIEW_W;

        canvas.height =
            CFG.VIEW_H;


        this.canvas =
            canvas;


        this.ctx =
            canvas.getContext("2d");


        /*
         * Essential for pixel art.
         */

        this.ctx.imageSmoothingEnabled =
            false;


        /* -------------------------------------------------------------------
           INPUT
           ------------------------------------------------------------------- */

        SetupKeyboardEvents();

        SetupMouseEvents(canvas);

        SetupTouchControls(canvas);


        /* -------------------------------------------------------------------
           UI
           ------------------------------------------------------------------- */

        Dialogue.OnReady();

        HUD.OnReady();


        /* -------------------------------------------------------------------
           SCENE
           ------------------------------------------------------------------- */

        this.scene =
            new Scene();


        this.scene.Start();


        /* -------------------------------------------------------------------
           RESIZE
           ------------------------------------------------------------------- */

        window.addEventListener(
            "resize",
            () => this.fit()
        );


        /*
         * Useful on mobile because browser chrome can change
         * the visual viewport without behaving like a normal
         * desktop resize.
         */

        if (window.visualViewport) {

            window.visualViewport.addEventListener(
                "resize",
                () => this.fit()
            );

        }


        /* -------------------------------------------------------------------
           KEYS
           ------------------------------------------------------------------- */

        document.addEventListener(
            "keydown",
            (e) => {

                if (
                    e.keyCode === KEY.ESC
                    &&
                    !e.repeat
                ) {

                    this.togglePause();

                }


                if (
                    e.keyCode === KEY.G
                    &&
                    !e.repeat
                ) {

                    HUD.toggleGallery();

                }

            }
        );


        /* -------------------------------------------------------------------
           START
           ------------------------------------------------------------------- */

        this.fit();


        this.last =
            performance.now();


        requestAnimationFrame(
            (t) => this.loop(t)
        );

    },


    /* =======================================================================
       FULLSCREEN CANVAS
       ======================================================================= */

    fit() {

        if (!this.canvas) {
            return;
        }


        /*
         * Logical game aspect ratio.
         *
         * Current config:
         *
         * 2880 / 1620 = 16:9
         */

        const viewWidth =
            CFG.VIEW_W;

        const viewHeight =
            CFG.VIEW_H;


        /*
         * Browser viewport.
         *
         * visualViewport is especially useful on phones.
         */

        const viewportWidth =
            window.visualViewport
                ? window.visualViewport.width
                : window.innerWidth;


        const viewportHeight =
            window.visualViewport
                ? window.visualViewport.height
                : window.innerHeight;


        /*
         * COVER SCALE
         *
         * THIS IS THE IMPORTANT CHANGE.
         *
         * Math.min() -> contain -> bars.
         * Math.max() -> cover   -> fullscreen.
         */

        const scale =
            Math.max(
                viewportWidth / viewWidth,
                viewportHeight / viewHeight
            );


        const width =
            Math.ceil(
                viewWidth *
                scale
            );


        const height =
            Math.ceil(
                viewHeight *
                scale
            );


        /*
         * CSS/display dimensions.
         *
         * Internal canvas dimensions remain unchanged.
         */

        this.canvas.style.width =
            `${width}px`;


        this.canvas.style.height =
            `${height}px`;


        /*
         * Center the overflow.
         *
         * If the viewport isn't exactly 16:9,
         * the excess gets cropped equally on both sides
         * or top/bottom.
         */

        this.canvas.style.position =
            "absolute";


        this.canvas.style.left =
            "50%";


        this.canvas.style.top =
            "50%";


        this.canvas.style.transform =
            "translate(-50%, -50%)";


        this.canvas.style.maxWidth =
            "none";


        this.canvas.style.maxHeight =
            "none";


        this.canvas.style.display =
            "block";


        /*
         * Pixel-art rendering.
         */

        this.canvas.style.imageRendering =
            "pixelated";


        this.ctx.imageSmoothingEnabled =
            false;

    },


    /* =======================================================================
       PAUSE
       ======================================================================= */

    togglePause() {

        if (
            Dialogue.isOpen()
        ) {

            return;

        }


        GameState.paused =
            !GameState.paused;


        HUD.updatePause();


        HUD.update(
            this.scene
                ? this.scene.projectiles.length
                : 0
        );

    },


    /* =======================================================================
       GAME LOOP
       ======================================================================= */

    loop(t) {

        /*
         * Clamp delta so returning to the tab doesn't cause
         * a huge simulation jump.
         */

        const dt =
            Math.min(
                (t - this.last) / 1000,
                0.05
            );


        this.last =
            t;


        /* -------------------------------------------------------------------
           UPDATE
           ------------------------------------------------------------------- */

        if (
            !GameState.paused
        ) {

            this.scene.Update(dt);

        } else {

            HUD.update(
                this.scene.projectiles.length
            );

        }


        /* -------------------------------------------------------------------
           DRAW
           ------------------------------------------------------------------- */

        this.scene.Draw(
            this.ctx
        );


        /* -------------------------------------------------------------------
           INPUT CLEANUP
           ------------------------------------------------------------------- */

        Input.PostUpdate();


        /* -------------------------------------------------------------------
           NEXT FRAME
           ------------------------------------------------------------------- */

        requestAnimationFrame(
            (tt) => this.loop(tt)
        );

    },

};


/* ==========================================================================
   START GAME
   ========================================================================== */

window.addEventListener(
    "load",
    () => Game.onload()
);