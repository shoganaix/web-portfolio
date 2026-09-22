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
    E: 69, F: 70, G: 71, SHIFT: 16, ESC: 27,
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
        Input.mouse.x = (e.clientX - rect.left) * canvas.width / rect.width;
        Input.mouse.y = (e.clientY - rect.top) * canvas.height / rect.height;
    });
}

function SetupTouchControls(canvas) {
    const joystick = document.getElementById("touch-joystick");
    const knob = document.getElementById("touch-knob");
    const interact = document.getElementById("touch-interact");
    const shoot = document.getElementById("touch-shoot");
    let joystickPointer = null;

    const setAction = (keycode) => {
        Input._down[keycode] = true;
        Input._held[keycode] = true;
        window.setTimeout(() => { Input._held[keycode] = false; }, 80);
    };

    const clearDirections = () => {
        Input._held[KEY.UP] = false;
        Input._held[KEY.DOWN] = false;
        Input._held[KEY.LEFT] = false;
        Input._held[KEY.RIGHT] = false;
        knob.style.transform = "translate(-50%, -50%)";
    };

    const updateJoystick = (event) => {
        const touch = event.touches[0];
        if (!touch) return;
        const rect = joystick.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const radius = rect.width * 0.36;
        const distance = Math.min(radius, Math.sqrt(dx * dx + dy * dy));
        const angle = Math.atan2(dy, dx);
        const knobX = Math.cos(angle) * distance;
        const knobY = Math.sin(angle) * distance;
        knob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;

        clearDirections();
        if (Math.abs(dx) > 12) Input._held[dx > 0 ? KEY.RIGHT : KEY.LEFT] = true;
        if (Math.abs(dy) > 12) Input._held[dy > 0 ? KEY.DOWN : KEY.UP] = true;
    };

    joystick.addEventListener("touchstart", (event) => {
        joystickPointer = event.touches[0].identifier;
        updateJoystick(event);
        event.preventDefault();
    }, { passive: false });
    joystick.addEventListener("touchmove", (event) => {
        if (joystickPointer !== null) updateJoystick(event);
        event.preventDefault();
    }, { passive: false });
    joystick.addEventListener("touchend", (event) => {
        joystickPointer = null;
        clearDirections();
        event.preventDefault();
    }, { passive: false });

    interact.addEventListener("touchstart", (event) => {
        setAction(KEY.E);
        event.preventDefault();
    }, { passive: false });
    shoot.addEventListener("touchstart", (event) => {
        setAction(KEY.SPACE);
        event.preventDefault();
    }, { passive: false });

    canvas.addEventListener("touchstart", (event) => {
        const touch = event.touches[0];
        if (!touch) return;
        const rect = canvas.getBoundingClientRect();
        Input.mouse.x = (touch.clientX - rect.left) * canvas.width / rect.width;
        Input.mouse.y = (touch.clientY - rect.top) * canvas.height / rect.height;
    }, { passive: true });
}