
(function () {
    "use strict";

    // =====================================================
    // DOM ELEMENTS
    // =====================================================

    const works = Array.prototype.slice.call(
        document.querySelectorAll("#works .work")
    );

    const modalEl = document.getElementById("projectModal");

    if (!modalEl || works.length === 0) return;

    const img = document.getElementById("modalImg");
    const title = document.getElementById("modalTitle");
    const category = document.getElementById("modalCategory");
    const desc = document.getElementById("modalDesc");
    const tags = document.getElementById("modalTags");

    const modalImageContainer = img.parentElement;
    const modalBody = modalEl.querySelector(".modal-body");

    const bootstrapModal = (typeof bootstrap !== "undefined")
        ? new bootstrap.Modal(modalEl)
        : null;

    let current = 0;


    // =====================================================
    // MAIN ARTWORK TITLES & DESCRIPTIONS
    //
    // These correspond to the main images defined in HTML.
    // =====================================================

    const mainArtworks = {

        0: {
            title: "Veiled in Shadows",
            description:
                "A dark cinematic illustration exploring atmosphere, dramatic lighting and visual storytelling."
        },

        1: {
            title: "Wonderland — Character Design",
            description:
                "An original character design inspired by whimsical fantasy aesthetics, exploring costume details, colour palettes and personality."
        },

        2: {
            title: "Sunlit Forest",
            description:
                "An atmospheric forest environment exploring natural lighting, depth and the contrast between warm sunlight and cool shadows."
        },

        3: {
            title: "Hatsune Miku — Fan Art",
            description:
                "A work-in-progress illustration exploring dynamic composition, expressive line art and character design."
        },

        4: {
            title: "Princess Mononoke — Portrait Study",
            description:
                "A digital portrait study focusing on expressive facial features, painterly textures and colour."
        },

        5: {
            title: "A Day at Sea — Pokémon Fan Art",
            description:
                "A colourful illustration featuring a playful ocean composition, dynamic shapes and vibrant contrasting colours."
        },

        6: {
            title: "Bunny Witch — Character Turnaround",
            description:
                "A character design sheet exploring the Bunny Witch's silhouette, proportions and costume across multiple views."
        },

        7: {
            title: "Little Croco — The Explorer",
            description:
                "A friendly crocodile explorer designed with rounded shapes, an oversized hat and a backpack."
        },

        8: {
            title: "The Adventurer Crew",
            description:
                "A collection of four whimsical adventurers, each with a unique personality and silhouette. Designed around a shared explorer aesthetic, combining playful proportions, expressive features and a cohesive colour palette."
        },

        9: {
            title: "Character Expressions — First Studies",
            description:
                "A collection of facial studies exploring expressions and personality through variations in the character's features."
        },

        10: {
            title: "Vertical City — Architectural Sketch",
            description:
                "An architectural concept exploring vertical structures, environmental storytelling and detailed pencil line work."
        },

        11: {
            title: "Creature Anatomy — Skull Study",
            description:
                "A traditional pencil study exploring the relationship between skeletal anatomy, organic forms and character design."
        },

        12: {
            title: "The Fool — Cover Art",
            description:
                "The project's visual identity, introducing its mystical atmosphere through a warm, symbolic composition."
        }

    };


    // =====================================================
    // ADDITIONAL ARTWORKS
    //
    // Each key corresponds to the index of an article
    // in portfolio.html.
    //
    // The main image is defined in HTML.
    // Only secondary images are defined here.
    // =====================================================

    const additionalArtworks = {

        // =================================================
        // 01 — ORIGINAL CHARACTER DESIGNS
        // =================================================

        1: [

            {
                src: "images/Portfolio_01.1_OriginalCharacterDesigns.png",
                title: "Jellyfish-Inspired Character",
                description:
                    "An original character concept inspired by marine life, exploring organic shapes, costume design and a soft colour palette."
            }

        ],


        // =================================================
        // 06 — CHARACTER TURNAROUNDS
        // =================================================

        6: [

            {
                src: "images/Portfolio_06.1_Character2_TurnAround-WIP.png",
                title: "Second Character Turnaround — WIP",
                description:
                    "An additional character design exploring proportions, silhouette and consistency across multiple views."
            }

        ],


        // =================================================
        // 07 — LITTLE ANIMAL CHARACTERS
        // =================================================

        7: [

            {
                src: "images/Portfolio_07.1_AnimalSheep.png",
                title: "Little Sheep — The Wanderer",
                description:
                    "A fluffy fantasy companion exploring playful shapes, expressive features and character personality."
            }

        ],

        // =================================================
        // 08 — CREATURE
        // =================================================

        8: [

            {
                 src: "images/Portfolio_08.01_Fish.png",
                title: "The Little Fish Explorer",
                description:
                    "An expressive little fish adventurer, brought to life through a playful pose and exaggerated features. The design combines an oversized explorer's hat, a protective bubble helmet and a cheerful personality, creating a character that feels ready for its next adventure."
            }

        ],


        // =================================================
        // 09 — CHARACTER EXPRESSIONS
        // =================================================

        9: [

            {
                src: "images/Portfolio_09.1_CharacterFaces.png",
                title: "Witch Expressions",
                description:
                    "Additional facial expression studies exploring different emotions and personality through subtle changes in the character's features."
            }

        ],


        // =================================================
        // 10 — ARCHITECTURAL STUDIES
        // =================================================

        10: [

            {
                src: "images/Portfolio_10.1_TarditionalHouses.jpg",
                title: "The Creative Attic — Interior Study",
                description:
                    "An isometric architectural drawing exploring interior spaces, perspective, furniture and environmental storytelling."
            }

        ],


        // =================================================
        // 11 — TRADITIONAL STUDIES
        // =================================================

        11: [

            {
                src: "images/Portfolio_11.2_TarditionalStudies.jpg",
                title: "Creature Anatomy — Clawed Foot",
                description:
                    "A traditional pencil study exploring anatomy, proportions and the structure of a creature's clawed foot."
            },

            {
                src: "images/Portfolio_11.3_TarditionalStudies.jpg",
                title: "Traditional Study — 03",
                description:
                    "An observational pencil study exploring proportions and shading."
            },

            {
                src: "images/Portfolio_11.4_TarditionalStudies.jpg",
                title: "Traditional Study — 04",
                description:
                    "A structural sketch exploring geometry and construction."
            },

            {
                src: "images/Portfolio_11.5_TarditionalStudies.jpg",
                title: "Traditional Study — 05",
                description:
                    "An object study using simple volumes and line work."
            },

            {
                src: "images/Portfolio_11.6_TarditionalStudies.jpg",
                title: "Traditional Study — 06",
                description:
                    "Organic forms and creature sketches."
            },

            {
                src: "images/Portfolio_11.7_TarditionalStudies.jpg",
                title: "Traditional Study — 07",
                description:
                    "A structural study exploring light, shadow and form."
            },

            {
                src: "images/Portfolio_11.8_TarditionalStudies.jpg",
                title: "Traditional Study — 08",
                description:
                    "Shape breakdowns and volume construction exercises."
            },

            {
                src: "images/Portfolio_11.9_TarditionalStudies.jpg",
                title: "Traditional Study — 9",
                description:
                    "Additional object and detail studies."
            }

        ],


        // =================================================
        // 12 — THE FOOL
        // =================================================

        12: [

            {
                src: "images/Portfolio_12.01_TFG.png",
                title: "The Fool — Project Overview",
                description:
                    "An introduction to the project, presenting its initial concept, artistic direction and visual development."
            },

            {
                src: "images/Portfolio_12.02_TFG.png",
                title: "The Fool — Early Character Development",
                description:
                    "Early character explorations focusing on silhouettes, proportions and the visual language of the project."
            },

            {
                src: "images/Portfolio_12.03_TFG.png",
                title: "The Fool — Research & Studies",
                description:
                    "Initial visual research and concept studies used to establish the foundations of the character designs."
            },

            {
                src: "images/Portfolio_12.04_TFG.png",
                title: "The Fool — Character Exploration",
                description:
                    "A collection of exploratory sketches, character variations and colour studies developed during the early design process."
            },

            {
                src: "images/Portfolio_12.05_TFG.png",
                title: "The Fool — Concept Development",
                description:
                    "Further concept sketches and annotated studies exploring character details, forms and design alternatives."
            },

            {
                src: "images/Portfolio_12.06_TFG.png",
                title: "The Fool — Symbol & Visual Identity",
                description:
                    "Exploration of the project's emblem and signature, focusing on creating a recognisable visual identity."
            },

            {
                src: "images/Portfolio_12.07_TFG.png",
                title: "The Fool — Character Design Studies",
                description:
                    "Character development sheets exploring anatomy, costume details, proportions and colour palettes."
            },

            {
                src: "images/Portfolio_12.08_TFG.png",
                title: "The Fool — Character & Creature Concepts",
                description:
                    "Additional concept studies exploring character features, organic forms and visual references."
            },

            {
                src: "images/Portfolio_12.09_TFG.png",
                title: "The Fool — Character Turnaround",
                description:
                    "A full-body character design study featuring front and back views, colour references and costume details."
            },

            {
                src: "images/Portfolio_12.10_TFG.png",
                title: "The Fool — Character Variations",
                description:
                    "Further character explorations, including alternative silhouettes, facial studies and costume development."
            },

            {
                src: "images/Portfolio_12.11_TFG.png",
                title: "The Fool — Background Design",
                description:
                    "A decorative background developed for the project's visual presentation, using warm copper tones and circular ornamental elements."
            }

        ]

    };


    // =====================================================
    // CREATE SECONDARY ARTWORK
    // =====================================================

    function createExtraArtwork(artwork, index) {

        const figure = document.createElement("figure");

        figure.className = "project-extra";


        // Image

        const extraImg = document.createElement("img");

        extraImg.src = artwork.src;
        extraImg.alt = artwork.title;
        extraImg.loading = "lazy";


        // Caption

        const caption = document.createElement("figcaption");

        const heading = document.createElement("h4");

        heading.textContent =
            String(index + 1).padStart(2, "0") +
            " — " +
            artwork.title;


        const description = document.createElement("p");

        description.textContent = artwork.description;


        caption.appendChild(heading);
        caption.appendChild(description);

        figure.appendChild(extraImg);
        figure.appendChild(caption);

        return figure;

    }

    // =====================================================
    // OPEN PROJECT
    // =====================================================

    function openProject(index) {

        current = (index + works.length) % works.length;

        const el = works[current];

        // Get additional images for this project
        const extras = additionalArtworks[current] || [];


        // =================================================
        // MAIN IMAGE AND PROJECT INFORMATION
        // =================================================

        img.src = el.dataset.image;
        img.alt = el.dataset.title;

        title.textContent = el.dataset.title;
        category.textContent = el.dataset.category;
        desc.textContent = el.dataset.description;


        // =================================================
        // TAGS
        // =================================================

        tags.innerHTML = "";

        (el.dataset.tags || "").split(",").forEach(function (tag) {

            if (!tag.trim()) return;

            const chip = document.createElement("span");

            chip.className = "tag";
            chip.textContent = tag.trim();

            tags.appendChild(chip);

        });


        // =================================================
        // REMOVE PREVIOUS CAPTIONS AND SECONDARY IMAGES
        // =================================================

        modalImageContainer
            .querySelectorAll(".project-extra, .main-artwork-caption")
            .forEach(function (element) {

                element.remove();

            });


        // =================================================
        // MAIN IMAGE CAPTION
        //
        // Only show individual descriptions when the
        // project contains more than one artwork.
        // =================================================

        if (extras.length > 0) {

            const mainArtwork = mainArtworks[current];

            if (mainArtwork) {

                const mainCaption = document.createElement("div");

                mainCaption.className = "main-artwork-caption";


                const mainTitle = document.createElement("h4");

                mainTitle.textContent = "01 — " + mainArtwork.title;


                const mainDescription = document.createElement("p");

                mainDescription.textContent = mainArtwork.description;


                mainCaption.appendChild(mainTitle);
                mainCaption.appendChild(mainDescription);

                img.insertAdjacentElement("afterend", mainCaption);

            }

        }


        // =================================================
        // ADD SECONDARY IMAGES
        // =================================================

        extras.forEach(function (artwork, index) {

            const figure = createExtraArtwork(
                artwork,
                index + 1
            );

            modalImageContainer.appendChild(figure);

        });


        // =================================================
        // RESET MODAL SCROLL
        // =================================================

        if (modalBody) {

            modalBody.scrollTop = 0;

        }


        // =================================================
        // SHOW BOOTSTRAP MODAL
        // =================================================

        if (bootstrapModal && !modalEl.classList.contains("show")) {

            bootstrapModal.show();

        }

    }

    // =====================================================
    // CLOSE MODAL
    // =====================================================

    function close() {

        if (bootstrapModal) {

            bootstrapModal.hide();

        }

    }


    // =====================================================
    // GALLERY EVENTS
    // =====================================================

    works.forEach(function (el, index) {

        // Mouse click

        el.addEventListener("click", function () {

            openProject(index);

        });


        // Keyboard accessibility

        el.addEventListener("keydown", function (e) {

            if (e.key === "Enter" || e.key === " ") {

                e.preventDefault();

                openProject(index);

            }

        });

    });


    // =====================================================
    // PREVIOUS PROJECT
    // =====================================================

    document.getElementById("prevProject").addEventListener(
        "click",
        function () {

            openProject(current - 1);

        }
    );


    // =====================================================
    // NEXT PROJECT
    // =====================================================

    document.getElementById("nextProject").addEventListener(
        "click",
        function () {

            openProject(current + 1);

        }
    );


    // =====================================================
    // KEYBOARD NAVIGATION
    // =====================================================

    document.addEventListener("keydown", function (e) {

        if (!modalEl.classList.contains("show")) return;


        // Previous project

        if (e.key === "ArrowLeft") {

            e.preventDefault();

            openProject(current - 1);

        }


        // Next project

        if (e.key === "ArrowRight") {

            e.preventDefault();

            openProject(current + 1);

        }


        // Close modal

        if (e.key === "Escape") {

            close();

        }

    });

})();
