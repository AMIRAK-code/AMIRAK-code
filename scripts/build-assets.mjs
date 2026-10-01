// Generates every SVG in assets/ except activity.svg (that one belongs to
// scripts/activity.mjs and the scheduled workflow).
//
//   node scripts/build-assets.mjs
//
// Copy lives in scripts/content.mjs; edit there and rebuild.

import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { ROOT, C, svgDoc, t, grid, cropMarks, r1, accentText } from './lib/svg.mjs';
import { moleAnimation, moleFrame } from './lib/mole.mjs';
import { PROFILE, EMPLOYER, WORK, PROJECTS, STACK } from './content.mjs';

const out = (rel, svg) => {
  const p = join(ROOT, 'assets', rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, svg);
  console.log(`  ${rel.padEnd(30)} ${(svg.length / 1024).toFixed(1).padStart(6)} KB`);
};

// JetBrains Mono advances 0.6em per glyph.
const monoW = (s, size, ls = 0) => s.length * (size * 0.6 + ls);

const icon = (name) =>
  'data:image/svg+xml;base64,' + readFileSync(join(ROOT, 'assets', 'vendor', 'skill-icons', name + '.svg')).toString('base64');

// Deterministic pseudo-random numbers so rebuilds are byte-identical.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

/* ───────────────────────── HERO ───────────────────────── */

function hero({ animated }) {
  const W = 1200;
  const H = 620;
  const mole = { cx: 1000, ground: 478, scale: 2.38 };
  const anim = moleAnimation(mole);
  const still = moleFrame(28, mole);
  const DUR = '10s';
  const bodyAttrs = `fill="none" stroke="${C.cream}" stroke-width="1.1" stroke-opacity="0.82" stroke-linejoin="round"`;
  const spireAttrs = `fill="none" stroke="${C.accent}" stroke-width="1.4" stroke-linejoin="round"`;

  const wire = animated
    ? `<path ${bodyAttrs} d="${anim.first.body}"><animate attributeName="d" dur="${DUR}" repeatCount="indefinite" values="${anim.body}"/></path>
<path ${spireAttrs} d="${anim.first.spire}"><animate attributeName="d" dur="${DUR}" repeatCount="indefinite" values="${anim.spire}"/></path>`
    : `<path ${bodyAttrs} d="${still.body}"/><path ${spireAttrs} d="${still.spire}"/>`;

  // Floor rings are circles, so they need no rotation.
  const floor = [70, 120, 170]
    .map((rx, i) => `<ellipse cx="${mole.cx}" cy="${mole.ground}" rx="${rx}" ry="${r1(rx * 0.22)}" fill="none" stroke="${C.cream}" stroke-opacity="${r1(0.22 - i * 0.05)}"${i === 2 ? ' stroke-dasharray="2 6"' : ''}/>`)
    .join('');
  const orbitPath = `M${mole.cx - 150} 300a150 30 0 1 0 300 0a150 30 0 1 0 -300 0`;
  const orbit =
    `<path d="${orbitPath}" fill="none" stroke="${C.accent}" stroke-opacity="0.45" stroke-dasharray="1 5"/>` +
    (animated
      ? `<circle r="4.5" fill="${C.accent}"><animateMotion dur="7s" repeatCount="indefinite" path="${orbitPath}"/></circle>`
      : `<circle cx="${mole.cx + 150}" cy="300" r="4.5" fill="${C.accent}"/>`);
  const scan = animated
    ? `<rect x="${mole.cx - 140}" y="0" width="280" height="1.5" fill="${C.accent}" opacity="0.5"><animate attributeName="y" values="${mole.ground};96;${mole.ground}" dur="6s" repeatCount="indefinite"/></rect>`
    : '';

  let rx = 40;
  let roleSvg = '';
  PROFILE.roles.forEach((r, i) => {
    roleSvg += t(rx, 424, 'm', 17, C.cream, r, 'letter-spacing="1.5"');
    rx += monoW(r, 17, 1.5) + 14;
    if (i < PROFILE.roles.length - 1) {
      roleSvg += `<rect x="${rx - 4}" y="411" width="10" height="10" fill="${C.accent}"/>`;
      rx += 24;
    }
  });

  const index = ['WORK', 'PROJECTS', 'STACK', 'SIGNAL', 'CONTACT'];
  const cellW = (W - 80) / index.length;
  const strip = index
    .map((s, i) => {
      const x = 40 + i * cellW;
      return `<path d="M${x} 528V588" stroke="${C.line}"/>` + t(x + 14, 552, 'm', 12, i === 0 ? C.accent : C.muted, `0${i + 1}`) + t(x + 14, 576, 'dm', 18, C.cream, s, 'letter-spacing="1"');
    })
    .join('');

  const a = (cls, delay) => (animated ? `class="${cls}" style="animation-delay:${delay}ms"` : '');
  const css = animated
    ? `.in{animation:in 1s cubic-bezier(.16,.84,.2,1) backwards}
@keyframes in{from{opacity:0;transform:translateY(28px)}}
.wipe{transform-box:fill-box;transform-origin:0 50%;animation:wipe .9s cubic-bezier(.7,0,.2,1) backwards}
@keyframes wipe{from{transform:scaleX(0)}}
.blink{animation:blink 1.1s steps(2,start) infinite}
@keyframes blink{to{visibility:hidden}}`
    : '';
  const cityX = 476;

  const body = `
<rect width="${W}" height="${H}" fill="${C.ink}"/>
${grid(W, H, 40, C.cream, 0.04)}
${cropMarks(W, H, 14, 14, C.muted)}
<g ${a('in', 0)}>
${t(40, 52, 'm', 12, C.muted, 'github.com/' + PROFILE.login + ' / README.md', 'letter-spacing="1"')}
${t(600, 52, 'm', 12, C.muted, 'PROFILE — REV. ' + PROFILE.rev, 'text-anchor="middle" letter-spacing="1"')}
${t(W - 40, 52, 'm', 12, C.cream, PROFILE.coords, 'text-anchor="end" letter-spacing="1"')}
</g>
<path d="M40 70H${W - 40}" stroke="${C.line}"/>
<rect x="40" y="96" width="64" height="8" fill="${C.accent}" ${a('wipe', 150)}/>
<g ${a('in', 200)}>${t(34, 238, 'd', 116, C.cream, PROFILE.first, 'letter-spacing="-3"')}</g>
<g ${a('in', 350)}>${t(34, 356, 'd', 116, C.accent, PROFILE.last, 'letter-spacing="-3"')}
${t(cityX, 356, 'm', 14, C.muted, '/ ' + PROFILE.city, 'letter-spacing="2"')}
<rect x="${r1(cityX + monoW('/ ' + PROFILE.city, 14, 2) + 6)}" y="343" width="9" height="14" fill="${C.accent}"${animated ? ' class="blink"' : ''}/></g>
<g ${a('in', 550)}>${roleSvg}
${t(40, 458, 'm', 13, C.muted, PROFILE.heroNote, 'letter-spacing="0.5"')}</g>
<path d="M40 500H${W - 40}" stroke="${C.line}"/>
<rect x="40" y="528" width="6" height="60" fill="${C.accent}"/>
${strip}
<path d="M${W - 40} 528V588" stroke="${C.line}"/>
${floor}
${orbit}
${wire}
${scan}
<path d="M${mole.cx + 24} 92H${mole.cx + 104}" stroke="${C.muted}"/>
${t(mole.cx + 110, 96, 'm', 10, C.muted, '167.5 M')}
${t(mole.cx + 110, 112, 'm', 10, C.muted, 'FIG.00')}
<text x="1172" y="478" class="m" font-size="10" fill="${C.muted}" letter-spacing="2" transform="rotate(-90 1172 478)">MOLE ANTONELLIANA · WIREFRAME</text>`;

  return svgDoc({
    w: W,
    h: H,
    title: `${PROFILE.first} ${PROFILE.last} — ${PROFILE.roles.join(', ')}`,
    desc: `Profile banner: the name ${PROFILE.first} ${PROFILE.last} in large type, the roles ${PROFILE.roles.join(', ')}, and ${animated ? 'a slowly rotating' : 'a'} wireframe drawing of the Mole Antonelliana in Torino.`,
    fonts: ['display', 'displayMedium', 'mono'],
    css,
    body,
  });
}

