(function () {

    "use strict";

    // =====================================================
    // GLOBAL ELEMENTS
    // =====================================================

    const player = document.getElementById("music-player");
    const audio = document.getElementById("site-music");

    const playButton = document.getElementById("music-toggle");
    const seek = document.getElementById("music-seek");
    const time = document.getElementById("music-time");


    if (!player || !audio) {
        return;
    }


    // =====================================================
    // AUDIO CONTROLS
    // =====================================================

    function updatePlayIcon() {

        if (!playButton) return;

        if (audio.paused) {

            playButton.innerHTML =
                '<i class="fas fa-play"></i>';

            playButton.setAttribute(
                "aria-label",
                "Play music"
            );

        } else {

            playButton.innerHTML =
                '<i class="fas fa-pause"></i>';

            playButton.setAttribute(
                "aria-label",
                "Pause music"
            );

        }

    }


    playButton.addEventListener("click", function () {

        if (audio.paused) {

            audio.play();

        } else {

            audio.pause();

        }

    });


    audio.addEventListener("play", updatePlayIcon);
    audio.addEventListener("pause", updatePlayIcon);


    // =====================================================
    // AUDIO PROGRESS
    // =====================================================

    audio.addEventListener("timeupdate", function () {

        if (!audio.duration) return;

        const progress =
            (audio.currentTime / audio.duration) * 100;

        seek.value = progress;

        time.textContent =
            formatTime(audio.currentTime);

    });


    seek.addEventListener("input", function () {

        if (!audio.duration) return;

        audio.currentTime =
            (seek.value / 100) * audio.duration;

    });


    function formatTime(seconds) {

        if (!Number.isFinite(seconds)) {
            return "0:00";
        }

        const minutes =
            Math.floor(seconds / 60);

        const secs =
            Math.floor(seconds % 60)
                .toString()
                .padStart(2, "0");

        return minutes + ":" + secs;

    }


    // =====================================================
    // PLAYER POSITION
    // =====================================================

    function placePlayer() {

        const homeSlot =
            document.getElementById("home-player-slot");


        /*
         * HOME
         *
         * Move the SAME element below "See my work".
         *
         * appendChild DOES NOT recreate the audio element,
         * so playback continues.
         */

        if (homeSlot) {

            homeSlot.appendChild(player);

            player.classList.add("home-mode");

            return;

        }


        /*
         * OTHER PAGES
         *
         * Move it directly under body.
         * CSS fixes it to the bottom of the screen.
         */

        document.body.appendChild(player);

        player.classList.remove("home-mode");

    }


    // =====================================================
    // PAGE-SPECIFIC ASSETS
    // =====================================================

    const PAGE_ASSETS = {

        "index.html": {
            css: "css/style.css",
            scripts: [
                "js/index.js"
            ]
        },

        "about.html": {
            css: "css/about.css",
            scripts: [
                "js/waypoints/noframework.waypoints.js",
                "js/about.js"
            ]
        },

        "portfolio.html": {
            css: "css/portfolio.css",
            scripts: [
                "js/portfolio.js"
            ]
        },

        "contact.html": {
            css: "css/contact.css",
            scripts: []
        }

    };


    // =====================================================
    // GET PAGE NAME
    // =====================================================

    function getPageName(url) {

        const parsed =
            new URL(url, window.location.href);

        const name =
            parsed.pathname.split("/").pop();

        return name || "index.html";

    }


    // =====================================================
    // LOAD PAGE CSS
    // =====================================================

    function loadPageCSS(pageName) {

        const config =
            PAGE_ASSETS[pageName];

        if (!config) return;


        const oldStyles =
            document.querySelectorAll(
                'link[data-page-style]'
            );

        oldStyles.forEach(function (style) {
            style.remove();
        });


        const link =
            document.createElement("link");

        link.rel = "stylesheet";
        link.href = config.css;

        link.dataset.pageStyle = "true";

        document.head.appendChild(link);

    }


    // =====================================================
    // LOAD PAGE SCRIPTS
    // =====================================================

    function loadPageScripts(pageName) {

        const config =
            PAGE_ASSETS[pageName];

        if (!config) return;


        config.scripts.forEach(function (src) {

            const script =
                document.createElement("script");

            script.src =
                src + "?v=" + Date.now();

            script.dataset.dynamicScript = "true";

            document.body.appendChild(script);

        });

    }


    // =====================================================
    // ACTIVE NAV LINK
    // =====================================================

    function updateNavigation(pageName) {

        document
            .querySelectorAll(".navbar .nav-link")
            .forEach(function (link) {

                const href =
                    getPageName(link.href);

                link.classList.toggle(
                    "active",
                    href === pageName
                );

            });

    }


    // =====================================================
    // CLOSE MOBILE NAVIGATION
    // =====================================================

    function closeMobileNavbar() {

        const collapse =
            document.getElementById(
                "navbarSupportedContent"
            );

        if (
            collapse &&
            collapse.classList.contains("show") &&
            typeof bootstrap !== "undefined"
        ) {

            const instance =
                bootstrap.Collapse.getOrCreateInstance(
                    collapse
                );

            instance.hide();

        }

    }


    // =====================================================
    // LOAD PAGE
    // =====================================================

    async function navigate(url, pushState = true) {

        try {

            const response =
                await fetch(url);

            if (!response.ok) {
                throw new Error(
                    "Unable to load " + url
                );
            }

            const html =
                await response.text();

            const parser =
                new DOMParser();

            const nextDocument =
                parser.parseFromString(
                    html,
                    "text/html"
                );


            const nextContent =
                nextDocument.querySelector(
                    "#page-content"
                );

            const currentContent =
                document.querySelector(
                    "#page-content"
                );


            /*
             * If the required wrapper isn't there,
             * fall back to normal navigation.
             */

            if (!nextContent || !currentContent) {

                window.location.href = url;

                return;

            }


            const pageName =
                getPageName(url);


            // -----------------------------------------
            // Fade out
            // -----------------------------------------

            currentContent.classList.add(
                "page-leaving"
            );


            await new Promise(function (resolve) {

                window.setTimeout(
                    resolve,
                    220
                );

            });


            // -----------------------------------------
            // Change content
            // -----------------------------------------

            currentContent.innerHTML =
                nextContent.innerHTML;


            document.title =
                nextDocument.title;


            // -----------------------------------------
            // CSS
            // -----------------------------------------

            loadPageCSS(pageName);


            // -----------------------------------------
            // History
            // -----------------------------------------

            if (pushState) {

                history.pushState(
                    { page: pageName },
                    "",
                    url
                );

            }


            // -----------------------------------------
            // Navbar
            // -----------------------------------------

            updateNavigation(pageName);
            closeMobileNavbar();


            // -----------------------------------------
            // Music player
            // -----------------------------------------

            placePlayer();


            // -----------------------------------------
            // Page JavaScript
            // -----------------------------------------

            loadPageScripts(pageName);


            // -----------------------------------------
            // Transition in
            // -----------------------------------------

            currentContent.classList.remove(
                "page-leaving"
            );

            currentContent.classList.add(
                "page-entering"
            );


            requestAnimationFrame(function () {

                currentContent.classList.remove(
                    "page-entering"
                );

            });


            window.scrollTo(0, 0);

        } catch (error) {

            console.error(error);

            /*
             * Safe fallback:
             * perform ordinary navigation.
             */

            window.location.href = url;

        }

    }


    // =====================================================
    // INTERCEPT NAVIGATION
    // =====================================================

    document.addEventListener(
        "click",
        function (event) {

            const link =
                event.target.closest(
                    'a[href$=".html"]'
                );


            if (!link) return;


            /*
             * Do NOT intercept:
             *
             * - links to the game
             * - target="_blank"
             * - external links
             */

            if (
                link.target === "_blank" ||
                link.hostname !== window.location.hostname ||
                link.getAttribute("href").startsWith("../")
            ) {
                return;
            }


            const pageName =
                getPageName(link.href);


            if (!PAGE_ASSETS[pageName]) {
                return;
            }


            event.preventDefault();

            navigate(link.href, true);

        }
    );


    // =====================================================
    // BROWSER BACK / FORWARD
    // =====================================================

    window.addEventListener(
        "popstate",
        function () {

            navigate(
                window.location.href,
                false
            );

        }
    );


    // =====================================================
    // INITIAL PAGE
    // =====================================================

    placePlayer();
    updatePlayIcon();

})();