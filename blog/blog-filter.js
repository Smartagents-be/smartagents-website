(function () {
    const filterEl = document.querySelector('.blog-filter');
    if (!filterEl) return;

    const allChip = filterEl.querySelector('[data-filter-all]');
    const chips = Array.from(filterEl.querySelectorAll('[data-filter]'));
    const cards = Array.from(document.querySelectorAll('.blog-card'));
    const active = new Set();

    function applyVisibility() {
        cards.forEach((card) => {
            const cats = (card.dataset.categories || '').split(/\s+/).filter(Boolean);
            const show = active.size === 0 || cats.some((c) => active.has(c));
            if (show) {
                card.removeAttribute('hidden');
            } else {
                card.setAttribute('hidden', '');
            }
        });
    }

    function refreshChipStates() {
        if (active.size === 0) {
            allChip.classList.add('is-active');
            allChip.setAttribute('aria-pressed', 'true');
        } else {
            allChip.classList.remove('is-active');
            allChip.setAttribute('aria-pressed', 'false');
        }
        chips.forEach((chip) => {
            const slug = chip.dataset.filter;
            const isOn = active.has(slug);
            chip.classList.toggle('is-active', isOn);
            chip.setAttribute('aria-pressed', isOn ? 'true' : 'false');
        });
    }

    allChip.addEventListener('click', () => {
        active.clear();
        refreshChipStates();
        applyVisibility();
    });

    chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            const slug = chip.dataset.filter;
            if (active.has(slug)) {
                active.delete(slug);
            } else {
                active.add(slug);
            }
            refreshChipStates();
            applyVisibility();
        });
    });
})();