/* ───────────────────────── SMALL PARTS ───────────────────────── */

function sectionHeader(num, title, meta) {
  const W = 1200;
  const H = 72;
  return svgDoc({
    w: W,
    h: H,
    title: `${num} ${title}`,
    desc: `Section heading: ${title}. ${meta}`,
    fonts: ['display', 'mono'],
    body: `<rect width="${W}" height="${H}" fill="${C.ink}"/>
<rect width="${H}" height="${H}" fill="${C.accent}"/>
${t(36, 47, 'd', 28, C.ink, num, 'text-anchor="middle"')}
${t(98, 46, 'd', 28, C.cream, title, 'letter-spacing="0.5"')}
<path d="M${98 + title.length * 18.5 + 20} 36H${W - 40 - monoW(meta, 12, 1) - 20}" stroke="${C.line}"/>
${t(W - 40, 41, 'm', 12, C.muted, meta, 'text-anchor="end" letter-spacing="1"')}`,
  });
}

function button(kind, label, value) {
  const H = 44;
  const glyphW = 44;
  const W = Math.round(glyphW + 16 + monoW(label, 12, 1.5) + 12 + monoW(value, 12) + 34);
  const glyph = {
    website: `<circle cx="22" cy="22" r="9" fill="none" stroke="${C.ink}" stroke-width="1.6"/><path d="M13 22H31M22 13c-5 5-5 13 0 18M22 13c5 5 5 13 0 18" fill="none" stroke="${C.ink}" stroke-width="1.6"/>`,
    linkedin: `<image href="${icon('LinkedIn')}" x="10" y="10" width="24" height="24"/>`,
    github: `<image href="${icon('Github-Dark')}" x="10" y="10" width="24" height="24"/>`,
  }[kind];
  const lx = glyphW + 16;
  return svgDoc({
    w: W,
    h: H,
    title: `${label}: ${value}`,
    desc: `Link button for ${label.toLowerCase()} ${value}`,
    fonts: ['mono'],
    body: `<rect width="${W}" height="${H}" fill="${C.ink}"/>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${C.cream}" stroke-opacity="0.25"/>
<rect width="${glyphW}" height="${H}" fill="${kind === 'website' ? C.accent : C.ink2}"/>
${glyph}
${t(lx, 27, 'm', 12, C.cream, label, 'letter-spacing="1.5"')}
${t(lx + monoW(label, 12, 1.5) + 12, 27, 'm', 12, C.muted, value)}
${t(W - 14, 28, 'm', 14, C.accent, '↗', 'text-anchor="end"')}`,
  });
}

function typingStatic(line) {
  const W = 900;
  const H = 56;
  return svgDoc({
    w: W,
    h: H,
    title: line,
    desc: 'Static version of the animated introduction line.',
    fonts: ['mono'],
    body: `${t(W / 2, 35, 'm', 21, '#0096D6', line, 'text-anchor="middle"')}`,
  });
}

