// The homepage hero's diagram: the reader's team in the middle, five agents
// around it, each with the small network of work it reaches into. Drawn as an
// inline SVG at build time, so it is sharp at every width and every label is a
// `t()` string; `agent-map.js` only pauses it when nobody can see it.
// The look and the motion are in `main.css` under "The agent map".
// See element-ids/SKILL.md: every element carries an id, keyed, never indexed by
// language.
import { html, join } from '../../../build/lib/html.mjs';

/** The team the spokes start from, in viewBox units. */
const HUB = { x: 306, y: 310 };

/**
 * The five services around the team, clockwise from the top, which is also the
 * order the pulses leave the hub in. `label` is where the
 * name stands relative to its node and which way it reads off that point.
 */
const AGENTS = [
  { key: 'training', x: 299, y: 106, label: { x: 299, y: 74, anchor: 'middle' } },
  { key: 'coaching', x: 470, y: 222, label: { x: 494, y: 206, anchor: 'start' } },
  { key: 'staffing', x: 399, y: 470, label: { x: 418, y: 506, anchor: 'start' } },
  { key: 'sdlc', x: 161, y: 440, label: { x: 146, y: 476, anchor: 'end' } },
  // Above its node rather than beside it: the longest name, and to its left
  // is the edge of the drawing.
  { key: 'processes', x: 138, y: 242, label: { x: 138, y: 212, anchor: 'middle' } }
];

/** The work around the agents: small nodes, keyed by a two-digit name. */
const NODES = {
  '01': [235, 92], '02': [275, 169], '03': [263, 225], '04': [330, 189],
  '05': [233, 195], '06': [189, 223], '07': [400, 223], '08': [338, 232],
  '09': [422, 147], '10': [410, 276], '11': [464, 287], '12': [511, 327],
  '13': [366, 289], '14': [397, 334], '15': [444, 371], '16': [386, 401],
  '17': [488, 443], '18': [445, 529], '19': [322, 491], '20': [241, 447],
  '21': [247, 361], '22': [281, 382], '23': [347, 388], '24': [184, 489],
  '25': [143, 525], '26': [129, 385], '27': [70, 385], '28': [120, 292],
  '29': [56, 255], '30': [102, 157]
};

/** A few nodes are larger, so the network is not one dot size repeated. */
const LARGE = new Set(['06', '11', '12', '17', '18', '25', '26', '27', '30']);

/**
 * The network's edges, between agents (by key) and nodes (by name). The ones
 * marked `flow` carry a pulse of their own now and then, out from the agent.
 */
const EDGES = [
  ['training', '01'], ['01', '02'], ['training', '02', 'flow'], ['02', '03'], ['02', '04'],
  ['02', '05'], ['05', '06'], ['06', 'processes'],
  ['04', '08'], ['08', '07'], ['07', 'coaching', 'flow'], ['07', '09'],
  ['09', 'coaching'], ['07', '10'], ['10', '11'], ['11', 'coaching'],
  ['11', '12'], ['10', '13'], ['13', '14'], ['14', '15'], ['15', '12'],
  ['15', '16'], ['16', 'staffing', 'flow'], ['staffing', '17'], ['17', '15'],
  ['staffing', '18'], ['18', '17'], ['staffing', '19'], ['19', '20'],
  ['20', '21'], ['21', '22'], ['22', '23'], ['23', '16'], ['20', '24'],
  ['24', 'sdlc', 'flow'], ['sdlc', '25'], ['24', '25'],
  ['sdlc', '26'], ['26', '27'], ['27', '28'], ['28', 'processes'],
  ['processes', '29', 'flow'], ['29', '28'], ['29', '30'], ['30', 'processes']
];

const AT = Object.fromEntries(AGENTS.map((agent) => [agent.key, [agent.x, agent.y]]));
const point = (name) => AT[name] ?? NODES[name];

/** Two decimals is a hundredth of a viewBox unit, finer than any screen. */
const n = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} options
 * @param {Function} options.t
 * @param {string} options.prefix  the id scope, e.g. `home-hero-map`
 */
