"use strict";

// ---------------------------------------------------------------------------
// Math + collision helpers shared by every entity and system.
// ---------------------------------------------------------------------------

function Clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
}

function Lerp(a, b, t) {
    return a + (b - a) * t;
}

function DistSq(ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    return dx * dx + dy * dy;
}

function MakeRect(x, y, width, height) {
    return { x: x, y: y, width: width, height: height };
}

function IsColliding(a, b) {
    return !(
        a.x >= b.x + b.width ||
        a.x + a.width <= b.x ||
        a.y >= b.y + b.height ||
        a.y + a.height <= b.y
    );
}

// Expanded hitbox used to detect "standing close enough to interact".
function IsInTrigger(playerRect, targetRect) {
    const trigger = MakeRect(
        targetRect.x - playerRect.width / 2,
        targetRect.y - playerRect.height / 2,
        targetRect.width + playerRect.width,
        targetRect.height + playerRect.height
    );
    return IsColliding(playerRect, trigger);
}

function LoadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}