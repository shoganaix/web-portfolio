/* Static pages with progressive navigation and one persistent audio element. */

(() => {

    "use strict";


    /* =====================================================
       PAGE SCRIPTS
    ====================================================== */

    const pages = {

        "index.html": [
            "js/index.js"
        ],

        "about.html": [
            "js/about.js"
        ],

        "portfolio.html": [
            "js/portfolio.js"
        ],

        "contact.html": []

    };


    const directory =
        new URL(".", location.href);


    /* =====================================================
       MUSIC PLAYER
    ====================================================== */

    const player =
        document.createElement("aside");


    player.id =
        "music-player";


    player.setAttribute(
        "aria-label",
        "Background music"
    );


    /*
       + Songs removed completely.
    */

    player.innerHTML = `
        <div class="music-label">
            <span>Soundtrack</span>
            <strong id="track-title"></strong>
        </div>

        <div class="track-buttons">
            <button
                type="button"
                id="track-prev"
                aria-label="Previous track">
                ❮
            </button>

            <button
                type="button"
                id="track-next"
                aria-label="Next track">
                ❯
            </button>
        </div>

        <audio
            id="site-music"
            controls
            preload="metadata"
            aria-label="Portfolio soundtrack">
        </audio>

        <span
            id="music-status"
            class="visually-hidden"
            role="status">
        </span>
    `;


    /*
       Keep the audio mounted here:
       moving it between parents can stop playback.
    */

    document.body.append(player);


    const audio =
        player.querySelector("audio");


    /* =====================================================
       TRACKS
    ====================================================== */

    /*
       Add any published songs here.

       Example:

       const tracks = [
           {
               title: "Original soundtrack",
               src: "audio/song.mp3"
           },
           {
               title: "Forest Theme",
               src: "audio/forest.mp3"
           }
       ];
    */

    const tracks = [

        {
            title:
                "Original soundtrack",

            src:
                "audio/song.mp3"
        }

    ];


    let trackIndex =
        0;


    const previous =
        player.querySelector("#track-prev");


    const next =
        player.querySelector("#track-next");


    const title =
        player.querySelector("#track-title");


    const status =
        player.querySelector("#music-status");


    /* =====================================================
       UPDATE TRACK UI
    ====================================================== */

    function updateTrack() {

        const track =
            tracks[trackIndex];


        title.textContent =
            track.title;


        const hasMultipleTracks =
            tracks.length > 1;


        previous.disabled =
            !hasMultipleTracks;


        next.disabled =
            !hasMultipleTracks;


        previous.title =
            hasMultipleTracks
                ? "Previous track"
                : "Only one soundtrack available";


        next.title =
            hasMultipleTracks
                ? "Next track"
                : "Only one soundtrack available";


        /*
           One song:
           loop indefinitely.

           Multiple songs:
           ended event selects the next one.
        */

        audio.loop =
            tracks.length === 1;

    }


    /* =====================================================
       CHANGE TRACK
    ====================================================== */

    function changeTrack(
        index,
        play = !audio.paused
    ) {

        if (!tracks.length) {
            return;
        }


        trackIndex =
            (
                index +
                tracks.length
            )
            %
            tracks.length;


        audio.src =
            tracks[trackIndex].src;


        updateTrack();


        if (play) {

            audio
                .play()
                .catch(() => {

                    status.textContent =
                        "Press play to start the selected song.";

                });

        }


        saveMusic();

    }


    /* =====================================================
       PLAYER BUTTONS
    ====================================================== */

    previous.addEventListener(
        "click",
        () => {

            changeTrack(
                trackIndex - 1
            );

        }
    );


    next.addEventListener(
        "click",
        () => {

            changeTrack(
                trackIndex + 1
            );

        }
    );


    audio.addEventListener(
        "ended",
        () => {

            if (tracks.length > 1) {

                changeTrack(
                    trackIndex + 1,
                    true
                );

            }

        }
    );


    /* =====================================================
       AUDIO ERROR
    ====================================================== */

    audio.addEventListener(
        "error",
        () => {

            status.textContent =
                "This audio file could not be played.";

        }
    );


    /* =====================================================
       INITIAL TRACK
    ====================================================== */

    audio.src =
        tracks[0].src;


    updateTrack();


    /* =====================================================
       MUSIC PERSISTENCE
    ====================================================== */

    const storageKey =
        "shoganai-music";


    let saved;


    try {

        saved =
            JSON.parse(
                sessionStorage.getItem(
                    storageKey
                )
                ||
                "null"
            );

    } catch (_) {

        /* Storage may be disabled. */

    }


    if (saved) {

        audio.volume =
            Number.isFinite(saved.volume)

                ? Math.max(
                    0,
                    Math.min(
                        1,
                        saved.volume
                    )
                )

                : 1;


        audio.muted =
            !!saved.muted;


        audio.addEventListener(
            "loadedmetadata",
            () => {

                /*
                   Restore time only if the stored track
                   is still the same published track.
                */

                if (
                    (
                        !saved.track
                        ||
                        saved.track ===
                            tracks[trackIndex].src
                    )
                    &&
                    Number.isFinite(saved.time)
                    &&
                    audio.duration
                ) {

                    audio.currentTime =
                        saved.time
                        %
                        audio.duration;

                }


                if (saved.playing) {

                    audio
                        .play()
                        .catch(() => {

                            /*
                               Browser autoplay restrictions may
                               prevent playback until interaction.
                            */

                        });

                }

            },
            {
                once:
                    true
            }
        );

    }


    /* =====================================================
       SAVE MUSIC STATE
    ====================================================== */

    function saveMusic() {

        try {

            sessionStorage.setItem(
                storageKey,
                JSON.stringify({

                    track:
                        tracks[trackIndex].src,

                    time:
                        audio.currentTime,

                    playing:
                        !audio.paused,

                    volume:
                        audio.volume,

                    muted:
                        audio.muted

                })
            );

        } catch (_) {

            /* Optional persistence. */

        }

    }


    [
        "pause",
        "play",
        "volumechange"
    ]
    .forEach(
        event => {

            audio.addEventListener(
                event,
                saveMusic
            );

        }
    );


    window.addEventListener(
        "pagehide",
        saveMusic
    );


    let lastSave =
        0;


    audio.addEventListener(
        "timeupdate",
        () => {

            if (
                Date.now() -
                lastSave
                >
                1500
            ) {

                lastSave =
                    Date.now();


                saveMusic();

            }

        }
    );


    /* =====================================================
       MUSIC PLAYER POSITION
    ====================================================== */

    function positionPlayer() {

        const slot =
            document.getElementById(
                "home-player-slot"
            );


        player.classList.toggle(
            "home-mode",
            !!slot
        );


        if (slot) {

            const rect =
                slot.getBoundingClientRect();


            player.style.top =
                `${
                    rect.top +
                    window.scrollY
                }px`;


            player.style.left =
                `${
                    rect.left +
                    rect.width / 2
                }px`;

        } else {

            player.style.top =
                "";


            player.style.left =
                "";

        }

    }


    window.addEventListener(
        "resize",
        positionPlayer
    );


    if (document.fonts) {

        document.fonts.ready
            .then(
                positionPlayer
            );

    }


    /* =====================================================
       LOAD PAGE SCRIPTS
    ====================================================== */

    async function loadScripts(name) {

        document
            .querySelectorAll(
                "script[data-page-script]"
            )
            .forEach(
                script =>
                    script.remove()
            );


        for (
            const src
            of
            pages[name] || []
        ) {

            await new Promise(
                (
                    resolve,
                    reject
                ) => {

                    const script =
                        document.createElement(
                            "script"
                        );


                    script.src =
                        new URL(
                            src,
                            directory
                        ).href;


                    script.dataset.pageScript =
                        "";


                    script.onload =
                        resolve;


                    script.onerror =
                        reject;


                    document.body.append(
                        script
                    );

                }
            );

        }

    }


    /* =====================================================
       PAGE NAME
    ====================================================== */

    function pageName(url) {

        return (
            url.pathname
                .split("/")
                .pop()
            ||
            "index.html"
        );

    }


    /* =====================================================
       PROGRESSIVE NAVIGATION
    ====================================================== */

    let controller;


    let navigation =
        0;


    let commit =
        Promise.resolve();


    async function navigate(
        url,
        push = true
    ) {

        const request =
            ++navigation;


        if (controller) {

            controller.abort();

        }


        controller =
            new AbortController();


        try {

            const response =
                await fetch(
                    url,
                    {
                        signal:
                            controller.signal
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Page unavailable"
                );

            }


            const html =
                await response.text();


            const nextDocument =
                new DOMParser()
                    .parseFromString(
                        html,
                        "text/html"
                    );


            const content =
                nextDocument.querySelector(
                    "#page-content"
                );


            if (!content) {

                throw new Error(
                    "Missing page content"
                );

            }


            /*
               Serialize commits so late scripts cannot
               initialize another page.
            */

            commit =
                commit
                    .catch(() => {})
                    .then(
                        async () => {

                            if (
                                request !==
                                navigation
                            ) {

                                return;

                            }


                            const nextStyle =
                                nextDocument.querySelector(
                                    "[data-page-style]"
                                );


                            if (!nextStyle) {

                                throw new Error(
                                    "Missing page stylesheet"
                                );

                            }


                            const style =
                                nextStyle
                                    .cloneNode();


                            await new Promise(
                                (
                                    resolve,
                                    reject
                                ) => {

                                    style.onload =
                                        resolve;


                                    style.onerror =
                                        reject;


                                    document.head.append(
                                        style
                                    );

                                }
                            );


                            if (
                                request !==
                                navigation
                            ) {

                                style.remove();

                                return;

                            }


                            /* =========================
                               CLEAN OLD PAGE
                            ========================== */

                            if (
                                window.pageCleanup
                            ) {

                                window.pageCleanup();


                                window.pageCleanup =
                                    null;

                            }


                            /* =========================
                               REPLACE PAGE CSS
                            ========================== */

                            document
                                .querySelectorAll(
                                    "[data-page-style]"
                                )
                                .forEach(
                                    currentStyle => {

                                        if (
                                            currentStyle
                                            !==
                                            style
                                        ) {

                                            currentStyle
                                                .remove();

                                        }

                                    }
                                );


                            /* =========================
                               REPLACE PAGE CONTENT
                            ========================== */

                            document
                                .querySelector(
                                    "#page-content"
                                )
                                .replaceWith(
                                    content
                                );


                            /* =========================
                               DOCUMENT TITLE
                            ========================== */

                            document.title =
                                nextDocument.title;


                            /* =========================
                               HISTORY
                            ========================== */

                            if (push) {

                                history.pushState(
                                    {},
                                    "",
                                    url
                                );

                            }


                            /* =========================
                               ACTIVE NAV LINK
                            ========================== */

                            document
                                .querySelectorAll(
                                    ".navbar .nav-link"
                                )
                                .forEach(
                                    anchor => {

                                        const
                                            anchorURL =
                                                new URL(
                                                    anchor.href
                                                );


                                        const active =
                                            (
                                                anchorURL.pathname
                                                ===
                                                url.pathname
                                            );


                                        anchor.classList.toggle(
                                            "active",
                                            active
                                        );


                                        if (active) {

                                            anchor.setAttribute(
                                                "aria-current",
                                                "page"
                                            );

                                        } else {

                                            anchor.removeAttribute(
                                                "aria-current"
                                            );

                                        }

                                    }
                                );


                            /* =========================
                               CLOSE MOBILE NAVBAR
                            ========================== */

                            const menu =
                                document.getElementById(
                                    "navbarSupportedContent"
                                );


                            if (
                                window.bootstrap
                                &&
                                menu
                            ) {

                                bootstrap
                                    .Collapse
                                    .getOrCreateInstance(
                                        menu,
                                        {
                                            toggle:
                                                false
                                        }
                                    )
                                    .hide();

                            }


                            /* =========================
                               LOAD NEW PAGE JS
                            ========================== */

                            await loadScripts(
                                pageName(url)
                            );


                            /* =========================
                               SCROLL
                            ========================== */

                            window.scrollTo(
                                0,
                                0
                            );


                            /* =========================
                               PLAYER POSITION
                            ========================== */

                            positionPlayer();


                            /* =========================
                               FOCUS
                            ========================== */

                            content.focus(
                                {
                                    preventScroll:
                                        true
                                }
                            );


                            /* =========================
                               HASH
                            ========================== */

                            if (url.hash) {

                                document
                                    .getElementById(
                                        decodeURIComponent(
                                            url.hash.slice(1)
                                        )
                                    )
                                    ?.scrollIntoView();

                            }

                        }
                    );


            await commit;

        } catch (error) {

            if (
                error.name
                !==
                "AbortError"
                &&
                request
                ===
                navigation
            ) {

                location.assign(
                    url.href
                );

            }

        }

    }


    /* =====================================================
       INTERNAL LINK INTERCEPTION
    ====================================================== */

    document.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    "a[href]"
                );


            if (
                !link
                ||
                event.defaultPrevented
                ||
                event.button !== 0
                ||
                event.ctrlKey
                ||
                event.metaKey
                ||
                event.shiftKey
                ||
                event.altKey
                ||
                link.hasAttribute(
                    "download"
                )
                ||
                (
                    link.target
                    &&
                    link.target
                    !== "_self"
                )
            ) {

                return;

            }


            const url =
                new URL(
                    link.href
                );


            if (
                url.origin
                !==
                location.origin
                ||
                new URL(
                    ".",
                    url
                ).pathname
                !==
                directory.pathname
                ||
                !pages[
                    pageName(url)
                ]
                ||
                location.protocol
                ===
                "file:"
            ) {

                return;

            }


            if (
                url.pathname
                ===
                location.pathname
                &&
                url.hash
            ) {

                return;

            }


            event.preventDefault();


            if (
                url.href
                !==
                location.href
            ) {

                navigate(url);

            }

        }
    );


    /* =====================================================
       BROWSER BACK / FORWARD
    ====================================================== */

    window.addEventListener(
        "popstate",
        () => {

            navigate(
                new URL(
                    location.href
                ),
                false
            );

        }
    );


    /* =====================================================
       INITIALIZE
    ====================================================== */

    positionPlayer();


    loadScripts(
        pageName(
            new URL(
                location.href
            )
        )
    )
    .catch(
        console.error
    );

})();