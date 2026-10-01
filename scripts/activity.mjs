// Refreshes data/activity.json and assets/activity.svg from the public
// contribution calendar at github.com/users/<login>/contributions.
//
//   node scripts/activity.mjs                 fetch + validate + render
//   node scripts/activity.mjs --render-only   re-render from data/activity.json
//   node scripts/activity.mjs --from-file x   parse a saved calendar HTML file
//
// No token is needed: the calendar is public HTML. If the fetch, parse or any
// sanity check fails, the script exits non-zero BEFORE touching either file,
// so the last valid image stays in place.

import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, C, svgDoc, t, grid, r1 } from './lib/svg.mjs';

const LOGIN = process.env.PROFILE_LOGIN || 'AMIRAK-code';
const DATA = join(ROOT, 'data', 'activity.json');
const OUT = join(ROOT, 'assets', 'activity.svg');

function fail(msg) {
  console.error(`activity: ${msg} — existing files left unchanged.`);
  process.exit(1);
}

export function parseCalendar(html) {
  const days = new Map(); // component id -> date
  for (const m of html.matchAll(/<td\b[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*\bid="(contribution-day-component-\d+-\d+)"[^>]*>/g)) {
    days.set(m[2], m[1]);
  }
  const counts = new Map(); // date -> count
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="(contribution-day-component-\d+-\d+)"[^>]*>([^<]*)</g)) {
    const date = days.get(m[1]);
    if (!date) continue;
    const text = m[2].trim();
    const n = /^No contributions/i.test(text) ? 0 : Number((text.match(/^([\d,]+)\s+contributions?/i) || [])[1]?.replace(/,/g, ''));
    if (!Number.isFinite(n)) throw new Error(`unreadable tooltip "${text}"`);
    counts.set(date, n);
  }
  const heading = html.match(/js-contribution-activity-description[^>]*>\s*([\d,]+)\s+contributions?/);
  const reportedTotal = heading ? Number(heading[1].replace(/,/g, '')) : null;
  const list = [...counts.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([date, count]) => ({ date, count }));
  return { days: list, reportedTotal };
}

export function validate({ days, reportedTotal }) {
  if (days.length < 360 || days.length > 372) throw new Error(`expected ~1 year of days, got ${days.length}`);
  for (let i = 1; i < days.length; i++) {
    const gap = (Date.parse(days[i].date) - Date.parse(days[i - 1].date)) / 864e5;
    if (gap !== 1) throw new Error(`calendar not contiguous at ${days[i].date}`);
  }
  const sum = days.reduce((s, d) => s + d.count, 0);
  if (reportedTotal !== null && sum !== reportedTotal) throw new Error(`day sum ${sum} != reported total ${reportedTotal}`);
}

