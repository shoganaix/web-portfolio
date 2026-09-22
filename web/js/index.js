document.addEventListener("DOMContentLoaded", function () {
    const elem = document.querySelector("#parallax");
    if (!elem) return;

    document.addEventListener("mousemove", function (e) {
        const w = window.innerWidth / 2;
        const h = window.innerHeight / 2;
        const mx = e.clientX;
        const my = e.clientY;
        const depth1 = `${50 - (mx - w) * 0.01}% ${50 - (my - h) * 0.01}%`;
        const depth2 = `${50 - (mx - w) * 0.02}% ${50 - (my - h) * 0.02}%`;
        const depth3 = `${50 - (mx - w) * 0.06}% ${50 - (my - h) * 0.06}%`;
        elem.style.backgroundPosition = `${depth3}, ${depth2}, ${depth1}`;
    });
});