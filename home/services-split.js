(function() {
    const split = document.querySelector('.services-split');
    if (!split) return;

    const listItems = split.querySelectorAll('.services-list-item');
    const panels = split.querySelectorAll('.services-panel-content');
    const mobilePanels = document.querySelectorAll('.services-mobile-content');
    const desktopBreakpoint = window.matchMedia('(min-width: 768px)');

    function activate(serviceKey) {
        listItems.forEach((item) => {
            const isActive = item.dataset.service === serviceKey;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        panels.forEach((panel) => {
            panel.classList.toggle('active', panel.dataset.panel === serviceKey);
        });

        mobilePanels.forEach((panel) => {
            panel.classList.toggle('active', panel.dataset.mobilePanel === serviceKey);
        });
    }

    listItems.forEach((item) => {
        item.addEventListener('mouseenter', () => activate(item.dataset.service));
        item.addEventListener('focus', () => activate(item.dataset.service));
        item.addEventListener('click', () => {
            activate(item.dataset.service);

            if (desktopBreakpoint.matches && item.dataset.href) {
                window.location.href = item.dataset.href;
            }
        });
    });
})();