/* ───────────────────────── CARD FRAME ───────────────────────── */

const STATUS = {
  live: { dot: C.lime, fill: null },
  mvp: { dot: C.lime, fill: null, dash: true },
  prototype: { dot: null, fill: null, dash: true },
  course: { dot: C.amber, fill: null },
  tool: { dot: C.muted, fill: null },
  private: { dot: null, fill: C.accent },
};

function chip(xRight, y, label, kind, fg) {
  const s = STATUS[kind];
  const w = monoW(label, 11, 1) + (s.dot ? 34 : 20);
  const x = xRight - w;
  const box = s.fill
    ? `<rect x="${x}" y="${y}" width="${w}" height="24" fill="${s.fill}"/>`
    : `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="23" fill="none" stroke="${fg}" stroke-opacity="0.55"${s.dash ? ' stroke-dasharray="3 3"' : ''}/>`;
  const dot = s.dot ? `<circle cx="${x + 13}" cy="${y + 12}" r="4" fill="${s.dot}"/>` : '';
  return box + dot + t(x + (s.dot ? 24 : 10), y + 16, 'm', 11, s.fill ? C.ink : fg, label, 'letter-spacing="1"');
}

function tagRow(x, y, tags, fg) {
  let cx = x;
  return tags
    .map((tag) => {
      const w = monoW(tag, 11, 1) + 16;
      const s = `<rect x="${cx + 0.5}" y="${y + 0.5}" width="${w - 1}" height="23" fill="none" stroke="${fg}" stroke-opacity="0.3"/>` + t(cx + 8, y + 16, 'm', 11, fg, tag, 'letter-spacing="1"');
      cx += w + 6;
      return s;
    })
    .join('');
}

