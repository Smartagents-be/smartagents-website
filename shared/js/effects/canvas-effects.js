(function() {
    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
        } else {
            callback();
        }
    }

    function initPageHeroCanvas() {
        const hero = document.querySelector('.page-hero');
        if (!hero) return;

        const colorRuntime = window.SmartAgentsColorRuntime;
        if (!colorRuntime) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'page-hero-canvas';
        hero.prepend(canvas);

        const ctx = canvas.getContext('2d');
        let colors = [];

        let width;
        let height;
        let nodes;
        let dpr;
        let animId;
        const connectionDistance = 120;
        let lineOpacity;
        let glowOpacity;
        let nodeOpacity;
        let nodePulseOpacity;

        function resize() {
            dpr = window.devicePixelRatio || 1;
            width = hero.clientWidth;
            height = hero.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            lineOpacity = colorRuntime.readNumberToken('--page-particle-line-opacity', hero, 0.15);
            glowOpacity = colorRuntime.readNumberToken('--page-particle-glow-opacity', hero, 0.04);
            nodeOpacity = colorRuntime.readNumberToken('--page-particle-node-opacity', hero, 0.4);
            nodePulseOpacity = colorRuntime.readNumberToken('--page-particle-node-pulse-opacity', hero, 0.3);
        }

        function refreshThemeValues() {
            colors = colorRuntime.buildParticlePalette(hero);
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
                    color,
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
                    if (dist >= connectionDistance) continue;
                    const alpha = (1 - dist / connectionDistance) * lineOpacity;
                    const color = nodes[i].color;
                    ctx.strokeStyle = colorRuntime.rgbaString(color, alpha);
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }

            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                node.pulse += 0.01;
                const pulseSize = Math.sin(node.pulse) * 0.5 + 0.5;
                const color = node.color;

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + 3 + pulseSize * 2, 0, Math.PI * 2);
                ctx.fillStyle = colorRuntime.rgbaString(color, glowOpacity);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = colorRuntime.rgbaString(color, nodeOpacity + pulseSize * nodePulseOpacity);
                ctx.fill();
            }
        }

        function update() {
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                node.x += node.vx;
                node.y += node.vy;
                if (node.x < 0 || node.x > width) {
                    node.vx *= -1;
                }
                if (node.y < 0 || node.y > height) {
                    node.vy *= -1;
                }
            }
        }

        function animate() {
            update();
            draw();
            animId = requestAnimationFrame(animate);
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (!animId) {
                        animate();
                    }
                } else if (animId) {
                    cancelAnimationFrame(animId);
                    animId = null;
                }
            });
        }, { threshold: 0 });

        function init() {
            resize();
            refreshThemeValues();
            if (!colors.length) return;
            createNodes();
            observer.observe(hero);
        }

        if (document.readyState === 'complete') {
            init();
        } else {
            window.addEventListener('load', init);
        }

        window.addEventListener('resize', () => {
            resize();
            refreshThemeValues();
            if (!colors.length) return;
            createNodes();
        });

        document.addEventListener('sa-theme-change', () => {
            resize();
            refreshThemeValues();
            if (!colors.length) return;
            createNodes();
        });
    }

    function initHeroCanvas() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        const colorRuntime = window.SmartAgentsColorRuntime;
        if (!colorRuntime) return;

        const ctx = canvas.getContext('2d');
        let colors = [];

        let width;
        let height;
        let nodes;
        let dpr;
        let animId;
        const connectionDistance = 150;
        const isMobile = window.innerWidth < 768;
        let lineOpacity;
        let glowOpacity;
        let nodeOpacity;
        let nodePulseOpacity;

        function resize() {
            dpr = window.devicePixelRatio || 1;
            const hero = canvas.parentElement;
            width = hero.clientWidth;
            height = hero.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            lineOpacity = colorRuntime.readNumberToken('--particle-line-opacity', hero, 0.3);
            glowOpacity = colorRuntime.readNumberToken('--particle-glow-opacity', hero, 0.08);
            nodeOpacity = colorRuntime.readNumberToken('--particle-node-opacity', hero, 0.6);
            nodePulseOpacity = colorRuntime.readNumberToken('--particle-node-pulse-opacity', hero, 0.4);
        }

        function refreshThemeValues() {
            colors = colorRuntime.buildParticlePalette(canvas.parentElement);
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
                    color,
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

                    if (dist >= connectionDistance) continue;
                    const alpha = (1 - dist / connectionDistance) * lineOpacity;
                    const color = nodes[i].color;
                    ctx.strokeStyle = colorRuntime.rgbaString(color, alpha);
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }

            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                node.pulse += 0.02;
                const pulseSize = Math.sin(node.pulse) * 0.5 + 0.5;
                const color = node.color;

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + 4 + pulseSize * 3, 0, Math.PI * 2);
                ctx.fillStyle = colorRuntime.rgbaString(color, glowOpacity);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = colorRuntime.rgbaString(color, nodeOpacity + pulseSize * nodePulseOpacity);
                ctx.fill();
            }
        }

        function update() {
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < 0 || node.x > width) {
                    node.vx *= -1;
                }
                if (node.y < 0 || node.y > height) {
                    node.vy *= -1;
                }
            }
        }

        function animate() {
            update();
            draw();
            animId = requestAnimationFrame(animate);
        }

        function init() {
            resize();
            refreshThemeValues();
            if (!colors.length) return;
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
            refreshThemeValues();
            if (!colors.length) return;
            createNodes();
        });

        document.addEventListener('sa-theme-change', () => {
            resize();
            refreshThemeValues();
            if (!colors.length) return;
            createNodes();
        });
    }

    onReady(() => {
        initPageHeroCanvas();
        initHeroCanvas();
    });
})();
