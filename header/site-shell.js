(function() {
    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
        } else {
            callback();
        }
    }

    function initNavigation() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');

        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });

            const dropdown = navLinks.querySelector('.nav-dropdown');
            if (dropdown) {
                dropdown.querySelector(':scope > a').addEventListener('click', (e) => {
                    if (window.innerWidth < 1024) {
                        e.preventDefault();
                        dropdown.classList.toggle('open');
                    }
                });
            }

            navLinks.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                });
            });
        }

        const navbar = document.querySelector('.navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;

                if (currentScroll > 80) {
                    navbar.classList.add('scrolled', 'nav-visible');
                } else {
                    navbar.classList.remove('scrolled', 'nav-visible');
                }
            });
        }

        const dropdowns = Array.from(document.querySelectorAll('.navbar-dropdown[data-nav]'));
        const viewport = document.querySelector('.nav-viewport');
        const panels = Array.from(document.querySelectorAll('.nav-panel[data-panel]'));
        let activeIndex = -1;
        let closeTimer = null;

        function positionViewport() {
            if (!viewport || !dropdowns.length) return;
            const nav = document.querySelector('.navbar');
            const navBounds = nav.getBoundingClientRect();
            const first = dropdowns[0].getBoundingClientRect();
            const last = dropdowns[dropdowns.length - 1].getBoundingClientRect();
            viewport.style.left = (first.left - navBounds.left) + 'px';
            viewport.style.width = (last.right - first.left + 50) + 'px';
        }

        positionViewport();
        window.addEventListener('resize', positionViewport);

        function openPanel(index) {
            if (closeTimer !== null) {
                clearTimeout(closeTimer);
                closeTimer = null;
            }
            if (!viewport) return;

            const isSwitch = activeIndex !== -1 && activeIndex !== index;
            const direction = isSwitch ? (index > activeIndex ? 'right' : 'left') : null;

            if (isSwitch) {
                panels[activeIndex]?.classList.remove('is-active', 'from-left', 'from-right');
                dropdowns[activeIndex]?.classList.remove('is-active');
            }

            positionViewport();
            viewport.classList.remove('is-closing');
            if (!isSwitch) {
                viewport.classList.add('is-open');
            }

            const panel = panels[index];
            if (panel) {
                panel.classList.remove('from-left', 'from-right');
                if (direction) {
                    panel.classList.add(`from-${direction}`);
                }
                panel.classList.add('is-active');
            }

            dropdowns[index].classList.add('is-active');
            activeIndex = index;
        }

        function closeAll() {
            if (activeIndex === -1) return;
            panels.forEach((panel) => panel.classList.remove('is-active', 'from-left', 'from-right'));
            dropdowns.forEach((dropdown) => dropdown.classList.remove('is-active'));
            viewport?.classList.remove('is-open');
            viewport?.classList.add('is-closing');
            closeTimer = setTimeout(() => {
                viewport?.classList.remove('is-closing');
                activeIndex = -1;
                closeTimer = null;
            }, 200);
        }

        dropdowns.forEach((dropdown, index) => {
            dropdown.addEventListener('mouseenter', () => openPanel(index));
            dropdown.addEventListener('mouseleave', (e) => {
                if (viewport?.contains(e.relatedTarget)) return;
                if (dropdowns.some((item) => item !== dropdown && item.contains(e.relatedTarget))) return;
                closeAll();
            });
        });

        viewport?.addEventListener('mouseleave', (e) => {
            if (dropdowns.some((dropdown) => dropdown.contains(e.relatedTarget))) return;
            closeAll();
        });
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const target = href.length > 1 ? document.querySelector(href) : null;
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        });
    }

    function initFullscreenMenu() {
        const button = document.querySelector('.fullscreen-menu-btn');
        const overlay = document.querySelector('.fullscreen-nav-overlay');
        if (!button || !overlay) return;

        const label = button.querySelector('.menu-label');
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*';
        let scrambleRaf = null;

        function scramble(target, duration) {
            cancelAnimationFrame(scrambleRaf);
            const start = performance.now();

            function step(now) {
                const progress = Math.min((now - start) / duration, 1);
                const settled = Math.floor(progress * target.length);
                let result = '';
                for (let i = 0; i < target.length; i++) {
                    result += i < settled ? target[i] : chars[Math.floor(Math.random() * chars.length)];
                }
                if (label) {
                    label.textContent = result;
                }
                if (progress < 1) {
                    scrambleRaf = requestAnimationFrame(step);
                }
            }

            scrambleRaf = requestAnimationFrame(step);
        }

        function openMenu() {
            overlay.classList.add('open');
            overlay.setAttribute('aria-hidden', 'false');
            button.classList.add('active');
            document.body.style.overflow = 'hidden';
            scramble(button.dataset.labelClose || 'CLOSE', 400);
        }

        function closeMenu() {
            overlay.classList.remove('open');
            overlay.setAttribute('aria-hidden', 'true');
            button.classList.remove('active');
            document.body.style.overflow = '';
            scramble('MENU', 400);
        }

        button.addEventListener('click', () => {
            if (overlay.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        overlay.querySelectorAll('nav a').forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMenu();
            }
        });
    }

    onReady(() => {
        initNavigation();
        initSmoothScroll();
        initFullscreenMenu();
    });
})();
