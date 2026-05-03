(function() {
    const slideUpEls = document.querySelectorAll('.vm-panel, .about-features li, .aanpak-item');
    slideUpEls.forEach((el) => {
        el.classList.add('reveal-slide-up');
    });

    const scaleEls = document.querySelectorAll('.page-role-item, .page-benefit-card, .stat-item');
    scaleEls.forEach((el) => {
        el.classList.add('reveal-scale');
    });

    const serviceItems = document.querySelectorAll('.services-list-item');
    serviceItems.forEach((el, index) => {
        el.classList.add('reveal-slide-up');
        el.style.animationDelay = (index * 60) + 'ms';
    });

    document.querySelectorAll('.page-role-item').forEach((el, index) => {
        el.style.animationDelay = (index * 80) + 'ms';
    });

    document.querySelectorAll('.page-benefit-card').forEach((el, index) => {
        el.style.animationDelay = (index * 80) + 'ms';
    });

    const revealElements = document.querySelectorAll('.reveal-slide-up, .reveal-scale');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach((el) => observer.observe(el));
})();
