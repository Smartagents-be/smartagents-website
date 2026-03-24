function initNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        // Tap "Diensten" on mobile to toggle submenu
        const dropdown = navLinks.querySelector('.nav-dropdown');
        if (dropdown) {
            dropdown.querySelector(':scope > a').addEventListener('click', (e) => {
                if (window.innerWidth < 1024) {
                    e.preventDefault();
                    dropdown.classList.toggle('open');
                }
            });
        }

        navLinks.querySelectorAll('a').forEach(link => {
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
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = href.length > 1 ? document.querySelector(href) : null;
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initFullscreenMenu() {
    const btn = document.querySelector('.fullscreen-menu-btn');
    const overlay = document.querySelector('.fullscreen-nav-overlay');
    if (!btn || !overlay) return;

    const label = btn.querySelector('.menu-label');
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
            if (label) label.textContent = result;
            if (progress < 1) scrambleRaf = requestAnimationFrame(step);
        }
        scrambleRaf = requestAnimationFrame(step);
    }

    function openMenu() {
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        btn.classList.add('active');
        document.body.style.overflow = 'hidden';
        scramble(btn.dataset.labelClose || 'CLOSE', 400);
    }

    function closeMenu() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        btn.classList.remove('active');
        document.body.style.overflow = '';
        scramble('MENU', 400);
    }

    btn.addEventListener('click', () => {
        overlay.classList.contains('open') ? closeMenu() : openMenu();
    });

    overlay.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initSmoothScroll();
    initFullscreenMenu();
});

// Animated counter for stats
const animateStat = (stat) => {
    const target = parseInt(stat.dataset.target);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            stat.textContent = Math.ceil(current);
            requestAnimationFrame(updateCounter);
        } else {
            stat.textContent = target;
        }
    };

    updateCounter();
};

const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStat(entry.target);
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.stat-number').forEach(stat => statObserver.observe(stat));

// Form submission handling via FormSubmit.co
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const defaultLabel = btn.dataset.labelDefault || btn.textContent.trim();
        const successLabel = btn.dataset.labelSuccess || 'Message sent!';
        const errorLabel = btn.dataset.labelError || 'Error';
        btn.disabled = true;
        btn.textContent = '...';

        fetch('https://formsubmit.co/ajax/info@smartagents.be', {
            method: 'POST',
            body: new FormData(contactForm),
            headers: { 'Accept': 'application/json' }
        }).then(response => {
            if (response.ok) {
                btn.textContent = successLabel;
                btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                contactForm.reset();
            } else {
                btn.textContent = errorLabel;
                btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            }
            btn.disabled = false;
            setTimeout(() => {
                btn.textContent = defaultLabel;
                btn.style.background = '';
            }, 3000);
        }).catch(() => {
            btn.textContent = errorLabel;
            btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            btn.disabled = false;
            setTimeout(() => {
                btn.textContent = defaultLabel;
                btn.style.background = '';
            }, 3000);
        });
    });
}

// Scroll reveal animations — varied per element type
(function() {
    // Type A: standard translateY + fade (general cards, list items)
    const slideUpEls = document.querySelectorAll('.vm-panel, .about-features li, .aanpak-item');
    slideUpEls.forEach(el => {
        el.classList.add('reveal-slide-up');
    });

    // Type B: scale + fade (feature items, benefit cards, stat items)
    const scaleEls = document.querySelectorAll('.page-role-item, .page-benefit-card, .stat-item');
    scaleEls.forEach(el => {
        el.classList.add('reveal-scale');
    });

    // Type C: stagger within parent for service list items on homepage
    const serviceItems = document.querySelectorAll('.services-list-item');
    serviceItems.forEach((el, i) => {
        el.classList.add('reveal-slide-up');
        el.style.animationDelay = (i * 60) + 'ms';
    });

    // Stagger page-role-items and benefit cards
    document.querySelectorAll('.page-role-item').forEach((el, i) => {
        el.style.animationDelay = (i * 80) + 'ms';
    });
    document.querySelectorAll('.page-benefit-card').forEach((el, i) => {
        el.style.animationDelay = (i * 80) + 'ms';
    });

    // Observe all reveal elements
    const allReveal = document.querySelectorAll('.reveal-slide-up, .reveal-scale');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    allReveal.forEach(el => revealObserver.observe(el));
})();

