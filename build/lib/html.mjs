// Minimal build-time templating: a tagged template literal that escapes every
// interpolation by default. No client-side templating runtime, no engine.
// See .claude/skills/fast-static-site/SKILL.md §1.

const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

class Raw {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

/** Mark a string as already-safe HTML so `html` does not escape it. */
export function raw(value) {
  return new Raw(value);
}

function render(value) {
  if (value === null || value === undefined || value === false) return '';
  if (value instanceof Raw) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  return escapeHtml(value);
}

/** html`<p>${untrusted}</p>` — interpolations are escaped unless wrapped in raw(). */
export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) {
    out += render(values[i]) + strings[i + 1];
  }
  return new Raw(out);
}

/** Join a list of values with a separator, keeping raw semantics. */
export function join(values, separator = '\n') {
  return raw(values.map(render).join(separator));
}