function wrap(text, max) {
  const lines = [];
  let cur = '';
  for (const w of text.split(' ')) {
    if ((cur + ' ' + w).trim().length > max) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

/* ───────────────────────── PROJECT ART ─────────────────────────
   Each function draws inside the box (x, y, w, h) using fg/bg colours.  */

const ART = {
  examer(x, y, w, h, fg) {
    const r = rng(7);
    let s = '';
    const rows = 6;
    for (let i = 0; i < rows; i++) {
      const cy = y + 18 + i * 30;
      s += t(x, cy + 4, 'm', 11, C.muted, String(i + 1).padStart(2, '0'));
      const pick = Math.floor(r() * 5);
      for (let j = 0; j < 5; j++) {
        const cx = x + 44 + j * 34;
        s += pick === j
          ? `<circle cx="${cx}" cy="${cy}" r="10" fill="${C.accent}"/>`
          : `<circle cx="${cx}" cy="${cy}" r="10" fill="none" stroke="${fg}" stroke-opacity="0.45"/>` + t(cx, cy + 4, 'm', 10, fg, 'ABCDE'[j], 'text-anchor="middle" fill-opacity="0.5"');
      }
    }
    // source stamp and citation lines
    const sx = x + 300;
    s += `<g transform="rotate(-7 ${sx + 110} ${y + 60})"><rect x="${sx}" y="${y + 24}" width="220" height="72" fill="none" stroke="${C.accent}" stroke-width="3"/>
<rect x="${sx + 6}" y="${y + 30}" width="208" height="60" fill="none" stroke="${C.accent}" stroke-width="1"/>
${t(sx + 110, y + 68, 'd', 30, C.accent, 'SOURCED', 'text-anchor="middle" letter-spacing="3"')}
${t(sx + 110, y + 84, 'm', 9, C.accent, 'OFFICIAL PAGE · URL · DATE CHECKED', 'text-anchor="middle"')}</g>`;
    for (let i = 0; i < 4; i++) {
      const ly = y + 128 + i * 16;
      s += t(sx, ly + 4, 'm', 10, C.muted, '↳') + `<rect x="${sx + 16}" y="${ly - 2}" width="${60 + r() * 150}" height="5" fill="${fg}" fill-opacity="0.22"/>`;
    }
    return s;
  },

  techcert(x, y, w, h, fg) {
    const cx = x + 112;
    const cy = y + 95;
    let s = `<circle cx="${cx}" cy="${cy}" r="88" fill="none" stroke="${fg}" stroke-opacity="0.35"/>
<circle cx="${cx}" cy="${cy}" r="62" fill="none" stroke="${C.accent}" stroke-width="2"/>`;
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const r0 = 66;
      const r2 = i % 6 === 0 ? 84 : 76;
      s += `<path d="M${r1(cx + Math.cos(a) * r0)} ${r1(cy + Math.sin(a) * r0)}L${r1(cx + Math.cos(a) * r2)} ${r1(cy + Math.sin(a) * r2)}" stroke="${fg}" stroke-opacity="${i % 6 === 0 ? 0.8 : 0.35}"/>`;
    }
    s += t(cx, cy + 14, 'd', 40, fg, 'TC', 'text-anchor="middle" letter-spacing="-1"');
    s += `<path d="M${cx - 26} ${cy + 30}H${cx + 26}" stroke="${C.accent}" stroke-width="3"/>`;
    const lx = x + 250;
    const rows = [
      ['CREDENTIAL', 'TC-XXXX-XXXX'],
      ['TRACK A', 'AI PROMPT ENGINEER'],
      ['TRACK B', 'AI SECURITY PROFESSIONAL'],
      ['EXAM', '15 Q · 25 MIN'],
      ['PASS MARK', '70%'],
      ['CHECK', 'SERVER-SIDE'],
    ];
    rows.forEach(([k, v], i) => {
      const ly = y + 22 + i * 30;
      s += t(lx, ly, 'm', 10, C.muted, k, 'letter-spacing="1"') + t(lx + 96, ly, 'm', 12, i === 0 ? accentText(fg) : fg, v);
      s += `<path d="M${lx} ${ly + 10}H${x + w}" stroke="${fg}" stroke-opacity="0.12"/>`;
    });
    return s;
  },

  fundable(x, y, w, h, fg) {
    let s = '';
    const L = [];
    const R = [];
    for (let i = 0; i < 5; i++) {
      L.push([x + 40, y + 12 + i * 36]);
      R.push([x + w - 40, y + 12 + i * 36]);
    }
    const pairs = [[0, 1], [1, 3], [2, 0], [3, 2], [4, 4], [2, 3]];
    pairs.forEach(([a, b], i) => {
      const [x1, y1] = L[a];
      const [x2, y2] = R[b];
      const hot = i === 3;
      s += `<path d="M${x1 + 12} ${y1}C${x + w / 2} ${y1} ${x + w / 2} ${y2} ${x2 - 12} ${y2}" fill="none" stroke="${hot ? C.accent : fg}" stroke-opacity="${hot ? 1 : 0.3}" stroke-width="${hot ? 2.5 : 1.2}"/>`;
    });
    L.forEach(([px, py], i) => (s += `<rect x="${px - 11}" y="${py - 11}" width="22" height="22" fill="${i === 3 ? C.accent : 'none'}" stroke="${fg}" stroke-opacity="0.8"/>`));
    R.forEach(([px, py], i) => (s += `<circle cx="${px}" cy="${py}" r="11" fill="${i === 2 ? C.accent : 'none'}" stroke="${fg}" stroke-opacity="0.8"/>`));
    s += t(x + 40, y + h - 2, 'm', 10, C.muted, 'FOUNDERS', 'text-anchor="middle" letter-spacing="1"');
    s += t(x + w - 40, y + h - 2, 'm', 10, C.muted, 'INVESTORS', 'text-anchor="middle" letter-spacing="1"');
    const mx = x + w / 2;
    s += `<rect x="${mx - 92}" y="${y + 80}" width="184" height="26" fill="${C.ink}"/>` + t(mx, y + 97, 'm', 11, C.cream, 'REQUEST → OFFER → CHAT', 'text-anchor="middle" letter-spacing="1"');
    return s;
  },

  walkscape(x, y, w, h, fg) {
    const r = rng(11);
    let s = '';
    const rowH = 22;
    const hazards = new Set(['1-3', '2-4', '2-5', '3-8', '4-2', '4-9', '5-6', '1-11', '3-12']);
    for (let row = 0; row < 7; row++) {
      let cx = x - (row % 2 ? 18 : 0);
      let col = 0;
      while (cx < x + w) {
        const sw = 30 + r() * 16;
        const key = `${row}-${col}`;
        const x0 = Math.max(cx, x);
        const x1 = Math.min(cx + sw - 4, x + w);
        if (x1 - x0 > 6)
          s += hazards.has(key)
            ? `<rect x="${r1(x0)}" y="${y + row * rowH}" width="${r1(x1 - x0)}" height="${rowH - 4}" rx="3" fill="${C.accent}" fill-opacity="0.85"/>`
            : `<rect x="${r1(x0)}" y="${y + row * rowH}" width="${r1(x1 - x0)}" height="${rowH - 4}" rx="4" fill="${fg}" fill-opacity="${r1(0.08 + r() * 0.1)}"/>`;
        cx += sw;
        col++;
      }
    }
    s += `<path d="M${x + 6} ${y + 140}C${x + 120} ${y + 140} ${x + 120} ${y + 30} ${x + 230} ${y + 40}S${x + 330} ${y + 128} ${x + 420} ${y + 100}S${x + 500} ${y + 20} ${x + w - 8} ${y + 24}" fill="none" stroke="${C.cream}" stroke-width="7" stroke-linecap="round" stroke-opacity="0.95"/>
<path d="M${x + 6} ${y + 140}C${x + 120} ${y + 140} ${x + 120} ${y + 30} ${x + 230} ${y + 40}S${x + 330} ${y + 128} ${x + 420} ${y + 100}S${x + 500} ${y + 20} ${x + w - 8} ${y + 24}" fill="none" stroke="${C.ink}" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/>
<circle cx="${x + 6}" cy="${y + 140}" r="7" fill="${C.accent}"/><circle cx="${x + w - 8}" cy="${y + 24}" r="7" fill="${C.lime}"/>`;
    const by = y + h - 14;
    s += `<rect x="${x}" y="${by}" width="${w * 0.6}" height="8" fill="${C.lime}"/><rect x="${x + w * 0.6 + 4}" y="${by}" width="${w * 0.25}" height="8" fill="#FFB000"/><rect x="${x + w * 0.85 + 8}" y="${by}" width="${w * 0.15 - 8}" height="8" fill="${C.accent}"/>`;
    s += t(x, by - 6, 'm', 10, C.muted, 'COMFORTBAR · SURFACE QUALITY', 'letter-spacing="1"');
    return s;
  },

  napoliwalks(x, y, w, h, fg) {
    let s = '';
    const cx = x + w - 152;
    const cy = y + 100;
    for (let k = 0; k < 9; k++) {
      const R = 14 + k * 13;
      let d = '';
      for (let i = 0; i <= 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        const rr = R * (1 + 0.07 * Math.sin(3 * a + k * 0.7) + 0.04 * Math.sin(5 * a - k));
        d += `${i ? 'L' : 'M'}${r1(cx + Math.cos(a) * rr * 1.25)} ${r1(cy + Math.sin(a) * rr * 0.72)}`;
      }
      s += `<path d="${d}Z" fill="none" stroke="${k === 0 ? C.accent : fg}" stroke-opacity="${k === 0 ? 1 : r1(0.5 - k * 0.04)}"/>`;
    }
    const pts = [[x + 10, y + 160], [x + 90, y + 120], [x + 150, y + 150], [x + 220, y + 70], [x + 300, y + 96]];
    s += `<path d="M${pts.map((p) => p.join(' ')).join('L')}" fill="none" stroke="${C.accent}" stroke-width="2.5" stroke-dasharray="1 7" stroke-linecap="round"/>`;
    pts.forEach(([px, py], i) => {
      s += `<circle cx="${px}" cy="${py}" r="12" fill="${i === pts.length - 1 ? C.accent : C.ink}" stroke="${C.accent}" stroke-width="2"/>` + t(px, py + 4, 'm', 11, C.cream, String(i + 1), 'text-anchor="middle"');
    });
    s += t(x, y + 14, 'm', 10, C.muted, '40.85° N · 14.27° E', 'letter-spacing="1"');
    s += t(x, y + 30, 'm', 10, C.muted, 'GUIDE → TOUR → RESERVATION → REPORT', 'letter-spacing="1"');
    return s;
  },

  extensions(x, y, w, h, fg) {
    const bx = x;
    const bw = w - 150;
    let s = `<rect x="${bx + 0.5}" y="${y + 0.5}" width="${bw}" height="${h - 1}" fill="none" stroke="${fg}" stroke-opacity="0.5"/>
<path d="M${bx} ${y + 30}H${bx + bw}M${bx} ${y + 56}H${bx + bw}" stroke="${fg}" stroke-opacity="0.3"/>`;
    for (let i = 0; i < 3; i++) s += `<rect x="${bx + 10 + i * 96}" y="${y + 8}" width="88" height="22" fill="${i === 0 ? fg : 'none'}" fill-opacity="0.12" stroke="${fg}" stroke-opacity="0.3"/>`;
    s += `<rect x="${bx + 10}" y="${y + 36}" width="${bw - 20}" height="14" rx="7" fill="${fg}" fill-opacity="0.1"/>`;
    for (let i = 0; i < 5; i++) s += `<rect x="${bx + 16}" y="${y + 74 + i * 20}" width="${[220, 180, 240, 140, 200][i]}" height="6" fill="${fg}" fill-opacity="0.16"/>`;
    s += `<g transform="rotate(5 ${bx + bw - 70} ${y + 110})"><rect x="${bx + bw - 140}" y="${y + 62}" width="132" height="104" fill="${C.accent}"/>
<path d="M${bx + bw - 126} ${y + 92}H${bx + bw - 24}M${bx + bw - 126} ${y + 110}H${bx + bw - 40}M${bx + bw - 126} ${y + 128}H${bx + bw - 56}" stroke="${C.ink}" stroke-width="2"/>
${t(bx + bw - 126, y + 80, 'm', 10, C.ink, 'NOTE · THIS URL')}</g>`;
    const kx = x + w - 130;
    s += `<rect x="${kx}" y="${y + 6}" width="58" height="40" rx="4" fill="none" stroke="${fg}" stroke-opacity="0.7"/>${t(kx + 29, y + 32, 'm', 13, fg, 'Alt', 'text-anchor="middle"')}`;
    s += t(kx + 70, y + 32, 'm', 14, C.muted, '+');
    s += `<rect x="${kx + 84}" y="${y + 6}" width="46" height="40" rx="4" fill="none" stroke="${fg}" stroke-opacity="0.7"/>${t(kx + 107, y + 32, 'm', 13, fg, 'N', 'text-anchor="middle"')}`;
    s += `<rect x="${kx}" y="${y + 70}" width="130" height="${h - 70}" fill="${C.ink}" stroke="${C.accent}"/>
${t(kx + 65, y + 104, 'm', 10, C.accent, 'IDLE FOR', 'text-anchor="middle" letter-spacing="2"')}
${t(kx + 65, y + 140, 'd', 30, C.cream, '05:00', 'text-anchor="middle"')}
${t(kx + 65, y + 160, 'm', 9, C.muted, 'BACK TO WORK', 'text-anchor="middle" letter-spacing="1"')}`;
    return s;
  },

  lms(x, y, w, h, fg) {
    let s = '';
    const cols = 5;
    const tw = 88;
    const th = 40;
    const gap = (w - cols * tw) / (cols - 1);
    for (let row = 0; row < 3; row++) {
      s += t(x, y + 12 + row * 58, 'm', 9, C.muted, `MODULE 0${row + 1}`, 'letter-spacing="1"');
      for (let c = 0; c < cols; c++) {
        const tx = x + c * (tw + gap);
        const ty = y + 18 + row * 58;
        const done = row * cols + c < 8;
        const cur = row * cols + c === 8;
        s += `<rect x="${tx + 0.5}" y="${ty + 0.5}" width="${tw - 1}" height="${th - 1}" fill="${done ? C.accent : 'none'}" fill-opacity="${done ? 0.9 : 0}" stroke="${cur ? C.accent : fg}" stroke-opacity="${cur ? 1 : 0.35}"${cur ? ' stroke-width="2"' : ''}/>`;
        s += `<rect x="${tx + 8}" y="${ty + 10}" width="${tw - 30}" height="5" fill="${done ? C.ink : fg}" fill-opacity="${done ? 0.7 : 0.25}"/>`;
        s += `<rect x="${tx + 8}" y="${ty + 24}" width="${(tw - 16) * (done ? 1 : cur ? 0.45 : 0)}" height="4" fill="${done ? C.ink : C.accent}"/>`;
        if (c < cols - 1) s += `<path d="M${tx + tw} ${ty + th / 2}H${tx + tw + gap}" stroke="${fg}" stroke-opacity="0.25"/>`;
      }
    }
    return s;
  },

  hmi(x, y, w, h, fg) {
    const gx = x + 90;
    const gy = y + 120;
    let s = `<path d="M${gx - 80} ${gy}A80 80 0 0 1 ${gx + 80} ${gy}" fill="none" stroke="${fg}" stroke-opacity="0.3" stroke-width="10"/>
<path d="M${gx - 80} ${gy}A80 80 0 0 1 ${r1(gx + 80 * Math.cos(Math.PI * 1.32))} ${r1(gy + 80 * Math.sin(Math.PI * 1.32))}" fill="none" stroke="${C.accent}" stroke-width="10"/>`;
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI + (i / 10) * Math.PI;
      s += `<path d="M${r1(gx + Math.cos(a) * 62)} ${r1(gy + Math.sin(a) * 62)}L${r1(gx + Math.cos(a) * 70)} ${r1(gy + Math.sin(a) * 70)}" stroke="${fg}" stroke-opacity="0.6"/>`;
    }
    const na = Math.PI * 1.32;
    s += `<path d="M${gx} ${gy}L${r1(gx + Math.cos(na) * 58)} ${r1(gy + Math.sin(na) * 58)}" stroke="${fg}" stroke-width="2.5"/><circle cx="${gx}" cy="${gy}" r="5" fill="${fg}"/>`;
    s += t(gx, gy + 32, 'm', 10, C.muted, 'SIMULATED', 'text-anchor="middle" letter-spacing="2"');
    // trend line
    const tx = x + 210;
    let d = '';
    for (let i = 0; i <= 40; i++) d += `${i ? 'L' : 'M'}${r1(tx + i * 4)} ${r1(y + 70 - Math.sin(i / 4) * 16 - (i > 30 ? (i - 30) * 3 : 0))}`;
    s += `<path d="M${tx} ${y + 20}V${y + 100}H${tx + 160}" fill="none" stroke="${fg}" stroke-opacity="0.3"/><path d="${d}" fill="none" stroke="${C.accent}" stroke-width="1.8"/>
<path d="M${tx} ${y + 44}H${tx + 160}" stroke="${C.accent}" stroke-opacity="0.6" stroke-dasharray="4 4"/>`;
    // alarm stack with redacted labels
    const ax = x + w - 160;
    for (let i = 0; i < 5; i++) {
      const ay = y + 6 + i * 30;
      s += `<rect x="${ax}" y="${ay}" width="160" height="24" fill="${fg}" fill-opacity="0.06" stroke="${fg}" stroke-opacity="0.18"/>
<rect x="${ax + 8}" y="${ay + 7}" width="10" height="10" fill="${i === 0 ? C.accent : i < 3 ? C.amber : C.muted}"/>
<rect x="${ax + 28}" y="${ay + 8}" width="${[96, 74, 110, 64, 88][i]}" height="8" fill="${fg}" fill-opacity="0.85"/>`;
    }
    s += t(ax, y + 166, 'm', 10, C.muted, 'ALARM LABELS REDACTED', 'letter-spacing="1"');
    s += t(tx, y + 120, 'm', 10, C.muted, 'TREND · FIRST-OUT', 'letter-spacing="1"');
    // tiny isometric twin
    const ix = x + 236;
    const iy = y + 162;
    s += `<path d="M${ix} ${iy}l30 -14l30 14l-30 14zM${ix} ${iy}v-16l30 -14l30 14v16M${ix + 30} ${iy - 30}v14" fill="none" stroke="${fg}" stroke-opacity="0.6"/>`;
    return s;
  },
};

