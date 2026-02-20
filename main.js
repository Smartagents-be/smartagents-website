// Translations
const translations = {
    en: {
        'nav.services': 'Services',
        'nav.about': 'About',
        'nav.team': 'Team',
        'nav.contact': 'Contact',
        'hero.title': 'Transform Your Business with <span class="gradient-text">Intelligent Automation</span>',
        'hero.subtitle': 'We deliver cutting-edge AI solutions, agentic systems, and process optimization to accelerate your digital transformation.',
        'hero.cta.primary': 'Get Started',
        'hero.cta.secondary': 'Learn More',
        'services.title': 'Our Services',
        'services.subtitle': 'Comprehensive solutions to optimize your operations and drive innovation',
        'services.ai.title': 'Artificial Intelligence',
        'services.ai.desc': 'Custom AI models and machine learning solutions tailored to your business needs. From predictive analytics to natural language processing.',
        'services.agentic.title': 'Agentic AI',
        'services.agentic.desc': 'Autonomous AI agents that can reason, plan, and execute complex tasks. Build intelligent systems that work alongside your team.',
        'services.process.title': 'Process Optimization',
        'services.process.desc': 'Streamline workflows and eliminate inefficiencies. We analyze, redesign, and implement processes that maximize productivity.',
        'services.automation.title': 'Automation',
        'services.automation.desc': 'End-to-end automation solutions that reduce manual work and human error. RPA, workflow automation, and intelligent document processing.',
        'services.training.title': 'Training',
        'services.training.desc': 'Comprehensive training programs to upskill your team in AI, automation, and emerging technologies. Hands-on workshops and certification courses.',
        'services.secure.title': 'Secure',
        'services.secure.desc': 'Enterprise-grade security solutions for your AI systems. Data protection, compliance frameworks, and secure deployment of automation workflows.',
        'aanpak.title': 'Our Approach',
        'aanpak.subtitle': 'From idea to results in 5 steps',
        'aanpak.step1.title': 'Analysis & Intake',
        'aanpak.step1.desc': 'We map your processes and bottlenecks. Where can AI make the difference?',
        'aanpak.step2.title': 'Design',
        'aanpak.step2.desc': 'We design your custom AI agent: tasks, workflows, and integrations with your existing systems.',
        'aanpak.step3.title': 'Development',
        'aanpak.step3.desc': 'We build and train your AI agent. You test along and provide feedback throughout the process.',
        'aanpak.step4.title': 'Implementation',
        'aanpak.step4.desc': 'We deploy your AI agent live in your environment. Your team always stays in control.',
        'aanpak.step5.title': 'Optimization & Support',
        'aanpak.step5.desc': 'We monitor, optimize, and support. Your digital colleague gets smarter every day.',
        'stats.agents': 'Running Agents',
        'stats.cost': 'Average Cost Reduction',
        'stats.satisfaction': 'Client Satisfaction',
        'stats.support': 'Support Available',
        'about.title': 'Why Choose SmartAgents?',
        'about.desc': 'We combine deep technical expertise with business acumen to deliver solutions that create real impact. Our team of AI specialists, automation engineers, and process consultants work together to transform your operations.',
        'about.feature1': 'Industry-leading expertise in AI and automation',
        'about.feature2': 'Proven track record across multiple industries',
        'about.feature3': 'End-to-end implementation and support',
        'about.feature4': 'Scalable solutions that grow with your business',
        'team.title': 'Meet Our Team',
        'team.subtitle': 'The experts behind SmartAgents, dedicated to transforming your business',
        'team.axel.role': 'Founder',
        'team.axel.bio': 'Entrepreneur with 20+ years experience in digital transformation. Passionate about helping businesses leverage intelligent automation.',
        'team.tomv.role': 'Founder',
        'team.tomv.bio': 'Technical architect specializing in agentic AI systems and enterprise automation. Builds scalable solutions that drive real results.',
        'team.agents.name': 'Our Agents',
        'team.agents.role': 'Human + AI Collaboration',
        'team.agents.bio': 'Our smart human and AI agents creating value-driven results.',
        'testimonials.title': 'What Our Clients Say',
        'testimonials.subtitle': 'Trusted by innovative companies across industries',
        'testimonials.1.text': '"SmartAgents transformed our customer service with their AI solution. Response times dropped by 60% while satisfaction scores increased dramatically."',
        'testimonials.1.name': 'Koen Vanderstraeten',
        'testimonials.1.role': 'CTO, DigiWave Belgium',
        'testimonials.2.text': '"The process automation they implemented saved us hundreds of hours monthly. Their team truly understands business needs and delivers results."',
        'testimonials.2.name': 'Sophie Janssens',
        'testimonials.2.role': 'Operations Director, FlowTech',
        'testimonials.3.text': '"Working with SmartAgents was a game-changer. Their agentic AI system handles complex tasks that we thought only humans could do."',
        'testimonials.3.name': 'Bart Mertens',
        'testimonials.3.role': 'CEO, NextLevel NV',
        'contact.title': "Let's Talk",
        'contact.subtitle': 'Ready to optimize your business? Get in touch with our team.',
        'contact.form.name': 'Name',
        'contact.form.email': 'Email',
        'contact.form.company': 'Company',
        'contact.form.message': 'How can we help?',
        'contact.form.submit': 'Send Message',
        'contact.form.success': 'Message Sent!',
        'footer.tagline': 'Digital colleagues that never sleep.',
        'footer.quicklinks': 'Quick Links',
        'footer.office': 'Office',
        'footer.copyright': '© 2026 SmartAgents. All rights reserved.'
    },
    nl: {
        'nav.services': 'Diensten',
        'nav.about': 'Over Ons',
        'nav.team': 'Team',
        'nav.contact': 'Contact',
        'hero.title': 'Transformeer Uw Bedrijf met <span class="gradient-text">Intelligente Automatisering</span>',
        'hero.subtitle': 'Wij leveren geavanceerde AI-oplossingen, en procesoptimalisatie om uw kosten te drukken en digitale transformatie te versnellen.',
        'hero.cta.primary': 'Aan de Slag',
        'hero.cta.secondary': 'Meer Info',
        'services.title': 'Onze Diensten',
        'services.subtitle': 'Onze oplossingen om uw operaties te optimaliseren en uw kosten te drukken',
        'services.ai.title': 'Kunstmatige Intelligentie',
        'services.ai.desc': 'Op maat gemaakte AI-modellen en machine learning oplossingen afgestemd op uw bedrijfsbehoeften. Van voorspellende analyses tot natuurlijke taalverwerking.',
        'services.agentic.title': 'Agentic AI',
        'services.agentic.desc': 'Autonome AI-agents die kunnen redeneren, plannen en complexe taken uitvoeren. Wij bouwen intelligente systemen die samenwerken met uw team. Uw team behoudt de volledige controle.',
        'services.process.title': 'Procesoptimalisatie',
        'services.process.desc': 'Stroomlijn workflows en elimineer inefficiënties. Wij analyseren, herontwerpen en implementeren processen die de productiviteit maximaliseren.',
        'services.automation.title': 'Automatisering',
        'services.automation.desc': 'End-to-end automatiseringsoplossingen die handmatig werk en menselijke fouten verminderen. RPA, workflow automatisering en intelligente documentverwerking.',
        'services.training.title': 'Training',
        'services.training.desc': 'Uitgebreide trainingsprogramma\'s om uw team bij te scholen in AI, automatisering en opkomende technologieën. Praktische workshops bij u op locatie.',
        'services.secure.title': 'Beveiliging',
        'services.secure.desc': 'Beveiligingsoplossingen voor uw AI-systemen. Gegevensbescherming, compliance frameworks en veilige implementatie van automatiseringsworkflows.',
        'aanpak.title': 'Ons Plan van Aanpak',
        'aanpak.subtitle': 'Van idee tot resultaat in 5 stappen',
        'aanpak.step1.title': 'Analyse & Intake',
        'aanpak.step1.desc': 'We brengen uw processen en knelpunten in kaart. Waar kan AI het verschil maken?',
        'aanpak.step2.title': 'Ontwerp',
        'aanpak.step2.desc': 'We ontwerpen uw custom AI agent op maat: taken, workflows en integraties met uw bestaande systemen.',
        'aanpak.step3.title': 'Ontwikkeling',
        'aanpak.step3.desc': 'We bouwen en trainen uw AI agent. U test mee en geeft feedback tijdens het hele proces.',
        'aanpak.step4.title': 'Implementatie',
        'aanpak.step4.desc': 'We zetten uw AI agent live in uw omgeving. Uw team behoudt altijd de controle.',
        'aanpak.step5.title': 'Optimalisatie & Support',
        'aanpak.step5.desc': 'We monitoren, optimaliseren en ondersteunen. Uw digitale collega wordt elke dag slimmer.',
        'stats.agents': 'Actieve Agents',
        'stats.cost': 'Gemiddelde Kostenbesparing',
        'stats.satisfaction': 'Klanttevredenheid',
        'stats.support': 'Ondersteuning Beschikbaar',
        'about.title': 'Waarom Kiezen voor SmartAgents?',
        'about.desc': 'Wij combineren diepgaande technische expertise met zakelijk inzicht om oplossingen te leveren die echte impact creëren. Ons team van AI-specialisten, automatiseringsingenieurs en procesconsultants werkt samen om uw operaties te transformeren.',
        'about.feature1': 'Toonaangevende expertise in AI en automatisering',
        'about.feature2': 'Bewezen track record in meerdere sectoren',
        'about.feature3': 'End-to-end implementatie en ondersteuning',
        'about.feature4': 'Schaalbare oplossingen die meegroeien met uw bedrijf',
        'team.title': 'Ontmoet Ons Team',
        'team.subtitle': 'De experts achter SmartAgents, toegewijd aan het transformeren van uw bedrijf',
        'team.axel.role': 'Oprichter',
        'team.axel.bio': 'Ondernemer met 20+ jaar ervaring in digitale transformatie. Gepassioneerd in het helpen van bedrijven met intelligente automatisering.',
        'team.tomv.role': 'Oprichter',
        'team.tomv.bio': 'Technisch architect gespecialiseerd in Agentic AI-systemen en enterprise automatisering. Bouwt schaalbare oplossingen die echte resultaten opleveren.',
        'team.agents.name': 'Onze Agents',
        'team.agents.role': 'Onze medewerkers',
        'team.agents.bio': 'Mensen en AI, zij aan zij, voor meetbare impact.',
        'testimonials.title': 'Wat Onze Klanten Zeggen',
        'testimonials.subtitle': 'Vertrouwd door innovatieve bedrijven in verschillende sectoren',
        'testimonials.1.text': '"SmartAgents heeft onze klantenservice getransformeerd met hun AI-oplossing. Responstijden daalden met 60% terwijl de tevredenheidsscores drastisch stegen."',
        'testimonials.1.name': 'Koen Vanderstraeten',
        'testimonials.1.role': 'CTO, DigiWave Belgium',
        'testimonials.2.text': '"De procesautomatisering die zij implementeerden bespaarde ons honderden uren per maand. Hun team begrijpt echt de bedrijfsbehoeften en levert resultaten."',
        'testimonials.2.name': 'Sophie Janssens',
        'testimonials.2.role': 'Operations Director, FlowTech',
        'testimonials.3.text': '"Samenwerken met SmartAgents was een gamechanger. Hun agentisch AI-systeem verwerkt complexe taken waarvan we dachten dat alleen mensen ze konden doen."',
        'testimonials.3.name': 'Bart Mertens',
        'testimonials.3.role': 'CEO, NextLevel NV',
        'contact.title': 'Contacteer ons voor een vrijblijvende afspraak',
        'contact.subtitle': 'Samen processen in kaart brengen, samen tot kostenbesparende oplossingen komen, u behoudt de controle.',
        'contact.form.name': 'Naam',
        'contact.form.email': 'E-mail',
        'contact.form.company': 'Bedrijf',
        'contact.form.message': 'Hoe kunnen we helpen?',
        'contact.form.submit': 'Verstuur Bericht',
        'contact.form.success': 'Bericht Verzonden!',
        'footer.tagline': 'Digitale collega\'s die nooit slapen.',
        'footer.quicklinks': 'Snelle Links',
        'footer.office': 'Kantoor',
        'footer.copyright': '© 2026 SmartAgents. Alle rechten voorbehouden.'
    }
};

