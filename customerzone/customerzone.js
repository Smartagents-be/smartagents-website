(function() {
    const colorRuntime = window.SmartAgentsColorRuntime;

    (function initHeroCanvas() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!colorRuntime) return;

        const colors = colorRuntime.buildParticlePalette();
        if (!colors.length) return;

        let width;
        let height;
        let nodes;
        let dpr;
        const connectionDistance = 150;

        function resize() {
            dpr = window.devicePixelRatio || 1;
            const parent = canvas.parentElement;
            width = parent.clientWidth;
            height = parent.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function createNodes() {
            const isMobile = window.innerWidth < 768;
            const count = isMobile ? 30 : 60;
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
                    const alpha = (1 - dist / connectionDistance) * 0.3;
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
                ctx.fillStyle = colorRuntime.rgbaString(color, 0.08);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = colorRuntime.rgbaString(color, 0.6 + pulseSize * 0.4);
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
            requestAnimationFrame(animate);
        }

        function init() {
            resize();
            createNodes();
            animate();
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

    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    if (loginForm && loginError) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loginError.style.display = 'block';
        });
    }
})();