/* ───────────────────────── CARDS ───────────────────────── */

function projectCard(p, i, theme) {
  const W = 600;
  const H = 420;
  const dark = theme === 'dark';
  const bg = dark ? C.ink : C.cream;
  const fg = dark ? C.cream : C.ink;
  const n = String(i + 1).padStart(2, '0');
  const art = ART[p.id](32, 76, W - 64, 186, fg);
  return svgDoc({
    w: W,
    h: H,
    title: `${p.name} — ${p.status.label}`,
    desc: `${p.tagline} ${p.desc} Built with ${p.tech.join(', ')}.`,
    fonts: ['display', 'mono'],
    body: `<rect width="${W}" height="${H}" fill="${bg}"/>
${dark ? grid(W, H, 30, C.cream, 0.035) : ''}
${t(32, 37, 'm', 13, accentText(fg), 'P.' + n, 'letter-spacing="1"')}
${t(80, 37, 'm', 12, C.muted, '/' + p.repo)}
${chip(W - 32, 20, p.status.label, p.status.kind, fg)}
<path d="M32 58H${W - 32}" stroke="${fg}" stroke-opacity="0.15"/>
${art}
<path d="M32 280H${W - 32}" stroke="${fg}" stroke-opacity="0.15"/>
${t(30, 328, 'd', 44, fg, p.name, 'letter-spacing="-1.5"')}
${t(32, 356, 'm', 13, dark ? C.cream2 : '#3C3A34', p.tagline)}
${tagRow(32, 374, p.chips, fg)}
${t(W - 32, 393, 'd', 24, accentText(fg), '↗', 'text-anchor="end"')}`,
  });
}

