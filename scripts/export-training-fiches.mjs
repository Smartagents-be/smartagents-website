// Rebuild the public Dutch course fiches. Preserve their original editorial copy;
// only shared course facts are read from the website to prevent discrepancies.
// Run with: npm run export:fiches (requires Chrome, or set CHROME_BIN).
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { escapeHtml as esc } from '../build/lib/html.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const strings = JSON.parse(readFileSync(join(root, 'src/i18n/nl.json'), 'utf8'));
const t = (key) => {
  if (!(key in strings)) throw new Error(`Missing fiche copy: ${key}`);
  return strings[key];
};
const chrome = [process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
].filter(Boolean).find(existsSync);
if (!chrome) throw new Error('Chrome not found. Set CHROME_BIN to its executable.');
const temporary = mkdtempSync(join(tmpdir(), 'smartagents-fiches-'));

const courses = [
  {
    key: 'agentic', file: 'SmartAgents_Agentic_Engineering_Onepager.pdf',
    title: 'AI voor developers', subtitle: 'effectief, kostenbewust, samen',
    audienceLabel: 'Developers', heroLabel: 'Praktijktraining',
    intro: 'Voor developers die AI dagelijks willen inzetten: programmeerervaring vereist, geen AI-voorkennis nodig. Praktijktraining in je eigen omgeving, met je eigen IDE, CLI en agents. Daarna weet je wanneer AI helpt, wat je delegeert en hoe je dat kostenbewust en in team aanpakt.',
    facts: [['Duur', '1 dag'], ['Deelnemers', t('kata.spec.group.value')],
      ['Locatie', t('kata.spec.location.value')], ['Taal', 'NL / EN']],
    learnLabel: 'Wat je leert', learnSubtitle: "De inhoud in zes thema's",
    cards: [
      ['Omgeving', 'Eigen setup', 'AI goed ingericht in je eigen omgeving, met zaken zoals MCP, skills en context.'],
      ['Kosten', 'Het juiste model', 'Modelkeuze en tokengebruik bewust onder controle.'],
      ['Delegatie', 'AI of zelf?', 'Per taak beslissen wat je aan AI geeft en wat je zelf houdt.'],
      ['Tooling', 'Toolkeuze', 'Wat werkt goed, wat (nog) niet, en hoe investeren in je setup blijft renderen.'],
      ['Team', 'Samen één aanpak', 'Afspraken en gewoontes met collega-devs.'],
      ['Kwaliteit', 'Codebewaking', 'AI-code reviewen zonder in te boeten op niveau.']
    ],
    practiceLabel: 'Hoe verloopt je dag?', practiceSubtitle: '4 blokken met live oefeningen',
    practice: ['AI in je eigen omgeving', 'Kosten & modelkeuze',
      'Delegeren & toolingkeuzes', 'Samenwerken & codekwaliteit'],
    practiceTimes: ['Ochtend 1', 'Ochtend 2', 'Namiddag 1', 'Namiddag 2'],
    outcomesLabel: 'Wat neem je mee?', outcomesSubtitle: 'Concrete resultaten na de training',
    outcomes: ['Werkende setup: AI geïntegreerd in je eigen IDE, CLI en workflow.',
      'Kostenbewuste gewoontes: het juiste model voor de juiste taak.',
      'Scherp delegatiekader: je weet wat je aan AI overlaat en wat niet.',
      'Onderbouwde toolkeuze: voor je eigen stack en projecten.',
      "Teamafspraken: consistent en veilig AI-gebruik met collega's."],
    requirementsLabel: 'Voorkennis',
    requirements: 'ervaring met programmeren en je eigen ontwikkelomgeving.',
    contactLabel: 'Plan een verkennend gesprek: smartagents.be/contact'
  },
  {
    key: 'business', file: 'SmartAgents_AI_Business_Teams_Onepager.pdf',
    title: 'Microsoft 365 Copilot', subtitle: 'van chat tot eigen agents',
    audienceLabel: 'Iedereen', heroLabel: 'Praktijktraining',
    intro: 'Voor elk team dat Copilot professioneel wil inzetten, ongeacht rol of afdeling. Geen voorkennis nodig. Alle Copilot-capaciteiten in één dag, live in een complete M365-omgeving. Daarna weet je team exact waar Copilot het verschil maakt.',
    facts: [['Duur', '1 dag'], ['Deelnemers', t('training.course.business.group').replace(/ deelnemers$/, '')],
      ['Locatie', t('training.course.business.format')], ['Taal', 'NL / EN']],
    learnLabel: 'Wat je leert', learnSubtitle: "De inhoud in zes thema's",
    cards: [
      ['Chat', 'Copilot Chat', 'Eén venster voor mail, Teams, OneDrive en kalender: alles in één vraag.'],
      ['Veilig', 'Grip op je data', 'Je weet wat Copilot wel en niet ziet in jouw omgeving.'],
      ['Apps', 'Copilot in elke app', 'Copilot werkt mee vanuit Outlook, Excel, PowerPoint, Word en Teams.'],
      ['Agents', 'Ingebouwde specialisten', 'Zet Researcher, Analyst en Workflows aan het werk.'],
      ['Bouwen', 'Je eigen agent', 'In Copilot Studio bouw je in minuten een agent met eigen documenten.'],
      ['Cowork', 'Routinewerk uit handen', 'Cowork, de agentwerkruimte in M365, neemt terugkerend werk over.']
    ],
    practiceLabel: 'Hoe verloopt je dag?', practiceSubtitle: "Slides waar nodig, demo's waar het kan",
    practice: ['Chat & verbonden bronnen', 'Copilot in elke app',
      'Standaardagents inzetten', 'Eigen agent + Cowork'],
    practiceTimes: ['Ochtend 1', 'Ochtend 2', 'Namiddag 1', 'Namiddag 2'],
    outcomesLabel: 'Wat neem je mee?', outcomesSubtitle: 'Concrete resultaten na de training',
    outcomes: ['Helder overzicht: per taak bewust kiezen tussen chat, in-app of agent.',
      'Werkende agent: elke deelnemer bouwt er zelf één in Copilot Studio.',
      'Direct nabouwbaar: wat je live ziet, bouw je dezelfde dag na.',
      'Veilig ingezet: duidelijke afspraken over wat Copilot met bedrijfsdata mag.',
      'Direct toepasbaar: geoefend op taken uit de eigen werkdag.'],
    requirementsLabel: 'Aanbevolen',
    requirements: 'M365 Copilot-licentie per deelnemer voor maximaal effect.',
    contactLabel: 'Plan een verkennend gesprek: smartagents.be/contact',
    footerWebsite: true
  }
];

