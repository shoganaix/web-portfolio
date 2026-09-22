"use strict";

// ---------------------------------------------------------------------------
// Input handling. All keys are declared, edge-triggered helpers are exposed
// (Pressed fires once per keypress) and the PostUpdate() call clears the
// "just pressed"/"just released" state every frame.
// ---------------------------------------------------------------------------

const KEY = {
    LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40,
    A: 65, D: 68, W: 87, S: 83,
    SPACE: 32, ENTER: 13,
    E: 69, F: 70, ESC: 27,
};

const GAME_BLOCKED_KEYS = [KEY.LEFT, KEY.RIGHT, KEY.UP, KEY.DOWN, KEY.SPACE];

const Input = {
    mouse: { x: 0, y: 0, down: false, up: false, pressed: false },

    _down: {},   // pressed this very frame (edge)
    _held: {},   // currently holding the key
    _up: {},     // released this frame (edge)

    // Fired once per key press.
    Pressed(keycode) {
        return !!this._down[keycode];
    },

    // True while the key is held.
    Held(keycode) {
        return !!this._held[keycode];
    },

    // Fired once per key release.
    Released(keycode) {
        return !!this._up[keycode];
    },

    IsMousePressed() {
        return this.mouse.pressed;
    },

    PostUpdate() {
        this._down = {};
        this._up = {};
        this.mouse.down = false;
        this.mouse.up = false;
        Input.mouse.pressed = false;
    },
};

function PreventGameKeys(e) {
    if (GAME_BLOCKED_KEYS.indexOf(e.keyCode) !== -1) {
        e.preventDefault();
    }
}

function SetupKeyboardEvents() {
    document.addEventListener("keydown", function (e) {
        PreventGameKeys(e);
        if (!e.repeat) {
            Input._down[e.keyCode] = true;
            Input._held[e.keyCode] = true;
        }
    });

    document.addEventListener("keyup", function (e) {
        Input._up[e.keyCode] = true;
        Input._held[e.keyCode] = false;
    });
}

function SetupMouseEvents(canvas) {
    canvas.addEventListener("mousedown", function () {
        Input.mouse.down = true;
        Input.mouse.pressed = true;
    });
    canvas.addEventListener("mouseup", function () {
        Input.mouse.up = true;
        Input.mouse.pressed = false;
    });
    canvas.addEventListener("mousemove", function (e) {
        const rect = canvas.getBoundingClientRect();
        Input.mouse.x = e.clientX - rect.left;
        Input.mouse.y = e.clientY - rect.top;
    });
}