export function agentMap({ t, prefix }) {
  const edges = EDGES.map(([from, to, flow], i) => {
    const [x1, y1] = point(from);
    const [x2, y2] = point(to);
    const id = `${prefix}-edge-${from}-${to}${flow ? '-flow' : ''}`;
    // The flow is a second stroke over the edge: a short dash run along it.
    const line = html`<line id="${id}" class="agent-map__edge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="--i:${i}"/>`;
    if (!flow) return line;
    return html`${line}<line id="${id}-pulse" class="agent-map__flow" pathLength="100" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="--i:${i}"/>`;
  });

  const nodes = Object.entries(NODES).map(([name, [x, y]], i) =>
    html`<circle id="${prefix}-node-${name}" class="agent-map__node" cx="${x}" cy="${y}" r="${LARGE.has(name) ? 4.5 : 3}" style="--i:${i}"/>`);

  // A spoke stops at the agent's halo rather than its centre, so the pulse that
  // runs along it lands on the ring and not under the node.
  const spokes = AGENTS.map(({ key, x, y }, i) => {
    const dx = x - HUB.x;
    const dy = y - HUB.y;
    const length = Math.hypot(dx, dy);
    const x1 = n(HUB.x + (dx / length) * 42);
    const y1 = n(HUB.y + (dy / length) * 42);
    const x2 = n(x - (dx / length) * 16);
    const y2 = n(y - (dy / length) * 16);
    return html`<g id="${prefix}-spoke-${key}" class="agent-map__spoke" style="--i:${i}">
        <line id="${prefix}-spoke-${key}-line" class="agent-map__spoke-line" pathLength="100" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
        <line id="${prefix}-spoke-${key}-pulse" class="agent-map__pulse" pathLength="100" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
      </g>`;
  });

  const agents = AGENTS.map(({ key, x, y, label }, i) => html`<g id="${prefix}-agent-${key}" class="agent-map__agent" style="--i:${i}">
        <circle id="${prefix}-agent-${key}-ripple" class="agent-map__ripple" cx="${x}" cy="${y}" r="16"/>
        <circle id="${prefix}-agent-${key}-halo" class="agent-map__halo" cx="${x}" cy="${y}" r="16"/>
        <circle id="${prefix}-agent-${key}-body" class="agent-map__body" cx="${x}" cy="${y}" r="11"/>
        <circle id="${prefix}-agent-${key}-core" class="agent-map__core" cx="${x}" cy="${y}" r="4.5"/>
        <text id="${prefix}-agent-${key}-label" class="agent-map__label" x="${label.x}" y="${label.y}" text-anchor="${label.anchor}">${t(`hero.map.${key}`)}</text>
      </g>`);

  return html`<sa-agent-map id="${prefix}" class="agent-map">
    <svg id="${prefix}-svg" class="agent-map__svg" viewBox="0 0 612 620" role="img" aria-labelledby="${prefix}-title">
      <title id="${prefix}-title">${t('hero.map.label')}</title>
      <circle id="${prefix}-orbit" class="agent-map__orbit" cx="${HUB.x}" cy="${HUB.y}" r="272"/>
      <g id="${prefix}-edges" class="agent-map__edges">
        ${join(edges, '\n        ')}
      </g>
      <g id="${prefix}-nodes" class="agent-map__nodes">
        ${join(nodes, '\n        ')}
      </g>
      <g id="${prefix}-spokes" class="agent-map__spokes">
      ${join(spokes, '\n      ')}
      </g>
      <g id="${prefix}-hub" class="agent-map__hub">
        <circle id="${prefix}-hub-ripple" class="agent-map__ripple agent-map__ripple--hub" cx="${HUB.x}" cy="${HUB.y}" r="40"/>
        <circle id="${prefix}-hub-halo" class="agent-map__halo" cx="${HUB.x}" cy="${HUB.y}" r="40"/>
        <circle id="${prefix}-hub-body" class="agent-map__body" cx="${HUB.x}" cy="${HUB.y}" r="25"/>
        <circle id="${prefix}-hub-core" class="agent-map__core" cx="${HUB.x}" cy="${HUB.y}" r="5"/>
      </g>
      <g id="${prefix}-agents" class="agent-map__agents">
      ${join(agents, '\n      ')}
      </g>
    </svg>
  </sa-agent-map>`;
}