function page(course) {
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8">
<title>${esc(course.title)} · SmartAgents</title><style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font: 10pt/1.45 Arial, sans-serif; color: #111827; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; min-height: 297mm; padding: 13mm 14mm 11mm; }
header, footer { display: flex; justify-content: space-between; align-items: center; }
.brand { font-size: 18pt; font-weight: 800; letter-spacing: -.7pt; }
.brand span { color: #00b9df; }
.eyebrow { text-transform: uppercase; font-size: 8pt; letter-spacing: 1.3pt; color: #0b806a; }
.hero { background: linear-gradient(115deg, #090f18, #10192c 76%, #0b4b45); color: #f8fafc; padding: 6mm 8mm; border-radius: 4mm; margin: 5mm 0; }
.hero .eyebrow { color: #24d9ad; margin: 0 0 2mm; }
h1 { font-size: 23pt; line-height: 1.08; letter-spacing: -.6pt; margin: 0; }
.subtitle { color: #24d9ad; font-weight: 700; font-size: 15pt; margin: 2mm 0 3mm; line-height: 1.2; }
.intro { font-size: 10pt; margin: 0 0 5mm; }
.facts { display: flex; gap: 5mm; }
.fact { border-left: 1pt solid #10b98f; padding-left: 3mm; flex: 1; min-width: 0; }
.fact dt { font-size: 7pt; color: #24d9ad; text-transform: uppercase; letter-spacing: .6pt; }
.fact dd { font-size: 9pt; margin: 1mm 0 0; font-weight: 700; }
.columns { display: grid; grid-template-columns: 1.12fr 1fr; gap: 5mm; }
h2 { font-size: 12pt; margin: 0 0 3mm; line-height: 1.2; }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
.card { border: 1px solid #e1e6ed; border-radius: 3mm; padding: 3mm; min-height: 36mm; break-inside: avoid; }
.card .category { font-size: 7pt; text-transform: uppercase; letter-spacing: .5pt; color: #087862; margin-bottom: 1mm; }
.section-subtitle { font-size: 7pt; text-transform: uppercase; letter-spacing: .7pt; margin: -1mm 0 3mm; color: #42526a; }
.practice .section-subtitle { color: #b5c4d5; font-size: 7pt; }
.practice time { display: block; font-size: 7pt; text-transform: uppercase; letter-spacing: .5pt; color: #24d9ad; }
.card h3 { font-size: 10pt; color: #087862; margin: 0 0 2mm; }
.card p { font-size: 9pt; color: #42526a; margin: 0; }
.results, .practice { padding: 5mm; border-radius: 3mm; break-inside: avoid; }
.results { background: #f0f4f9; border: 1px solid #dbe2ec; margin-bottom: 4mm; }
ul, ol { padding-left: 5mm; margin: 0; }
li { padding: 2mm 0; font-size: 9pt; }
li::marker { color: #0aa983; font-weight: 700; }
.practice { background: #0b1320; color: white; }
.practice p { font-size: 9pt; color: #dce5ee; }
.requirements { font-size: 8.5pt; margin-top: 5mm; padding: 3mm 4mm; background: #eff9f6; border: 1px solid #b2e9d8; border-radius: 2mm; }
.cta { display: flex; justify-content: space-between; gap: 3mm; margin: 4mm 0; font-size: 9pt; }
a { color: #087862; text-decoration: none; }
footer { border-top: 1px solid #e1e6ed; padding-top: 3mm; font-size: 8pt; margin-top: 4mm; }
footer .tagline { font-weight: 700; }
:is(.page--agentic, .page--business) { position: relative; }
:is(.page--agentic, .page--business) .results, :is(.page--agentic, .page--business) .practice { padding: 4mm; }
:is(.page--agentic, .page--business) li { padding: 1.3mm 0; }
:is(.page--agentic, .page--business) .hero { padding-block: 5mm; }
:is(.page--agentic, .page--business) .requirements { margin-top: 3mm; }
:is(.page--agentic, .page--business) .cta { margin-block: 3mm; }
:is(.page--agentic, .page--business) footer { position: absolute; bottom: 11mm; left: 14mm; right: 14mm; margin-top: 0; }
</style></head><body><main class="page page--${course.key}">
<header><div class="brand">Smart<span>Agents</span></div><div class="eyebrow">${esc(course.audienceLabel || 'Praktijktraining')}</div></header>
<section class="hero"><p class="eyebrow">${esc(course.heroLabel || 'Leren door te doen')}</p>
<h1>${esc(course.title)}</h1><p class="subtitle">${esc(course.subtitle)}</p>
<p class="intro">${esc(course.intro)}</p><dl class="facts">${course.facts.map(([label, value]) => `<div class="fact"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></section>
<div class="columns"><section><h2>${esc(course.learnLabel || 'Wat u leert')}</h2>${course.learnSubtitle ? `<p class="section-subtitle">${esc(course.learnSubtitle)}</p>` : ''}<div class="cards">${course.cards.map((card) => {
  const [category, title, body] = card.length === 3 ? card : ['', ...card];
  return `<article class="card">${category ? `<div class="category">${esc(category)}</div>` : ''}<h3>${esc(title)}</h3><p>${esc(body)}</p></article>`;
}).join('')}</div></section>
<aside><section class="results"><h2>${esc(course.outcomesLabel || 'Wat u meeneemt')}</h2>${course.outcomesSubtitle ? `<p class="section-subtitle">${esc(course.outcomesSubtitle)}</p>` : ''}<ul>${course.outcomes.map((line) => `<li>${esc(line)}</li>`).join('')}</ul></section>
<section class="practice"><h2>${esc(course.practiceLabel || 'Wat u oefent')}</h2>${course.practiceSubtitle ? `<p class="section-subtitle">${esc(course.practiceSubtitle)}</p>` : ''}<ol>${course.practice.map((line, i) => `<li>${course.practiceTimes ? `<time>${esc(course.practiceTimes[i])}</time>` : ''}${esc(line)}</li>`).join('')}</ol></section></aside></div>
<div class="requirements"><strong>${esc(course.requirementsLabel || 'Wat u meebrengt')}:</strong> ${esc(course.requirements)}</div>
<div class="cta">${course.detail ? `<a href="${course.detail}">Bekijk het programma op smartagents.be →</a>` : ''}<a href="https://smartagents.be/nl/#contact">${esc(course.contactLabel || 'Plan een gesprek →')}</a></div>
<footer><span class="tagline">Digitale collega's die nooit slapen.</span>${course.footerWebsite ? '<a href="https://smartagents.be">smartagents.be</a>' : ''}<a href="mailto:info@smartagents.be">info@smartagents.be</a><span>Beringen · België</span></footer>
</main></body></html>`;
}

const selection = process.argv[2];
const selectedCourses = selection ? courses.filter((course) => course.key === selection) : courses;
if (!selectedCourses.length) throw new Error(`Unknown course: ${selection}. Choose agentic or business.`);

for (const course of selectedCourses) {
  const html = join(temporary, `${course.key}.html`);
  writeFileSync(html, page(course));
  const output = resolve(root, 'public/media', course.file);
  const result = spawnSync(chrome, ['--headless', '--disable-gpu', '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw', '--virtual-time-budget=1000',
    `--print-to-pdf=${output}`, pathToFileURL(html).href], { encoding: 'utf8', timeout: 60000 });
  if (result.error || result.status !== 0 || !existsSync(output)) {
    throw new Error(`Could not export ${course.file}: ${result.error?.message || result.stderr}`);
  }
  console.log(`Exported ${course.file}`);
}