function workCard(wk, theme) {
  const W = 600;
  const H = 470;
  const dark = theme === 'dark';
  const bg = dark ? C.ink : C.cream;
  const fg = dark ? C.cream : C.ink;
  const lines = wrap(wk.body, 62);
  return svgDoc({
    w: W,
    h: H,
    title: `${wk.title.join(' ')} — private work`,
    desc: `${wk.body} Private work at ${EMPLOYER.org}; the artwork is conceptual and shows no real interface or data.`,
    fonts: ['display', 'mono'],
    body: `<rect width="${W}" height="${H}" fill="${bg}"/>
${dark ? grid(W, H, 30, C.cream, 0.035) : ''}
<path d="M0 0H${W}V${H}H0Z" fill="none" stroke="${C.accent}" stroke-width="2" stroke-dasharray="10 6"/>
${t(32, 37, 'm', 13, accentText(fg), wk.code, 'letter-spacing="1"')}
${t(84, 37, 'm', 12, C.muted, EMPLOYER.org)}
${chip(W - 32, 20, 'PRIVATE', 'private', fg)}
<path d="M32 58H${W - 32}" stroke="${fg}" stroke-opacity="0.15"/>
${ART[wk.id](32, 78, W - 64, 168, fg)}
<path d="M32 262H${W - 32}" stroke="${fg}" stroke-opacity="0.15"/>
${t(30, 304, 'd', 34, fg, wk.title[0], 'letter-spacing="-1"')}
${t(30, 340, 'd', 34, fg, wk.title[1], 'letter-spacing="-1"')}
${lines.map((l, k) => t(32, 370 + k * 18, 'm', 13, dark ? C.cream2 : '#3C3A34', l)).join('')}
${tagRow(32, 404, wk.tags, fg)}
${t(32, 450, 'm', 10, C.muted, wk.note + ' — NO REAL UI OR DATA SHOWN', 'letter-spacing="1"')}`,
  });
}

