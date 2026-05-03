(function() {
    const stats = document.querySelectorAll('.stat-number');
    if (!stats.length) return;

    function animateStat(stat) {
        const target = parseInt(stat.dataset.target, 10);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        function updateCounter() {
            current += increment;
            if (current < target) {
                stat.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = target;
            }
        }

        updateCounter();
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateStat(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.3 });

    stats.forEach((stat) => observer.observe(stat));
})();
