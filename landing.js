(() => {
    const cards = [...document.querySelectorAll('.experience')];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const engineering = document.querySelector('.engineering-card');
    if (engineering?.querySelector('.orbit-front path') && engineering.querySelector('.orbit-back path') && engineering.querySelector('.orbit-object')) {
        const frontTrack = engineering.querySelector('.orbit-front');
        const backTrack = engineering.querySelector('.orbit-back');
        function updateOrbit() {
            const bounds = getComputedStyle(engineering);
            const width = parseFloat(bounds.width);
            const height = parseFloat(bounds.height);
            const angle = 70 * Math.PI / 180;
            const radiusX = height * .59;
            const radiusY = width * .5;
            const kappa = .5522847498;
            function point(x, y) {
                // Reflect the horizontal coordinate for both arcs and the satellite.
                return `${(width / 2 - x * Math.cos(angle) + y * Math.sin(angle)).toFixed(2)} ${(height / 2 + x * Math.sin(angle) + y * Math.cos(angle)).toFixed(2)}`;
            }
            // One shared path keeps the rail and satellite aligned at every screen size.
            const front = `M ${point(radiusX, 0)} C ${point(radiusX, radiusY * kappa)} ${point(radiusX * kappa, radiusY)} ${point(0, radiusY)} C ${point(-radiusX * kappa, radiusY)} ${point(-radiusX, radiusY * kappa)} ${point(-radiusX, 0)}`;
            const back = `M ${point(-radiusX, 0)} C ${point(-radiusX, -radiusY * kappa)} ${point(-radiusX * kappa, -radiusY)} ${point(0, -radiusY)} C ${point(radiusX * kappa, -radiusY)} ${point(radiusX, -radiusY * kappa)} ${point(radiusX, 0)}`;
            const shape = `${front} ${back.slice(back.indexOf(' C ') + 1)} Z`;
            // Both arcs remain visible; the opaque card naturally covers the far arc.
            for (const [track, arc] of [[frontTrack, front], [backTrack, back]]) {
                track.setAttribute('viewBox', `0 0 ${width} ${height}`);
                track.querySelector('path').setAttribute('d', arc);
            }
            engineering.style.setProperty('--orbit-path', `path('${shape}')`);
        }
        updateOrbit();
        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(updateOrbit);
            observer.observe(engineering);
        } else {
            window.addEventListener('resize', updateOrbit);
        }
    }
    let leaving = false;
    function activate(card) {
        if (leaving) return;
        cards.forEach(item => item.classList.toggle('is-active', item === card));
        document.body.dataset.world = card ? ['portfolio', 'game', 'engineering'][cards.indexOf(card)] : '';
    }
    cards.forEach(card => {
        card.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') activate(card); });
        card.addEventListener('pointerleave', () => activate(cards.find(item => item.contains(document.activeElement))));
        card.addEventListener('focus', () => activate(card));
        card.addEventListener('blur', () => activate(null));
        card.addEventListener('click', event => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || card.target === '_blank' || reducedMotion.matches) return;
            event.preventDefault();
            if (leaving) return;
            activate(card);
            leaving = true;
            card.classList.add('is-entering');
            setTimeout(() => location.assign(card.href), 240);
        });
    });
    window.addEventListener('pageshow', () => {
        leaving = false;
        cards.forEach(card => card.classList.remove('is-entering'));
        activate(null);
    });
})();
