// Translations
const translations = {
    en: {
        'nav.services': 'Services',
        'nav.about': 'About',
        'nav.team': 'Team',
        'nav.contact': 'Contact',
        'hero.title': 'Transform your business with <span class="gradient-text">intelligent automation</span>',
        'hero.subtitle': 'We deliver cutting-edge AI solutions, agentic systems, and process optimization to accelerate your digital transformation.',
        'hero.cta.primary': 'Get started',
        'hero.cta.secondary': 'Learn more',
        'vision.title': 'Vision',
        'vision.headline': 'A world where every business has intelligent digital colleagues',
        'vision.text': 'We envision a future where AI doesn\'t replace people \u2014 it amplifies them. Where every business, regardless of size, has access to intelligent automation that handles the routine, so humans can focus on the extraordinary.',
        'mission.title': 'Mission',
        'mission.headline': 'Making AI practical, accessible, and human-centered',
        'mission.text': 'We build autonomous AI agents and automation solutions that deliver measurable results from day one. No hype, no black boxes \u2014 just intelligent systems that work alongside your team, under your control.',
        'services.title': 'Our services',
        'services.subtitle': 'Comprehensive solutions to optimize your operations and drive innovation',
        'services.ai.title': 'Artificial intelligence',
        'services.ai.desc': 'Custom AI models and machine learning solutions tailored to your business needs. From predictive analytics to natural language processing.',
        'services.agentic.title': 'Agentic AI',
        'services.agentic.desc': 'Autonomous AI agents that can reason, plan, and execute complex tasks. Build intelligent systems that work alongside your team.',
        'services.process.title': 'Process optimization',
        'services.process.desc': 'Streamline workflows and eliminate inefficiencies. We analyze, redesign, and implement processes that maximize productivity.',
        'services.automation.title': 'Automation',
        'services.automation.desc': 'End-to-end automation solutions that reduce manual work and human error. RPA, workflow automation, and intelligent document processing.',
        'services.training.title': 'Training',
        'services.training.desc': 'Comprehensive training programs to upskill your team in AI, automation, and emerging technologies. Hands-on workshops and certification courses.',
        'services.secure.title': 'Secure',
        'services.secure.desc': 'Enterprise-grade security solutions for your AI systems. Data protection, compliance frameworks, and secure deployment of automation workflows.',
        'aanpak.title': 'Our approach',
        'aanpak.subtitle': 'From idea to results in 5 steps',
        'aanpak.step1.title': 'Analysis & intake',
        'aanpak.step1.desc': 'We map your processes and bottlenecks. Where can AI make the difference?',
        'aanpak.step2.title': 'Design',
        'aanpak.step2.desc': 'We design your custom AI agent: tasks, workflows, and integrations with your existing systems.',
        'aanpak.step3.title': 'Development',
        'aanpak.step3.desc': 'We build and train your AI agent. You test along and provide feedback throughout the process.',
        'aanpak.step4.title': 'Implementation',
        'aanpak.step4.desc': 'We deploy your AI agent live in your environment. Your team always stays in control.',
        'aanpak.step5.title': 'Optimization & support',
        'aanpak.step5.desc': 'We monitor, optimize, and support. Your digital colleague gets smarter every day.',
        'stats.agents': 'Running agents',
        'stats.cost': 'Average cost reduction',
        'stats.satisfaction': 'Client satisfaction',
        'stats.support': 'Support available',
        'about.title': 'Why choose SmartAgents?',
        'about.desc': 'We combine deep technical expertise with business acumen to deliver solutions that create real impact. Our team of AI specialists, automation engineers, and process consultants work together to transform your operations.',
        'about.feature1': 'Industry-leading expertise in AI and automation',
        'about.feature2': 'Proven track record across multiple industries',
        'about.feature3': 'End-to-end implementation and support',
        'about.feature4': 'Scalable solutions that grow with your business',
        'team.title': 'Meet our team',
        'team.subtitle': 'The experts behind SmartAgents, dedicated to transforming your business',
        'team.axel.role': 'Founder',
        'team.axel.bio': 'Entrepreneur with 20+ years experience in digital transformation. Passionate about helping businesses leverage intelligent automation.',
        'team.tomv.role': 'Founder',
        'team.tomv.bio': 'Technical architect specializing in agentic AI systems and enterprise automation. Builds scalable solutions that drive real results.',
        'team.agents.name': 'Our agents',
        'team.agents.role': 'Human + AI collaboration',
        'team.agents.bio': 'Our smart human and AI agents creating value-driven results.',
        'testimonials.title': 'What our clients say',
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
        'contact.title': "Let's talk",
        'contact.subtitle': 'Ready to optimize your business? Get in touch with our team.',
        'contact.form.name': 'Name',
        'contact.form.email': 'Email',
        'contact.form.company': 'Company',
        'contact.form.message': 'How can we help?',
        'contact.form.submit': 'Send message',
        'contact.form.success': 'Message sent!',
        'footer.tagline': 'Digital colleagues that never sleep.',
        'footer.quicklinks': 'Quick links',
        'footer.office': 'Office',
        'footer.copyright': '© 2026 SmartAgents. All rights reserved.',
        'nav.jobs': 'Jobs',
        'jobs.hero.title': 'Join our <span class="gradient-text">team</span>',
        'jobs.hero.subtitle': 'Help us build the future of autonomous AI agents. We\'re looking for people who want to do the most impactful work of their career.',
        'jobs.vision.title': 'The vision',
        'jobs.vision.text': 'At SmartAgents, we\'re building autonomous AI agents that operate as true digital colleagues \u2014 systems that can reason, plan, and execute complex business tasks 24/7. We\'re not building chatbots. We\'re building intelligent automation that transforms how companies operate, from AI-driven process optimization to fully autonomous agentic workflows.',
        'jobs.role.title': 'Agentic AI developer',
        'jobs.role.subtitle': 'What you\'ll be doing',
        'jobs.role.item1.title': 'Multi-agent systems',
        'jobs.role.item1.desc': 'Design & build multi-agent systems that solve real business problems end-to-end',
        'jobs.role.item2.title': 'LLMs & cutting-edge AI',
        'jobs.role.item2.desc': 'Work with LLMs, tool-use, RAG, and cutting-edge agentic frameworks',
        'jobs.role.item3.title': 'Scalable pipelines',
        'jobs.role.item3.desc': 'Architect scalable agent pipelines integrated into enterprise workflows',
        'jobs.role.item4.title': 'Ship & iterate',
        'jobs.role.item4.desc': 'Ship fast, iterate often \u2014 direct impact on the product from day one',
        'jobs.benefits.title': 'Why join SmartAgents',
        'jobs.benefit1.title': 'Cutting-edge tech',
        'jobs.benefit1.desc': 'Work with the latest in AI, LLMs & agentic systems',
        'jobs.benefit2.title': 'Equity & ownership',
        'jobs.benefit2.desc': 'Share in the upside \u2014 build something that\'s yours too',
        'jobs.benefit3.title': 'Full flexibility',
        'jobs.benefit3.desc': 'Remote-first, async-friendly, results over hours',
        'jobs.benefit4.title': 'Real autonomy',
        'jobs.benefit4.desc': 'Own your domain, make decisions, move fast',
        'jobs.team.title': 'The team',
        'jobs.team.text': '<strong>Axel Segers</strong> brings 20+ years of experience in digital transformation, entrepreneurship and strategy. <strong>Tom Haeldermans</strong> is a technical architect specializing in agentic AI systems and enterprise automation. Together, we\'ve built SmartAgents from the ground up \u2014 and we\'re looking for the right people to grow with us. Small team = big ownership, zero bureaucracy, maximum velocity.',
        'jobs.cta.title': 'Interested? Let\'s talk',
        'jobs.cta.text': 'We\'re not looking for just any developer. We want someone who sees the future of AI and wants to build it with us. If you\'re ready to do the most impactful work of your career, reach out.',
        'jobs.cta.button': 'Or use our contact form',
        'services.back': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg> Back to homepage',
        'services.learnmore': 'Learn more',
        // AI service page
        'services.ai.page.subtitle': 'Custom AI models and machine learning solutions tailored to your business needs.',
        'services.ai.page.overview.title': 'What is AI and why does it matter?',
        'services.ai.page.overview.text': 'Artificial intelligence enables machines to learn from data, recognize patterns, and make decisions. We build custom AI solutions that automate complex tasks, unlock hidden insights, and give your business a competitive edge \u2014 from predictive analytics to natural language processing and computer vision.',
        'services.ai.page.features.title': 'What we deliver',
        'services.ai.page.feature1.title': 'Predictive analytics',
        'services.ai.page.feature1.desc': 'Forecast trends, demand, and risks with models trained on your own data for smarter decision-making.',
        'services.ai.page.feature2.title': 'Natural language processing',
        'services.ai.page.feature2.desc': 'Extract meaning from text, automate customer interactions, and analyze unstructured data at scale.',
        'services.ai.page.feature3.title': 'Computer vision',
        'services.ai.page.feature3.desc': 'Automate visual inspection, document processing, and image classification with deep learning models.',
        'services.ai.page.benefits.title': 'Benefits for your business',
        'services.ai.page.benefit1.title': 'Data-driven decisions',
        'services.ai.page.benefit1.desc': 'Replace gut feeling with actionable insights from your data.',
        'services.ai.page.benefit2.title': 'Time savings',
        'services.ai.page.benefit2.desc': 'Automate repetitive analysis tasks and free your team for strategic work.',
        'services.ai.page.benefit3.title': 'Scalable intelligence',
        'services.ai.page.benefit3.desc': 'Models that grow with your business and improve over time.',
        'services.ai.page.cta.title': 'Ready to put AI to work?',
        'services.ai.page.cta.text': 'Let\'s explore how artificial intelligence can transform your business processes and unlock new opportunities.',
        'services.ai.page.cta.button': 'Get in touch',
        // Agentic AI service page
        'services.agentic.page.subtitle': 'Autonomous AI agents that reason, plan, and execute complex tasks alongside your team.',
        'services.agentic.page.overview.title': 'What is agentic AI?',
        'services.agentic.page.overview.text': 'Agentic AI goes beyond traditional automation. These are intelligent systems that can independently reason about problems, plan multi-step solutions, use tools, and execute complex workflows \u2014 all while your team stays in control. Think of them as digital colleagues that handle end-to-end tasks 24/7, from customer onboarding to supply chain decisions.',
        'services.agentic.page.features.title': 'What we deliver',
        'services.agentic.page.feature1.title': 'Multi-agent systems',
        'services.agentic.page.feature1.desc': 'Teams of specialized AI agents that collaborate to solve complex business problems end-to-end.',
        'services.agentic.page.feature2.title': 'Tool-use & integrations',
        'services.agentic.page.feature2.desc': 'Agents that connect to your existing systems, APIs, and databases to take real actions.',
        'services.agentic.page.feature3.title': 'Autonomous reasoning',
        'services.agentic.page.feature3.desc': 'Agents that reason about problems, break them into steps, and adapt their approach based on results.',
        'services.agentic.page.feature4.title': 'Human-in-the-loop',
        'services.agentic.page.feature4.desc': 'Your team stays in control with approval workflows and oversight for critical decisions.',
        'services.agentic.page.benefits.title': 'Benefits for your business',
        'services.agentic.page.benefit1.title': '24/7 operations',
        'services.agentic.page.benefit1.desc': 'AI agents that work around the clock without breaks or downtime.',
        'services.agentic.page.benefit2.title': 'Scale without hiring',
        'services.agentic.page.benefit2.desc': 'Handle growing workloads without proportionally growing your team.',
        'services.agentic.page.benefit3.title': 'Consistent quality',
        'services.agentic.page.benefit3.desc': 'Eliminate human error and ensure every task is executed to the same high standard.',
        'services.agentic.page.cta.title': 'Ready for autonomous AI agents?',
        'services.agentic.page.cta.text': 'Let\'s explore how agentic AI can handle your most complex workflows and free your team to focus on what matters most.',
        'services.agentic.page.cta.button': 'Get in touch',
        // Process optimization service page
        'services.process.page.subtitle': 'Streamline workflows and eliminate inefficiencies to maximize your team\'s productivity.',
        'services.process.page.overview.title': 'Why optimize your processes?',
        'services.process.page.overview.text': 'Most businesses lose significant time and money on inefficient processes without realizing it. We analyze your current workflows, identify bottlenecks and redundancies, and redesign processes for maximum efficiency \u2014 often combining process improvements with AI and automation for transformative results.',
        'services.process.page.features.title': 'What we deliver',
        'services.process.page.feature1.title': 'Process analysis',
        'services.process.page.feature1.desc': 'Deep dive into your current workflows to map bottlenecks, redundancies, and improvement opportunities.',
        'services.process.page.feature2.title': 'Workflow redesign',
        'services.process.page.feature2.desc': 'Redesign processes with lean principles, removing waste and streamlining handoffs between teams.',
        'services.process.page.feature3.title': 'Performance monitoring',
        'services.process.page.feature3.desc': 'KPI dashboards and continuous monitoring to track improvements and spot new optimization opportunities.',
        'services.process.page.benefits.title': 'Benefits for your business',
        'services.process.page.benefit1.title': 'Cost reduction',
        'services.process.page.benefit1.desc': 'Eliminate waste and reduce operational costs with leaner processes.',
        'services.process.page.benefit2.title': 'Faster throughput',
        'services.process.page.benefit2.desc': 'Get more done in less time with streamlined workflows.',
        'services.process.page.benefit3.title': 'Happier teams',
        'services.process.page.benefit3.desc': 'Remove frustrating bottlenecks and let your people focus on meaningful work.',
        'services.process.page.cta.title': 'Ready to optimize?',
        'services.process.page.cta.text': 'Let\'s map your processes together and find the opportunities to save time, money, and frustration.',
        'services.process.page.cta.button': 'Get in touch',
        // Automation service page
        'services.automation.page.subtitle': 'End-to-end automation solutions that reduce manual work and eliminate human error.',
        'services.automation.page.overview.title': 'Why automate?',
        'services.automation.page.overview.text': 'Manual, repetitive tasks cost your business time and money while introducing errors. We build end-to-end automation solutions \u2014 from RPA bots that handle data entry to intelligent document processing that extracts and routes information automatically. The result: your team works on what matters while automation handles the rest.',
        'services.automation.page.features.title': 'What we deliver',
        'services.automation.page.feature1.title': 'RPA solutions',
        'services.automation.page.feature1.desc': 'Robotic process automation bots that handle repetitive tasks across your applications with precision.',
        'services.automation.page.feature2.title': 'Document processing',
        'services.automation.page.feature2.desc': 'Intelligent extraction, classification, and routing of invoices, contracts, and other documents.',
        'services.automation.page.feature3.title': 'Workflow automation',
        'services.automation.page.feature3.desc': 'Connect your systems and automate multi-step workflows across departments and platforms.',
        'services.automation.page.benefits.title': 'Benefits for your business',
        'services.automation.page.benefit1.title': 'Hours saved daily',
        'services.automation.page.benefit1.desc': 'Reclaim hours spent on manual data entry, copy-pasting, and routine tasks.',
        'services.automation.page.benefit2.title': 'Zero errors',
        'services.automation.page.benefit2.desc': 'Eliminate costly mistakes from manual data handling and processing.',
        'services.automation.page.benefit3.title': 'Instant scalability',
        'services.automation.page.benefit3.desc': 'Handle 10x the volume without adding headcount or complexity.',
        'services.automation.page.cta.title': 'Ready to automate?',
        'services.automation.page.cta.text': 'Let\'s identify your biggest automation opportunities and start saving time and money immediately.',
        'services.automation.page.cta.button': 'Get in touch',
        // Training service page
        'services.training.page.subtitle': 'Hands-on workshops and courses to upskill your team in AI, automation, and emerging technologies.',
        'services.training.page.overview.title': 'Why invest in AI training?',
        'services.training.page.overview.text': 'Technology is only as effective as the people using it. Our hands-on training programs ensure your team understands AI and automation \u2014 not just how to use the tools, but how to think strategically about applying them. From executive workshops to technical deep-dives, we tailor every program to your team\'s level and goals.',
        'services.training.page.features.title': 'What we offer',
        'services.training.page.feature1.title': 'AI fundamentals',
        'services.training.page.feature1.desc': 'Understand what AI can and cannot do, and learn to identify high-impact opportunities in your business.',
        'services.training.page.feature2.title': 'Technical workshops',
        'services.training.page.feature2.desc': 'Hands-on sessions on prompt engineering, LLMs, automation tools, and building AI workflows.',
        'services.training.page.feature3.title': 'Executive sessions',
        'services.training.page.feature3.desc': 'Strategic workshops for leadership on AI adoption, change management, and building an AI-ready culture.',
        'services.training.page.benefits.title': 'Benefits for your organization',
        'services.training.page.benefit1.title': 'Faster adoption',
        'services.training.page.benefit1.desc': 'Teams that understand AI adopt new tools faster and find more use cases.',
        'services.training.page.benefit2.title': 'Higher productivity',
        'services.training.page.benefit2.desc': 'Empowered employees who use AI tools effectively every day.',
        'services.training.page.benefit3.title': 'Reduced risk',
        'services.training.page.benefit3.desc': 'Teams that understand AI limitations make better decisions and avoid costly mistakes.',
        'services.training.page.cta.title': 'Ready to upskill your team?',
        'services.training.page.cta.text': 'Let\'s design a training program tailored to your team\'s needs and goals. On-site or remote, for any level.',
        'services.training.page.cta.button': 'Get in touch',
        // Secure service page
        'services.secure.page.subtitle': 'Enterprise-grade security for your AI systems, data, and automation workflows.',
        'services.secure.page.overview.title': 'Why security matters for AI',
        'services.secure.page.overview.text': 'AI systems handle sensitive business data and make critical decisions. Without proper security, they become a liability instead of an asset. We ensure your AI deployments are protected from data breaches, comply with regulations like GDPR, and operate within clear governance frameworks \u2014 so you can innovate with confidence.',
        'services.secure.page.features.title': 'What we deliver',
        'services.secure.page.feature1.title': 'Data protection',
        'services.secure.page.feature1.desc': 'Encryption, access controls, and data governance to protect sensitive information in your AI pipelines.',
        'services.secure.page.feature2.title': 'Compliance frameworks',
        'services.secure.page.feature2.desc': 'GDPR, AI Act, and industry-specific compliance built into every solution from the ground up.',
        'services.secure.page.feature3.title': 'Secure deployment',
        'services.secure.page.feature3.desc': 'Hardened infrastructure, monitoring, and incident response for your automation workflows.',
        'services.secure.page.benefits.title': 'Benefits for your business',
        'services.secure.page.benefit1.title': 'Peace of mind',
        'services.secure.page.benefit1.desc': 'Innovate with AI knowing your data and systems are fully protected.',
        'services.secure.page.benefit2.title': 'Regulatory compliance',
        'services.secure.page.benefit2.desc': 'Stay ahead of GDPR, the EU AI Act, and industry regulations.',
        'services.secure.page.benefit3.title': 'Client trust',
        'services.secure.page.benefit3.desc': 'Demonstrate to clients and partners that your AI operations meet the highest security standards.',
        'services.secure.page.cta.title': 'Ready to secure your AI?',
        'services.secure.page.cta.text': 'Let\'s assess your current security posture and build a framework that protects your AI investments.',
        'services.secure.page.cta.button': 'Get in touch'
    },
    nl: {
        'nav.services': 'Diensten',
        'nav.about': 'Over ons',
        'nav.team': 'Team',
        'nav.contact': 'Contact',
        'hero.title': 'Transformeer uw bedrijf met <span class="gradient-text">intelligente automatisering</span>',
        'hero.subtitle': 'Wij leveren geavanceerde AI-oplossingen, en procesoptimalisatie om uw kosten te drukken en digitale transformatie te versnellen.',
        'hero.cta.primary': 'Aan de slag',
        'hero.cta.secondary': 'Meer info',
        'vision.title': 'Visie',
        'vision.headline': 'Een wereld waarin elk bedrijf intelligente digitale collega\'s heeft',
        'vision.text': 'Wij geloven in een toekomst waarin AI mensen niet vervangt, maar versterkt. Waarin elk bedrijf, ongeacht de grootte, toegang heeft tot intelligente automatisering die het routinewerk overneemt \u2014 zodat mensen zich kunnen richten op het buitengewone.',
        'mission.title': 'Missie',
        'mission.headline': 'AI praktisch, toegankelijk en mensgericht maken',
        'mission.text': 'Wij bouwen autonome AI-agents en automatiseringsoplossingen die vanaf dag \u00E9\u00E9n meetbare resultaten leveren. Geen hype, geen zwarte dozen \u2014 gewoon intelligente systemen die samenwerken met uw team, onder uw controle.',
        'services.title': 'Onze diensten',
        'services.subtitle': 'Onze oplossingen om uw operaties te optimaliseren en uw kosten te drukken',
        'services.ai.title': 'Kunstmatige intelligentie',
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
        'aanpak.title': 'Ons plan van aanpak',
        'aanpak.subtitle': 'Van idee tot resultaat in 5 stappen',
        'aanpak.step1.title': 'Analyse & intake',
        'aanpak.step1.desc': 'We brengen uw processen en knelpunten in kaart. Waar kan AI het verschil maken?',
        'aanpak.step2.title': 'Ontwerp',
        'aanpak.step2.desc': 'We ontwerpen uw custom AI agent op maat: taken, workflows en integraties met uw bestaande systemen.',
        'aanpak.step3.title': 'Ontwikkeling',
        'aanpak.step3.desc': 'We bouwen en trainen uw AI agent. U test mee en geeft feedback tijdens het hele proces.',
        'aanpak.step4.title': 'Implementatie',
        'aanpak.step4.desc': 'We zetten uw AI agent live in uw omgeving. Uw team behoudt altijd de controle.',
        'aanpak.step5.title': 'Optimalisatie & support',
        'aanpak.step5.desc': 'We monitoren, optimaliseren en ondersteunen. Uw digitale collega wordt elke dag slimmer.',
        'stats.agents': 'Actieve agents',
        'stats.cost': 'Gemiddelde kostenbesparing',
        'stats.satisfaction': 'Klanttevredenheid',
        'stats.support': 'Ondersteuning beschikbaar',
        'about.title': 'Waarom kiezen voor SmartAgents?',
        'about.desc': 'Wij combineren diepgaande technische expertise met zakelijk inzicht om oplossingen te leveren die echte impact creëren. Ons team van AI-specialisten, automatiseringsingenieurs en procesconsultants werkt samen om uw operaties te transformeren.',
        'about.feature1': 'Toonaangevende expertise in AI en automatisering',
        'about.feature2': 'Bewezen track record in meerdere sectoren',
        'about.feature3': 'End-to-end implementatie en ondersteuning',
        'about.feature4': 'Schaalbare oplossingen die meegroeien met uw bedrijf',
        'team.title': 'Ontmoet ons team',
        'team.subtitle': 'De experts achter SmartAgents, toegewijd aan het transformeren van uw bedrijf',
        'team.axel.role': 'Oprichter',
        'team.axel.bio': 'Ondernemer met 20+ jaar ervaring in digitale transformatie. Gepassioneerd in het helpen van bedrijven met intelligente automatisering.',
        'team.tomv.role': 'Oprichter',
        'team.tomv.bio': 'Technisch architect gespecialiseerd in Agentic AI-systemen en enterprise automatisering. Bouwt schaalbare oplossingen die echte resultaten opleveren.',
        'team.agents.name': 'Onze agents',
        'team.agents.role': 'Onze medewerkers',
        'team.agents.bio': 'Mensen en AI, zij aan zij, voor meetbare impact.',
        'testimonials.title': 'Wat onze klanten zeggen',
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
        'contact.title': 'Klaar om AI in te zetten?',
        'contact.subtitle': 'Samen processen in kaart brengen, samen tot kostenbesparende oplossingen komen, u behoudt de controle.',
        'contact.form.name': 'Naam',
        'contact.form.email': 'E-mail',
        'contact.form.company': 'Bedrijf',
        'contact.form.message': 'Hoe kunnen we helpen?',
        'contact.form.submit': 'Verstuur bericht',
        'contact.form.success': 'Bericht verzonden!',
        'footer.tagline': 'Digitale collega\'s die nooit slapen.',
        'footer.quicklinks': 'Snelle links',
        'footer.office': 'Kantoor',
        'footer.copyright': '© 2026 SmartAgents. Alle rechten voorbehouden.',
        'nav.jobs': 'Jobs',
        'jobs.hero.title': 'Sluit je aan bij ons <span class="gradient-text">team</span>',
        'jobs.hero.subtitle': 'Help ons de toekomst van autonome AI-agents te bouwen. We zoeken mensen die het meest impactvolle werk van hun carrière willen doen.',
        'jobs.vision.title': 'De visie',
        'jobs.vision.text': 'Bij SmartAgents bouwen we autonome AI-agents die functioneren als echte digitale collega\'s \u2014 systemen die kunnen redeneren, plannen en complexe bedrijfstaken 24/7 uitvoeren. We bouwen geen chatbots. We bouwen intelligente automatisering die de manier waarop bedrijven werken transformeert, van AI-gedreven procesoptimalisatie tot volledig autonome agentische workflows.',
        'jobs.role.title': 'Agentic AI developer',
        'jobs.role.subtitle': 'Wat je gaat doen',
        'jobs.role.item1.title': 'Multi-agent systemen',
        'jobs.role.item1.desc': 'Ontwerp & bouw multi-agent systemen die echte bedrijfsproblemen end-to-end oplossen',
        'jobs.role.item2.title': 'LLMs & cutting-edge AI',
        'jobs.role.item2.desc': 'Werk met LLMs, tool-use, RAG en de nieuwste agentische frameworks',
        'jobs.role.item3.title': 'Schaalbare pipelines',
        'jobs.role.item3.desc': 'Ontwerp schaalbare agent-pipelines ge\u00EFntegreerd in bedrijfsworkflows',
        'jobs.role.item4.title': 'Snelle iteraties',
        'jobs.role.item4.desc': 'Ship snel, itereer vaak \u2014 directe impact op het product vanaf dag \u00E9\u00E9n',
        'jobs.benefits.title': 'Waarom SmartAgents',
        'jobs.benefit1.title': 'Cutting-edge tech',
        'jobs.benefit1.desc': 'Werk met het nieuwste in AI, LLMs & agentische systemen',
        'jobs.benefit2.title': 'Equity & eigenaarschap',
        'jobs.benefit2.desc': 'Deel in het succes \u2014 bouw iets dat ook van jou is',
        'jobs.benefit3.title': 'Volledige flexibiliteit',
        'jobs.benefit3.desc': 'Remote-first, async-vriendelijk, resultaat boven uren',
        'jobs.benefit4.title': 'Echte autonomie',
        'jobs.benefit4.desc': 'Eigen domein, eigen beslissingen, snel schakelen',
        'jobs.team.title': 'Het team',
        'jobs.team.text': '<strong>Axel Segers</strong> brengt 20+ jaar ervaring in digitale transformatie, ondernemerschap en strategie. <strong>Tom Haeldermans</strong> is technisch architect gespecialiseerd in agentische AI-systemen en enterprise-automatisering. Samen hebben we SmartAgents van de grond af opgebouwd \u2014 en we zoeken de juiste mensen om mee te groeien. Klein team = groot eigenaarschap, nul bureaucratie, maximale snelheid.',
        'jobs.cta.title': 'Interesse? Laten we praten',
        'jobs.cta.text': 'We zoeken niet zomaar een developer. We willen iemand die de toekomst van AI ziet en die met ons wil bouwen. Ben je klaar voor het meest impactvolle werk van je carrière? Neem contact op.',
        'jobs.cta.button': 'Of gebruik ons contactformulier',
        'services.back': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg> Terug naar homepagina',
        'services.learnmore': 'Meer info',
        // AI-dienstenpagina
        'services.ai.page.subtitle': 'Op maat gemaakte AI-modellen en machine learning oplossingen afgestemd op uw bedrijfsbehoeften.',
        'services.ai.page.overview.title': 'Wat is AI en waarom is het belangrijk?',
        'services.ai.page.overview.text': 'Kunstmatige intelligentie stelt machines in staat om te leren van data, patronen te herkennen en beslissingen te nemen. Wij bouwen AI-oplossingen op maat die complexe taken automatiseren, verborgen inzichten ontsluiten en uw bedrijf een concurrentievoordeel geven \u2014 van voorspellende analyses tot natuurlijke taalverwerking en computer vision.',
        'services.ai.page.features.title': 'Wat wij leveren',
        'services.ai.page.feature1.title': 'Voorspellende analyses',
        'services.ai.page.feature1.desc': 'Voorspel trends, vraag en risico\'s met modellen getraind op uw eigen data voor slimmere besluitvorming.',
        'services.ai.page.feature2.title': 'Natuurlijke taalverwerking',
        'services.ai.page.feature2.desc': 'Haal betekenis uit tekst, automatiseer klantinteracties en analyseer ongestructureerde data op schaal.',
        'services.ai.page.feature3.title': 'Computer vision',
        'services.ai.page.feature3.desc': 'Automatiseer visuele inspectie, documentverwerking en beeldclassificatie met deep learning modellen.',
        'services.ai.page.benefits.title': 'Voordelen voor uw bedrijf',
        'services.ai.page.benefit1.title': 'Datagedreven beslissingen',
        'services.ai.page.benefit1.desc': 'Vervang onderbuikgevoel door bruikbare inzichten uit uw data.',
        'services.ai.page.benefit2.title': 'Tijdsbesparing',
        'services.ai.page.benefit2.desc': 'Automatiseer repetitieve analysetaken en maak uw team vrij voor strategisch werk.',
        'services.ai.page.benefit3.title': 'Schaalbare intelligentie',
        'services.ai.page.benefit3.desc': 'Modellen die meegroeien met uw bedrijf en steeds beter worden.',
        'services.ai.page.cta.title': 'Klaar om AI in te zetten?',
        'services.ai.page.cta.text': 'Laten we samen ontdekken hoe kunstmatige intelligentie uw bedrijfsprocessen kan transformeren en nieuwe kansen kan ontsluiten.',
        'services.ai.page.cta.button': 'Neem contact op',
        // Agentic AI-dienstenpagina
        'services.agentic.page.subtitle': 'Autonome AI-agents die redeneren, plannen en complexe taken uitvoeren naast uw team.',
        'services.agentic.page.overview.title': 'Wat is agentic AI?',
        'services.agentic.page.overview.text': 'Agentic AI gaat verder dan traditionele automatisering. Dit zijn intelligente systemen die zelfstandig kunnen redeneren over problemen, meerstapsoplossingen plannen, tools gebruiken en complexe workflows uitvoeren \u2014 terwijl uw team de controle behoudt. Zie ze als digitale collega\'s die 24/7 end-to-end taken afhandelen, van klant-onboarding tot supply chain beslissingen.',
        'services.agentic.page.features.title': 'Wat wij leveren',
        'services.agentic.page.feature1.title': 'Multi-agent systemen',
        'services.agentic.page.feature1.desc': 'Teams van gespecialiseerde AI-agents die samenwerken om complexe bedrijfsproblemen end-to-end op te lossen.',
        'services.agentic.page.feature2.title': 'Tool-gebruik & integraties',
        'services.agentic.page.feature2.desc': 'Agents die verbinding maken met uw bestaande systemen, API\'s en databases om echte acties uit te voeren.',
        'services.agentic.page.feature3.title': 'Autonoom redeneren',
        'services.agentic.page.feature3.desc': 'Agents die redeneren over problemen, ze opsplitsen in stappen en hun aanpak aanpassen op basis van resultaten.',
        'services.agentic.page.feature4.title': 'Mens-in-de-loop',
        'services.agentic.page.feature4.desc': 'Uw team behoudt de controle met goedkeuringsworkflows en toezicht op kritieke beslissingen.',
        'services.agentic.page.benefits.title': 'Voordelen voor uw bedrijf',
        'services.agentic.page.benefit1.title': '24/7 operaties',
        'services.agentic.page.benefit1.desc': 'AI-agents die de klok rond werken zonder pauzes of downtime.',
        'services.agentic.page.benefit2.title': 'Schalen zonder aan te werven',
        'services.agentic.page.benefit2.desc': 'Verwerk groeiende werklasten zonder uw team evenredig uit te breiden.',
        'services.agentic.page.benefit3.title': 'Consistente kwaliteit',
        'services.agentic.page.benefit3.desc': 'Elimineer menselijke fouten en zorg dat elke taak op dezelfde hoge standaard wordt uitgevoerd.',
        'services.agentic.page.cta.title': 'Klaar voor autonome AI-agents?',
        'services.agentic.page.cta.text': 'Laten we ontdekken hoe agentic AI uw meest complexe workflows kan afhandelen en uw team kan vrijmaken voor wat echt belangrijk is.',
        'services.agentic.page.cta.button': 'Neem contact op',
        // Procesoptimalisatie-dienstenpagina
        'services.process.page.subtitle': 'Stroomlijn workflows en elimineer ineffici\u00EBnties om de productiviteit van uw team te maximaliseren.',
        'services.process.page.overview.title': 'Waarom uw processen optimaliseren?',
        'services.process.page.overview.text': 'De meeste bedrijven verliezen aanzienlijk veel tijd en geld aan ineffici\u00EBnte processen zonder het te beseffen. Wij analyseren uw huidige workflows, identificeren knelpunten en overbodigheden, en herontwerpen processen voor maximale effici\u00EBntie \u2014 vaak gecombineerd met AI en automatisering voor transformatieve resultaten.',
        'services.process.page.features.title': 'Wat wij leveren',
        'services.process.page.feature1.title': 'Procesanalyse',
        'services.process.page.feature1.desc': 'Diepgaande analyse van uw huidige workflows om knelpunten, overbodigheden en verbeterkansen in kaart te brengen.',
        'services.process.page.feature2.title': 'Workflow-herontwerp',
        'services.process.page.feature2.desc': 'Herontwerp processen met lean-principes, elimineer verspilling en stroomlijn overdrachten tussen teams.',
        'services.process.page.feature3.title': 'Prestatiemonitoring',
        'services.process.page.feature3.desc': 'KPI-dashboards en continue monitoring om verbeteringen te volgen en nieuwe optimalisatiekansen te spotten.',
        'services.process.page.benefits.title': 'Voordelen voor uw bedrijf',
        'services.process.page.benefit1.title': 'Kostenbesparing',
        'services.process.page.benefit1.desc': 'Elimineer verspilling en verlaag operationele kosten met slankere processen.',
        'services.process.page.benefit2.title': 'Snellere doorlooptijd',
        'services.process.page.benefit2.desc': 'Krijg meer gedaan in minder tijd met gestroomlijnde workflows.',
        'services.process.page.benefit3.title': 'Gelukkigere teams',
        'services.process.page.benefit3.desc': 'Verwijder frustrerende knelpunten en laat uw mensen focussen op betekenisvol werk.',
        'services.process.page.cta.title': 'Klaar om te optimaliseren?',
        'services.process.page.cta.text': 'Laten we samen uw processen in kaart brengen en de kansen vinden om tijd, geld en frustratie te besparen.',
        'services.process.page.cta.button': 'Neem contact op',
        // Automatisering-dienstenpagina
        'services.automation.page.subtitle': 'End-to-end automatiseringsoplossingen die handmatig werk verminderen en menselijke fouten elimineren.',
        'services.automation.page.overview.title': 'Waarom automatiseren?',
        'services.automation.page.overview.text': 'Handmatige, repetitieve taken kosten uw bedrijf tijd en geld en introduceren fouten. Wij bouwen end-to-end automatiseringsoplossingen \u2014 van RPA-bots die data-invoer afhandelen tot intelligente documentverwerking die informatie automatisch extraheert en doorstuurt. Het resultaat: uw team werkt aan wat ertoe doet terwijl automatisering de rest afhandelt.',
        'services.automation.page.features.title': 'Wat wij leveren',
        'services.automation.page.feature1.title': 'RPA-oplossingen',
        'services.automation.page.feature1.desc': 'Robotic process automation bots die repetitieve taken in uw applicaties met precisie afhandelen.',
        'services.automation.page.feature2.title': 'Documentverwerking',
        'services.automation.page.feature2.desc': 'Intelligente extractie, classificatie en routering van facturen, contracten en andere documenten.',
        'services.automation.page.feature3.title': 'Workflow-automatisering',
        'services.automation.page.feature3.desc': 'Verbind uw systemen en automatiseer meerstapsworkflows over afdelingen en platformen heen.',
        'services.automation.page.benefits.title': 'Voordelen voor uw bedrijf',
        'services.automation.page.benefit1.title': 'Dagelijks uren bespaard',
        'services.automation.page.benefit1.desc': 'Win uren terug die besteed worden aan handmatige data-invoer, kopi\u00EBren en routinetaken.',
        'services.automation.page.benefit2.title': 'Nul fouten',
        'services.automation.page.benefit2.desc': 'Elimineer kostbare fouten door handmatige dataverwerking.',
        'services.automation.page.benefit3.title': 'Direct schaalbaar',
        'services.automation.page.benefit3.desc': 'Verwerk 10x het volume zonder extra personeel of complexiteit.',
        'services.automation.page.cta.title': 'Klaar om te automatiseren?',
        'services.automation.page.cta.text': 'Laten we uw grootste automatiseringskansen identificeren en direct beginnen met het besparen van tijd en geld.',
        'services.automation.page.cta.button': 'Neem contact op',
        // Training-dienstenpagina
        'services.training.page.subtitle': 'Praktische workshops en cursussen om uw team bij te scholen in AI, automatisering en opkomende technologie\u00EBn.',
        'services.training.page.overview.title': 'Waarom investeren in AI-training?',
        'services.training.page.overview.text': 'Technologie is slechts zo effectief als de mensen die het gebruiken. Onze praktische trainingsprogramma\'s zorgen ervoor dat uw team AI en automatisering begrijpt \u2014 niet alleen hoe de tools te gebruiken, maar ook hoe er strategisch over na te denken. Van executive workshops tot technische deep-dives, we stemmen elk programma af op het niveau en de doelen van uw team.',
        'services.training.page.features.title': 'Wat wij aanbieden',
        'services.training.page.feature1.title': 'AI-basiskennis',
        'services.training.page.feature1.desc': 'Begrijp wat AI wel en niet kan, en leer high-impact kansen in uw bedrijf te identificeren.',
        'services.training.page.feature2.title': 'Technische workshops',
        'services.training.page.feature2.desc': 'Praktische sessies over prompt engineering, LLMs, automatiseringstools en het bouwen van AI-workflows.',
        'services.training.page.feature3.title': 'Executive sessies',
        'services.training.page.feature3.desc': 'Strategische workshops voor management over AI-adoptie, verandermanagement en het bouwen van een AI-ready cultuur.',
        'services.training.page.benefits.title': 'Voordelen voor uw organisatie',
        'services.training.page.benefit1.title': 'Snellere adoptie',
        'services.training.page.benefit1.desc': 'Teams die AI begrijpen adopteren nieuwe tools sneller en vinden meer toepassingen.',
        'services.training.page.benefit2.title': 'Hogere productiviteit',
        'services.training.page.benefit2.desc': 'Medewerkers die AI-tools effectief inzetten in hun dagelijkse werk.',
        'services.training.page.benefit3.title': 'Minder risico',
        'services.training.page.benefit3.desc': 'Teams die de beperkingen van AI begrijpen nemen betere beslissingen en vermijden kostbare fouten.',
        'services.training.page.cta.title': 'Klaar om uw team bij te scholen?',
        'services.training.page.cta.text': 'Laten we een trainingsprogramma ontwerpen op maat van de behoeften en doelen van uw team. Op locatie of remote, voor elk niveau.',
        'services.training.page.cta.button': 'Neem contact op',
        // Beveiliging-dienstenpagina
        'services.secure.page.subtitle': 'Beveiligingsoplossingen voor uw AI-systemen, data en automatiseringsworkflows.',
        'services.secure.page.overview.title': 'Waarom beveiliging belangrijk is voor AI',
        'services.secure.page.overview.text': 'AI-systemen verwerken gevoelige bedrijfsdata en nemen kritieke beslissingen. Zonder goede beveiliging worden ze een risico in plaats van een troef. Wij zorgen dat uw AI-implementaties beschermd zijn tegen datalekken, voldoen aan regelgeving zoals GDPR, en werken binnen duidelijke governance frameworks \u2014 zodat u met vertrouwen kunt innoveren.',
        'services.secure.page.features.title': 'Wat wij leveren',
        'services.secure.page.feature1.title': 'Gegevensbescherming',
        'services.secure.page.feature1.desc': 'Encryptie, toegangscontroles en datagovernance om gevoelige informatie in uw AI-pipelines te beschermen.',
        'services.secure.page.feature2.title': 'Compliance frameworks',
        'services.secure.page.feature2.desc': 'GDPR, AI Act en sectorspecifieke compliance ingebouwd in elke oplossing vanaf de basis.',
        'services.secure.page.feature3.title': 'Veilige implementatie',
        'services.secure.page.feature3.desc': 'Geharde infrastructuur, monitoring en incident response voor uw automatiseringsworkflows.',
        'services.secure.page.benefits.title': 'Voordelen voor uw bedrijf',
        'services.secure.page.benefit1.title': 'Gemoedsrust',
        'services.secure.page.benefit1.desc': 'Innoveer met AI in de wetenschap dat uw data en systemen volledig beschermd zijn.',
        'services.secure.page.benefit2.title': 'Regelgevingsconformiteit',
        'services.secure.page.benefit2.desc': 'Blijf voorop lopen met GDPR, de EU AI Act en sectorale regelgeving.',
        'services.secure.page.benefit3.title': 'Vertrouwen van klanten',
        'services.secure.page.benefit3.desc': 'Toon aan klanten en partners dat uw AI-operaties voldoen aan de hoogste beveiligingsstandaarden.',
        'services.secure.page.cta.title': 'Klaar om uw AI te beveiligen?',
        'services.secure.page.cta.text': 'Laten we uw huidige beveiligingspositie beoordelen en een framework bouwen dat uw AI-investeringen beschermt.',
        'services.secure.page.cta.button': 'Neem contact op'
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

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = '...';

        fetch('https://formsubmit.co/ajax/info@smartagents.be', {
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
}

// Add scroll reveal animation
const revealElements = document.querySelectorAll('.vm-panel, .service-card, .aanpak-step, .stat-item, .about-features li');

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