// Light Neural Network Canvas for service/jobs page heroes
(function() {
    const hero = document.querySelector('.page-hero');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'page-hero-canvas';
    hero.prepend(canvas);

    const ctx = canvas.getContext('2d');
    const colors = [
        { r: 99, g: 102, b: 241 },
        { r: 14, g: 165, b: 233 },
        { r: 139, g: 92, b: 246 }
    ];

    let width, height, nodes, dpr;
    const CONNECTION_DIST = 120;

    function resize() {
        dpr = window.devicePixelRatio || 1;
        width = hero.clientWidth;
        height = hero.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createNodes() {
        const isMobile = window.innerWidth < 768;
        const count = isMobile ? 12 : 25;
        nodes = [];
        for (let i = 0; i < count; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                radius: Math.random() * 1.5 + 1,
                color: color,
                pulse: Math.random() * Math.PI * 2
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
                    const c = nodes[i].color;
                    ctx.strokeStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            n.pulse += 0.01;
            const pulseSize = Math.sin(n.pulse) * 0.5 + 0.5;
            const c = n.color;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius + 3 + pulseSize * 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.04)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (0.4 + pulseSize * 0.3) + ')';
            ctx.fill();
        }
    }

    function update() {
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;
        }
    }

    let animId;
    function animate() {
        update();
        draw();
        animId = requestAnimationFrame(animate);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!animId) animate();
            } else {
                cancelAnimationFrame(animId);
                animId = null;
            }
        });
    }, { threshold: 0 });

    function init() {
        resize();
        createNodes();
        observer.observe(hero);
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    window.addEventListener('resize', () => { resize(); createNodes(); });
})();

// Hero Neural Network Canvas Animation
(function() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const colors = [
        { r: 99, g: 102, b: 241 },   // indigo (#6366f1)
        { r: 14, g: 165, b: 233 },    // sky blue (#0ea5e9)
        { r: 139, g: 92, b: 246 }     // purple (#8b5cf6)
    ];

    let width, height, nodes, dpr;
    const CONNECTION_DIST = 150;
    const isMobile = window.innerWidth < 768;

    function resize() {
        dpr = window.devicePixelRatio || 1;
        var hero = canvas.parentElement;
        width = hero.clientWidth;
        height = hero.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createNodes() {
        const count = isMobile ? 40 : 80;
        nodes = [];
        for (let i = 0; i < count; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 1.5,
                color: color,
                pulse: Math.random() * Math.PI * 2
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DIST) {
                    const alpha = (1 - dist / CONNECTION_DIST) * 0.3;
                    const c = nodes[i].color;
                    ctx.strokeStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            n.pulse += 0.02;
            const pulseSize = Math.sin(n.pulse) * 0.5 + 0.5;
            const c = n.color;

            // Glow
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius + 4 + pulseSize * 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.08)';
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (0.6 + pulseSize * 0.4) + ')';
            ctx.fill();
        }
    }

    function update() {
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            n.x += n.vx;
            n.y += n.vy;

            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;
        }
    }

    let animId;
    function animate() {
        update();
        draw();
        animId = requestAnimationFrame(animate);
    }

    function init() {
        resize();
        createNodes();
        animate();
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animId);
                animId = null;
            } else if (!animId) {
                animate();
            }
        });
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    window.addEventListener('resize', () => {
        resize();
        createNodes();
    });
})();

// Services split interactivity
(function() {
    const split = document.querySelector('.services-split');
    if (!split) return;

    const listItems = split.querySelectorAll('.services-list-item');
    const panels = split.querySelectorAll('.services-panel-content');
    const mobilePanels = document.querySelectorAll('.services-mobile-content');
    const desktopBreakpoint = window.matchMedia('(min-width: 768px)');

    function activate(serviceKey) {
        listItems.forEach(item => {
            const isActive = item.dataset.service === serviceKey;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        panels.forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === serviceKey);
        });
        mobilePanels.forEach(panel => {
            panel.classList.toggle('active', panel.dataset.mobilePanel === serviceKey);
        });
    }

    listItems.forEach(item => {
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