function summarise(days) {
  const weeks = [];
  for (const d of days) {
    const dow = new Date(d.date + 'T00:00:00Z').getUTCDay();
    if (!weeks.length || dow === 0) weeks.push({ start: d.date, days: [] });
    weeks[weeks.length - 1].days.push({ ...d, dow });
  }
  for (const w of weeks) w.total = w.days.reduce((s, d) => s + d.count, 0);
  const total = days.reduce((s, d) => s + d.count, 0);
  const active = days.filter((d) => d.count > 0).length;
  const peak = weeks.reduce((a, b) => (b.total > a.total ? b : a), weeks[0]);
  const last30 = days.slice(-30).reduce((s, d) => s + d.count, 0);
  const peakDay = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);
  return { weeks, total, active, peak, last30, peakDay };
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function renderActivity(data) {
  const { days, login, snapshotUtc } = data;
  const s = summarise(days);
  const W = 1200;
  const H = 440;
  const x0 = 360;
  const x1 = 1160;
  const colW = (x1 - x0) / s.weeks.length;
  const base = 232; // baseline of the weekly trace
  const amp = 132;
  const maxW = Math.max(1, ...s.weeks.map((w) => w.total));
  const maxD = Math.max(1, ...days.map((d) => d.count));
  const scale = (v, max) => Math.sqrt(v) / Math.sqrt(max);

  let bars = '';
  let trace = '';
  let cells = '';
  let months = '';
  s.weeks.forEach((w, i) => {
    const cx = r1(x0 + i * colW + colW / 2);
    const hgt = r1(scale(w.total, maxW) * amp);
    if (w.total > 0) {
      bars += `<rect x="${r1(cx - 2.5)}" y="${r1(base - hgt)}" width="5" height="${hgt}" fill="${w === s.peak ? C.accent : C.cream}" fill-opacity="${w === s.peak ? 1 : 0.86}" class="bar" style="animation-delay:${(i * 18) | 0}ms"/>`;
    } else {
      bars += `<rect x="${r1(cx - 2.5)}" y="${base - 1}" width="5" height="2" fill="${C.muted}" fill-opacity="0.5"/>`;
    }
    trace += `${i ? 'L' : 'M'}${cx} ${r1(base - hgt)}`;
    for (const d of w.days) {
      const cy = base + 26 + d.dow * 11;
      if (d.count === 0) cells += `<rect x="${r1(cx - 1)}" y="${cy - 1}" width="2" height="2" fill="${C.muted}" fill-opacity="0.45"/>`;
      else {
        const k = scale(d.count, maxD);
        const sz = r1(3 + k * 5);
        cells += `<rect x="${r1(cx - sz / 2)}" y="${r1(cy - sz / 2)}" width="${sz}" height="${sz}" fill="${C.accent}" fill-opacity="${r1(0.45 + k * 0.55)}"/>`;
      }
    }
    const first = w.days.find((d) => d.date.endsWith('-01'));
    if (first && i < s.weeks.length - 2) {
      const mo = Number(first.date.slice(5, 7)) - 1;
      months += `<path d="M${cx} ${base + 104}v8" stroke="${C.muted}"/>` + t(cx + 4, base + 116, 'm', 11, C.muted, MONTHS[mo] + (mo === 0 ? ' ' + first.date.slice(2, 4) : ''));
    }
  });

  const first = days[0].date;
  const last = days[days.length - 1].date;
  const fmt = (d) => d; // ISO dates are the clearest label here
  const stat = (y, label, value, note, accent) =>
    t(40, y, 'm', 11, C.muted, label, 'letter-spacing="1.5"') +
    t(40, y + 40, 'd', 42, accent ? C.accent : C.cream, value, 'letter-spacing="-1.5"') +
    (note ? t(40, y + 60, 'm', 11, C.muted, note) : '');

  const css = `
.bar{transform-box:fill-box;transform-origin:50% 100%;animation:rise .7s cubic-bezier(.2,.8,.2,1) backwards}
@keyframes rise{from{transform:scaleY(0)}}
.trace{stroke-dasharray:2400;animation:draw 2.4s .4s ease-out backwards}
@keyframes draw{from{stroke-dashoffset:2400}}
.blink{animation:blink 1.4s steps(2,start) infinite}
@keyframes blink{to{visibility:hidden}}`;

  const body = `
<rect width="${W}" height="${H}" fill="${C.ink}"/>
${grid(W, H, 40, C.cream, 0.035)}
<path d="M320 28V${H - 70}" stroke="${C.line}"/>
${t(40, 44, 'm', 12, C.accent, '§04 / SIGNAL', 'letter-spacing="2"')}
${t(x0, 44, 'm', 12, C.cream, 'PUBLIC CONTRIBUTION CALENDAR — ' + login, 'letter-spacing="1.5"')}
<circle cx="${W - 236}" cy="40" r="4" fill="${C.accent}" class="blink"/>
${t(W - 224, 44, 'm', 12, C.cream, 'SNAPSHOT ' + snapshotUtc.slice(0, 10) + ' UTC', 'letter-spacing="1"')}
${stat(80, 'TOTAL · 12 MONTHS', String(s.total), null, true)}
${stat(160, 'ACTIVE DAYS', `${s.active}/${days.length}`, null)}
${stat(240, 'PEAK WEEK', String(s.peak.total), 'week of ' + s.peak.start)}
${t(40, 334, 'm', 11, C.muted, 'LAST 30 DAYS', 'letter-spacing="1.5"')}${t(200, 334, 'm', 11, C.cream, String(s.last30))}
<path d="M${x0} ${base}H${x1}" stroke="${C.muted}" stroke-opacity="0.6"/>
${t(x0, 74, 'm', 11, C.muted, 'WEEKLY TOTAL (√ SCALE) · MAX ' + maxW)}
${t(x1, 74, 'm', 11, C.muted, 'PEAK DAY ' + s.peakDay.date + ' · ' + s.peakDay.count, 'text-anchor="end"')}
${bars}
<path d="${trace}" class="trace" fill="none" stroke="${C.accent}" stroke-width="1.25" stroke-opacity="0.85"/>
${t(x0 - 12, base + 30, 'm', 9, C.muted, 'SUN', 'text-anchor="end"')}
${t(x0 - 12, base + 96, 'm', 9, C.muted, 'SAT', 'text-anchor="end"')}
${cells}
${months}
<path d="M0 ${H - 54}H${W}" stroke="${C.line}"/>
${t(40, H - 30, 'm', 11, C.muted, `SCOPE  github.com/${login} · calendar ${fmt(first)} → ${fmt(last)}`)}
${t(40, H - 14, 'm', 11, C.muted, 'Counts as GitHub shows them publicly; private work appears only if the owner enabled anonymous private contributions.')}
${t(W - 40, H - 22, 'm', 11, C.accent, 'AUTO-REFRESHED', 'text-anchor="end" letter-spacing="1.5"')}`;

  return svgDoc({
    w: W,
    h: H,
    title: `GitHub contribution activity for ${login}`,
    desc: `${s.total} contributions between ${first} and ${last}, ${s.active} active days, peak week of ${s.peak.start} with ${s.peak.total}. Snapshot ${snapshotUtc}.`,
    fonts: ['display', 'mono'],
    css,
    body,
  });
}