function employerCard() {
  const W = 1200;
  const H = 280;
  const ax0 = 540;
  const ax1 = 1100;
  const mx = (m) => ax0 + ((m - 1) / 12) * (ax1 - ax0);
  const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  let axis = `<path d="M${ax0} 236H${ax1 + 50}" stroke="${C.ink}" stroke-opacity="0.4"/>`;
  MONTHS.forEach((m, i) => {
    const x = mx(i + 1);
    axis += `<path d="M${x} 230V242" stroke="${C.ink}" stroke-opacity="0.4"/>` + t(x + 4, 258, 'm', 11, C.muted, m);
  });
  axis += t(ax0, 274, 'm', 10, C.muted, '2026', 'letter-spacing="1"');
  const bars = EMPLOYER.roles
    .map((r, i) => {
      const y = 84 + i * 76;
      const x = mx(r.start[1]);
      const col = i === 0 ? C.accent : C.ink;
      return `${t(x, y - 12, 'd', 22, C.ink, r.title)}
${t(x + 10, y + 32, 'm', 11, C.muted, r.label + ' · ' + r.meta.toUpperCase(), 'letter-spacing="0.5"')}
<rect x="${x}" y="${y}" width="${ax1 + 30 - x}" height="14" fill="${col}"/>
<path d="M${ax1 + 30} ${y - 4}L${ax1 + 46} ${y + 7}L${ax1 + 30} ${y + 18}Z" fill="${col}"/>
<path d="M${x - 6} 224H${x + 6}L${x} 234Z" fill="${col}"/>`;
    })
    .join('');
  return svgDoc({
    w: W,
    h: H,
    title: `${EMPLOYER.org} (${EMPLOYER.group}) — current roles`,
    desc: `Employment at ${EMPLOYER.org} (${EMPLOYER.group}), ${EMPLOYER.place}: ${EMPLOYER.roles.map((r) => `${r.title}, ${r.meta}, ${r.label.toLowerCase()}`).join('; ')}. Source: LinkedIn.`,
    fonts: ['display', 'mono'],
    body: `<rect width="${W}" height="${H}" fill="${C.cream}"/>
${t(40, 48, 'm', 12, C.accentDeep, 'EMPLOYMENT', 'letter-spacing="2"')}
${t(36, 118, 'd', 60, C.ink, EMPLOYER.org, 'letter-spacing="-2"')}
${t(40, 150, 'm', 14, C.ink, EMPLOYER.group + ' · ' + EMPLOYER.place)}
<rect x="40" y="176" width="40" height="6" fill="${C.accent}"/>
${t(40, 258, 'm', 10, C.muted, 'SOURCE: LINKEDIN PROFILE · AS OF 2026-10', 'letter-spacing="1"')}
<path d="M500 32V250" stroke="${C.ink}" stroke-opacity="0.15"/>
${axis}
${bars}`,
  });
}

