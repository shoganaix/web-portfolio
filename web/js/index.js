(function () {
    "use strict";

    // Mouse-parallax for the home hero. Each landscape layer moves by a
    // different amount, following the cursor (with a smoothing loop).
    const wrap = document.getElementById("parallax");
    if (!wrap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layers = Array.prototype.slice.call(wrap.querySelectorAll(".layer"));
    const DEPTH = { "layer-far": 38, "layer-mid": 24, "layer-near": 12, "layer-front": 5 };

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const onMove = function (e) {
        target.x = (e.clientX / window.innerWidth - 0.5) * 2;
        target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);
    let frame;
    window.pageCleanup = () => { cancelAnimationFrame(frame); window.removeEventListener("mousemove", onMove); };

    function loop() {
        current.x += (target.x - current.x) * 0.06;
        current.y += (target.y - current.y) * 0.06;

        layers.forEach(function (layer) {
            for (const cls in DEPTH) {
                if (layer.classList.contains(cls)) {
                    const d = DEPTH[cls];
                    layer.style.transform =
                        "translate3d(" + (current.x * d).toFixed(2) + "px," + (current.y * d).toFixed(2) + "px,0)";
                    break;
                }
            }
        });

        frame = requestAnimationFrame(loop);
    }
    loop();
})();