// Current language
let currentLang = localStorage.getItem('lang') || 'nl';

// Set language
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
});

// Language switcher event listeners
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
    });
});

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        navbar.style.padding = '12px 0';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.8)';
        navbar.style.padding = '20px 0';
    }

    lastScroll = currentScroll;
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

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
            animateStats();
            statsAnimated = true;
        }
    });
}, { threshold: 0.5 });

statsObserver.observe(statsSection);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission handling via FormSubmit.co
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = '...';

    fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
    }).then(response => {
        if (response.ok) {
            btn.textContent = translations[currentLang]['contact.form.success'];
            btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            contactForm.reset();
        } else {
            btn.textContent = 'Error - probeer opnieuw';
            btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        }
        btn.disabled = false;
        setTimeout(() => {
            btn.textContent = translations[currentLang]['contact.form.submit'];
            btn.style.background = '';
        }, 3000);
    }).catch(() => {
        btn.textContent = 'Error - probeer opnieuw';
        btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        btn.disabled = false;
        setTimeout(() => {
            btn.textContent = translations[currentLang]['contact.form.submit'];
            btn.style.background = '';
        }, 3000);
    });
});

// Add scroll reveal animation
const revealElements = document.querySelectorAll('.service-card, .aanpak-step, .stat-item, .about-features li');

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
