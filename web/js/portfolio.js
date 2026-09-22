(function () {
    "use strict";

    const works = Array.prototype.slice.call(document.querySelectorAll("#works .work"));
    const modalEl = document.getElementById("projectModal");
    if (!modalEl || works.length === 0) return;

    const img = document.getElementById("modalImg");
    const title = document.getElementById("modalTitle");
    const category = document.getElementById("modalCategory");
    const desc = document.getElementById("modalDesc");
    const tags = document.getElementById("modalTags");
    const count = document.getElementById("modalCount");

    const bootstrapModal = (typeof bootstrap !== "undefined") ? new bootstrap.Modal(modalEl) : null;
    let current = 0;

    function openProject(index) {
        current = (index + works.length) % works.length;
        const el = works[current];

        img.src = el.dataset.image;
        img.alt = el.dataset.title;
        title.textContent = el.dataset.title;
        category.textContent = el.dataset.category;
        desc.textContent = el.dataset.description;
        count.textContent = `${current + 1} / ${works.length}`;

        tags.innerHTML = "";
        (el.dataset.tags || "").split(",").forEach(function (tag) {
            const chip = document.createElement("span");
            chip.className = "tag";
            chip.textContent = tag.trim();
            tags.appendChild(chip);
        });

        if (bootstrapModal) bootstrapModal.show();
    }

    function close() {
        if (bootstrapModal) bootstrapModal.hide();
    }

    works.forEach(function (el, index) {
        el.addEventListener("click", function () { openProject(index); });
        el.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openProject(index);
            }
        });
    });

    document.getElementById("prevProject").addEventListener("click", function () {
        openProject(current - 1);
    });

    document.getElementById("nextProject").addEventListener("click", function () {
        openProject(current + 1);
    });

    document.addEventListener("keydown", function (e) {
        if (!modalEl.classList.contains("show")) return;
        if (e.key === "ArrowLeft") openProject(current - 1);
        if (e.key === "ArrowRight") openProject(current + 1);
        if (e.key === "Escape") close();
    });
})();