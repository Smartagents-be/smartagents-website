(function() {
    const carousel = document.getElementById('jobsCarousel');
    if (!carousel) return;

    const track = carousel.querySelector('.jc-track');
    const slides = carousel.querySelectorAll('.jc-slide');
    const dots = carousel.querySelectorAll('.jc-dot');
    const prev = carousel.querySelector('.jc-prev');
    const next = carousel.querySelector('.jc-next');
    let current = 0;

    function goTo(index) {
        slides[current].classList.remove('jc-slide--active');
        dots[current].classList.remove('jc-dot--active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('jc-slide--active');
        dots[current].classList.add('jc-dot--active');
    }

    prev.addEventListener('click', () => goTo(current - 1));
    next.addEventListener('click', () => goTo(current + 1));
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goTo(index));
    });

    let startX = 0;
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) {
            goTo(dx < 0 ? current + 1 : current - 1);
        }
    }, { passive: true });
})();
