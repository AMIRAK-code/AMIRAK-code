// Shared building blocks for every generated SVG in assets/.
// SVGs are shown through <img> on GitHub, so nothing external can load:
// fonts are embedded as base64 WOFF2 subsets and every colour is literal.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const C = {
  ink: '#0E0E0C',
  ink2: '#171714',
  line: '#2B2A25',
  cream: '#F2EBDD',
  cream2: '#E4DAC6',
  muted: '#8C8577',
  accent: '#00B7FF', // cyan blue: the one accent colour
  accentDeep: '#0079B8', // same hue, for small text on cream (contrast)
  lime: '#C6F432', // "live" status only
  amber: '#FFB000', // "course project" status and warning marks only
};

const FONT_FILES = {
  display: ['SpaceGrotesk-Bold.woff2', 'Space Grotesk', 700],
  displayMedium: ['SpaceGrotesk-Medium.woff2', 'Space Grotesk', 500],
  mono: ['JetBrainsMono-Regular.woff2', 'JetBrains Mono', 400],
};

const fontCache = new Map();
function fontFace(key) {
  if (!fontCache.has(key)) {
    const [file, family, weight] = FONT_FILES[key];
    const b64 = readFileSync(join(ROOT, 'assets', 'fonts', file)).toString('base64');
    fontCache.set(
      key,
      `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;` +
        `src:url(data:font/woff2;base64,${b64}) format('woff2');}`,
    );
  }
  return fontCache.get(key);
}

export const F = {
  display: `font-family:'Space Grotesk',Arial,Helvetica,sans-serif;font-weight:700`,
  displayMedium: `font-family:'Space Grotesk',Arial,Helvetica,sans-serif;font-weight:500`,
  mono: `font-family:'JetBrains Mono',Consolas,Menlo,monospace;font-weight:400`,
};

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Wrap content in a complete SVG document.
 * `fonts` lists FONT_FILES keys to embed; `css` is appended to the style block.
 * Every animated asset gets a reduced-motion rule that freezes CSS animation.
 */
export function svgDoc({ w, h, title, desc, fonts = [], css = '', body }) {
  const faces = fonts.map(fontFace).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<style>${faces}
.d{${F.display}}.dm{${F.displayMedium}}.m{${F.mono}}
${css}
@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}
</style>
${body}
</svg>
`;
}

/** Text element with class shortcut: t(x, y, 'm', 14, fill, 'text', extraAttrs) */
export function t(x, y, cls, size, fill, text, extra = '') {
  return `<text x="${x}" y="${y}" class="${cls}" font-size="${size}" fill="${fill}" ${extra}>${esc(text)}</text>`;
}

/** Fine background grid used across the dark assets. */
export function grid(w, h, step, color, opacity) {
  let d = '';
  for (let x = step; x < w; x += step) d += `M${x} 0V${h}`;
  for (let y = step; y < h; y += step) d += `M0 ${y}H${w}`;
  return `<path d="${d}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1" fill="none"/>`;
}

/** Registration crop marks at the four corners, a print-shop detail. */
export function cropMarks(w, h, inset, len, color) {
  const i = inset;
  const l = len;
  return `<path d="M${i} ${i + l}V${i}H${i + l}M${w - i - l} ${i}H${w - i}V${i + l}M${w - i} ${h - i - l}V${h - i}H${w - i - l}M${i + l} ${h - i}H${i}V${h - i - l}" stroke="${color}" stroke-width="1.5" fill="none"/>`;
}

export const r1 = (n) => Math.round(n * 10) / 10;

/** Accent colour for text drawn on a given foreground theme. */
export const accentText = (fg) => (fg === C.ink ? C.accentDeep : C.accent);