function stackCard() {
  const W = 1200;
  const rowH = 104;
  const top = 64;
  const H = top + STACK.length * rowH + 40;
  let rows = '';
  STACK.forEach((g, i) => {
    const y = top + i * rowH;
    rows += `<path d="M40 ${y}H${W - 40}" stroke="${C.ink}" stroke-opacity="0.15"/>`;
    rows += t(40, y + 36, 'm', 11, C.accentDeep, `0${i + 1}`, 'letter-spacing="1"') + t(70, y + 36, 'm', 12, C.ink, g.group, 'letter-spacing="1.5"');
    g.items.forEach(([file, label], j) => {
      const x = 340 + j * 136;
      rows += `<image href="${icon(file)}" x="${x}" y="${y + 16}" width="56" height="56"/>` + t(x + 28, y + 90, 'm', 11, C.ink, label, 'text-anchor="middle"');
    });
  });
  const all = STACK.flatMap((g) => g.items.map((it) => it[1]));
  return svgDoc({
    w: W,
    h: H,
    title: 'Technology stack',
    desc: `Technologies used in the public repositories: ${STACK.map((g) => `${g.group.toLowerCase()}: ${g.items.map((i) => i[1]).join(', ')}`).join('; ')}.`,
    fonts: ['mono'],
    body: `<rect width="${W}" height="${H}" fill="${C.cream}"/>
${t(40, 40, 'm', 12, C.ink, 'ONLY WHAT SHIPS IN PUBLIC CODE · ' + all.length + ' TOOLS', 'letter-spacing="1.5"')}
${t(W - 40, 40, 'm', 12, C.muted, 'ICONS: SKILL ICONS (MIT)', 'text-anchor="end" letter-spacing="1"')}
${rows}
<path d="M40 ${H - 40}H${W - 40}" stroke="${C.ink}" stroke-opacity="0.15"/>
<rect x="40" y="${H - 22}" width="40" height="6" fill="${C.accent}"/>`,
  });
}

function footer() {
  const W = 1200;
  const H = 380;
  const m = moleFrame(20, { cx: 1080, ground: 300, scale: 1.45 });
  const [l1, l2, l3] = PROFILE.bio;
  return svgDoc({
    w: W,
    h: H,
    title: 'Contact',
    desc: `Footer with the bio line "${PROFILE.bio.join(' ')}" and contact addresses: ${PROFILE.websiteLabel}, LinkedIn ${PROFILE.linkedinLabel}, GitHub ${PROFILE.login}.`,
    fonts: ['display', 'mono'],
    body: `<rect width="${W}" height="${H}" fill="${C.ink}"/>
${grid(W, H, 40, C.cream, 0.035)}
<rect width="${W}" height="8" fill="${C.accent}"/>
${t(40, 56, 'm', 12, C.accent, '§05 / CONTACT', 'letter-spacing="2"')}
${t(36, 132, 'd', 64, C.cream, l1, 'letter-spacing="-2"')}
${t(36, 200, 'd', 64, C.cream, l2, 'letter-spacing="-2"')}
${t(36, 268, 'd', 64, C.accent, l3, 'letter-spacing="-2"')}
${t(40, 300, 'm', 11, C.muted, '— GITHUB BIO', 'letter-spacing="1.5"')}
<path d="M700 90V300" stroke="${C.line}"/>
${[
  ['WEB', PROFILE.websiteLabel],
  ['IN', PROFILE.linkedinLabel],
  ['GH', 'github.com/' + PROFILE.login],
  ['LOC', 'Torino, Italy'],
]
  .map(([k, v], i) => t(730, 128 + i * 44, 'm', 11, C.accent, k, 'letter-spacing="1.5"') + t(776, 128 + i * 44, 'm', 15, C.cream, v))
  .join('')}
<path d="${m.body}" fill="none" stroke="${C.cream}" stroke-opacity="0.45" stroke-width="0.9"/>
<path d="${m.spire}" fill="none" stroke="${C.accent}" stroke-width="1.1"/>
<path d="M40 330H${W - 40}" stroke="${C.line}"/>
${t(40, 356, 'm', 11, C.muted, `© ${PROFILE.rev.slice(0, 4)} ${PROFILE.first} ${PROFILE.last} · TORINO`, 'letter-spacing="1"')}
${t(W - 40, 356, 'm', 11, C.muted, 'SET IN SPACE GROTESK + JETBRAINS MONO (OFL) · ICONS: SKILL ICONS (MIT)', 'text-anchor="end" letter-spacing="0.5"')}`,
  });
}

/* ───────────────────────── BUILD ───────────────────────── */

export const TYPING_LINES = [
  'DevOps · web · cloud — building from Torino',
  'Next.js + Supabase, shipped on Vercel & Cloudflare',
  'Currently: LMS & web interfaces @ inRebus',
  'Source every claim. Ship small. Iterate.',
];

if (process.argv[1] && process.argv[1].endsWith('build-assets.mjs')) {
  console.log('build-assets:');
  out('hero.svg', hero({ animated: true }));
  out('hero-static.svg', hero({ animated: false }));
  out('ui/intro-static.svg', typingStatic(TYPING_LINES[0]));
  out('ui/btn-website.svg', button('website', 'WEBSITE', PROFILE.websiteLabel));
  out('ui/btn-linkedin.svg', button('linkedin', 'LINKEDIN', PROFILE.linkedinLabel));
  out('ui/btn-github.svg', button('github', 'GITHUB', '@' + PROFILE.login));
  out('ui/sec-01-work.svg', sectionHeader('01', 'WORK', 'inRebus srl · private work, described at a high level'));
  out('ui/sec-02-projects.svg', sectionHeader('02', 'SELECTED PROJECTS', 'public repositories · status as of 2026-10'));
  out('ui/sec-03-stack.svg', sectionHeader('03', 'STACK', 'verified in package.json & imports'));
  out('ui/sec-04-signal.svg', sectionHeader('04', 'SIGNAL', 'public contribution calendar · refreshed daily'));
  out('work/employer.svg', employerCard());
  WORK.forEach((wk, i) => out(`work/${wk.id}.svg`, workCard(wk, i === 0 ? 'light' : 'dark')));
  // checkerboard across the 2-column grid
  PROJECTS.forEach((p, i) => out(`projects/${p.id}.svg`, projectCard(p, i, [0, 3, 4].includes(i) ? 'dark' : 'light')));
  out('stack.svg', stackCard());
  out('footer.svg', footer());
}
