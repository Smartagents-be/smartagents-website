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

            if (currentScroll > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
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

document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initSmoothScroll();
});

// Animated counter for stats
const stats = document.querySelectorAll('.stat-number');
let statsAnimated = false;

const animateStats = () => {
    stats.forEach(stat => {
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
    });
};

// Intersection Observer for stats animation
const statsSection = document.querySelector('.stats');

if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                animateStats();
                statsAnimated = true;
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(statsSection);
}

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

// Add scroll reveal animation
const revealElements = document.querySelectorAll('.vm-panel, .service-card, .aanpak-step, .stat-item, .about-features li, .jobs-role-item, .jobs-benefit-card');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    revealObserver.observe(el);
});

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

    // Only animate when hero is visible
    const heroObserver = new IntersectionObserver((entries) => {
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
        heroObserver.observe(canvas.closest('.hero'));
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
