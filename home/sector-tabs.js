(function() {
    const section = document.querySelector('.sectors');
    if (!section) return;

    const tabs = section.querySelectorAll('.sector-tab');
    const panels = section.querySelectorAll('.sector-panel');
    if (!tabs.length || !panels.length) return;

    function activate(sectorKey) {
        tabs.forEach((tab) => {
            const isActive = tab.dataset.sector === sectorKey;
            tab.classList.toggle('is-active', isActive);
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        panels.forEach((panel) => {
            const isActive = panel.dataset.sector === sectorKey;
            panel.classList.toggle('is-active', isActive);
            panel.hidden = !isActive;
        });
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activate(tab.dataset.sector));
        tab.addEventListener('keydown', (event) => {
            if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
            event.preventDefault();
            const dir = event.key === 'ArrowRight' ? 1 : -1;
            const next = tabs[(index + dir + tabs.length) % tabs.length];
            next.focus();
            activate(next.dataset.sector);
        });
    });
})();