// One day per line keeps the daily commit diff readable.
function toJson({ days, ...meta }) {
  const head = JSON.stringify(meta, null, 2).slice(0, -2);
  return `${head},\n  "days": [\n${days.map((d) => '    ' + JSON.stringify(d)).join(',\n')}\n  ]\n}\n`;
}

function writeAtomic(path, content) {
  const tmp = path + '.tmp';
  writeFileSync(tmp, content);
  renameSync(tmp, path);
}

async function main() {
  const args = process.argv.slice(2);
  let data;
  if (args.includes('--render-only')) {
    data = JSON.parse(readFileSync(DATA, 'utf8'));
  } else {
    let html;
    const fromFile = args[args.indexOf('--from-file') + 1];
    if (args.includes('--from-file')) html = readFileSync(fromFile, 'utf8');
    else {
      const res = await fetch(`https://github.com/users/${LOGIN}/contributions`, {
        headers: { 'user-agent': `${LOGIN}-profile-readme`, accept: 'text/html' },
        signal: AbortSignal.timeout(20000),
      }).catch((e) => fail(`network error: ${e.message}`));
      if (!res.ok) fail(`HTTP ${res.status}`);
      html = await res.text();
    }
    let parsed;
    try {
      parsed = parseCalendar(html);
      validate(parsed);
    } catch (e) {
      fail(e.message);
    }
    data = {
      login: LOGIN,
      source: `https://github.com/users/${LOGIN}/contributions`,
      snapshotUtc: new Date().toISOString().slice(0, 16) + 'Z',
      reportedTotal: parsed.reportedTotal,
      days: parsed.days,
    };
  }
  let svg;
  try {
    svg = renderActivity(data);
  } catch (e) {
    fail(`render error: ${e.message}`);
  }
  // Data first, image second; both are complete before either is replaced.
  if (!args.includes('--render-only')) writeAtomic(DATA, toJson(data));
  writeAtomic(OUT, svg);
  const total = data.days.reduce((s, d) => s + d.count, 0);
  console.log(`activity: ${data.days.length} days, ${total} contributions, snapshot ${data.snapshotUtc}`);
}

main();
