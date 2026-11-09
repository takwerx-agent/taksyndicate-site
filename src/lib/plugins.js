import data from '../data/plugins.json';
import meta from '../data/plugin-meta.json';

export const disciplines = {
  wildfire: { label: 'Wildfire',        c: 'var(--d-fire)' },
  hazmat:   { label: 'Hazmat',          c: 'var(--d-hazmat)' },
  sar:      { label: 'Search & rescue', c: 'var(--d-sar)' },
  le:       { label: 'Law enforcement', c: 'var(--d-le)' },
  ems:      { label: 'EMS',             c: 'var(--d-ems)' },
  water:    { label: 'Flood & water',   c: 'var(--d-water)' },
  air:      { label: 'Air & UAS',       c: 'var(--d-air)' },
  all:      { label: 'All-hazards',     c: 'var(--accent)' },
  tools:    { label: 'Utilities',       c: 'var(--d-events)' },
};

// "terminalOnly" plugins ship with the ATAK Terminal, so they live on /takwerx/, not in the catalog.
const terminalOnly = (p) => meta.plugins[p.slug]?.terminalOnly;
export const plugins = data.plugins.filter((p) => !terminalOnly(p));
export const terminalPlugins = data.plugins.filter(terminalOnly);
export const community = data.community;
export const featured = data.plugins.find((p) => p.slug === data.featured);
export const synced = data.synced;

export const mb = (bytes) => (bytes ? `${(bytes / 1e6).toFixed(bytes < 1e7 ? 1 : 0)} MB` : '');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) => esc(s).replace(/(https?:\/\/[^\s)]+[^\s).,;:])/g, '<a href="$1">$1</a>');

// README sections are wrapped plain text: paragraphs, "  - " bullets with
// indented continuation lines, and short "Heading:" lines. Turn that into HTML.
export function readmeHtml(text) {
  if (!text) return '';
  return text.trim().split(/\n\s*\n/).map((block) => {
    const lines = block.split('\n');
    if (/^\s*-\s+/.test(lines[0])) {
      const items = [];
      for (const l of lines) {
        if (/^\s*-\s+/.test(l)) items.push(l.replace(/^\s*-\s+/, ''));
        else if (items.length) items[items.length - 1] += ' ' + l.trim();
      }
      return '<ul>' + items.map((i) => `<li>${inline(i)}</li>`).join('') + '</ul>';
    }
    const joined = lines.map((l) => l.trim()).join(' ');
    if (lines.length === 1 && joined.endsWith(':') && joined.length < 60) return `<h4>${inline(joined.slice(0, -1))}</h4>`;
    return `<p>${inline(joined)}</p>`;
  }).join('\n');
}
