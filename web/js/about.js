(() => {
    "use strict";
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } });
    }, { threshold: .1 });
    document.querySelectorAll(".skill-group").forEach(group => observer.observe(group));
    window.pageCleanup = () => observer.disconnect();
})();
