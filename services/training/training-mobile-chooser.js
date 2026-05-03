(function() {
    const buttons = document.querySelectorAll('.tmc-picker-btn');
    if (!buttons.length) return;

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const path = button.dataset.tmc;
            buttons.forEach((item) => item.classList.remove('tmc-active'));
            document.querySelectorAll('.tmc-panel').forEach((panel) => panel.classList.remove('tmc-active'));
            button.classList.add('tmc-active');
            const panel = document.querySelector('.tmc-panel--' + path);
            if (panel) {
                panel.classList.add('tmc-active');
            }
        });
    });
})();
