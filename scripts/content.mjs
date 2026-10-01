// All profile copy in one place. Every claim here was checked on 2026-10-01
// against the public repositories (code, package.json, READMEs) and the
// LinkedIn details supplied by the owner. Keep it that way: no invented numbers.

const GH = 'https://github.com/AMIRAK-code';

export const PROFILE = {
  login: 'AMIRAK-code',
  first: 'AMIRHOSSEIN',
  last: 'AKBARI',
  city: 'TORINO, IT',
  coords: '45.0690° N · 7.6932° E',
  rev: '2026.10',
  roles: ['DEVOPS', 'WEB DEVELOPMENT', 'CLOUD ENGINEERING'],
  heroNote: 'LMS & web developer at inRebus (Gruppo FOS) · Computer Engineering, Politecnico di Torino',
  website: 'https://www.amircodess.com',
  websiteLabel: 'amircodess.com',
  linkedin: 'https://www.linkedin.com/in/amirhossein-akbari-9075b3360',
  linkedinLabel: 'in/amirhossein-akbari',
  github: GH,
  bio: ['fresh in the game,', 'eager to learn,', 'not here for fame.'],
};

// Employment as listed on LinkedIn (screenshot supplied by the owner).
export const EMPLOYER = {
  org: 'inRebus srl',
  group: 'Gruppo FOS',
  place: 'Turin, Piedmont, Italy',
  roles: [
    { title: 'LMS & Web Developer', meta: 'Full-time · Hybrid', start: [2026, 7], label: 'JUL 2026 — PRESENT' },
    { title: 'Web Development Intern', meta: 'Part-time · On-site', start: [2026, 3], label: 'MAR 2026 — PRESENT' },
  ],
};

// Private work: high-level only, conceptual artwork, no links.
export const WORK = [
  {
    id: 'lms',
    code: 'W.01',
    title: ['Learning platforms', '& web interfaces'],
    body: 'Responsive, dynamic interfaces in React and Next.js for LMS and web products.',
    tags: ['REACT', 'NEXT.JS', 'LMS'],
    note: 'PRIVATE · CONCEPTUAL ARTWORK',
  },
  {
    id: 'hmi',
    code: 'W.02',
    title: ['Control-room HMI', '& digital twin'],
    body: 'Operator-console prototype: 3D twin, role-guarded commands and alarm handling, on simulated telemetry.',
    tags: ['VITE MICRO-FRONTENDS', 'THREE.JS', 'VITEST'],
    note: 'PRIVATE · PROTOTYPE · CONCEPTUAL ARTWORK',
  },
];

// status.kind drives the chip colour: live | mvp | prototype | course | tool
export const PROJECTS = [
  {
    id: 'examer',
    name: 'Examer',
    repo: 'EXAMassist',
    live: 'https://exa-massist.vercel.app',
    status: { kind: 'live', label: 'LIVE · IN DEVELOPMENT' },
    tagline: 'Admission-test practice that only states what it can source.',
    desc: 'Practice platform for the Bocconi test, SAT, ACT, LSAT, GMAT, GRE, PoliTo TIL and CISIA TOLC. Eleven versioned exam configurations, each rule traced to the test maker’s own pages, an original question bank, and a server-side AI tutor on the Claude API.',
    tech: ['Next.js', 'TypeScript', 'PostgreSQL / SQLite', 'Claude API', 'Vitest', 'Playwright'],
    chips: ['NEXT.JS', 'TS', 'POSTGRES', 'CLAUDE API'],
  },
  {
    id: 'techcert',
    name: 'techCert',
    repo: 'TEchCERT',
    live: 'https://techcert.assist365.app',
    status: { kind: 'live', label: 'LIVE' },
    tagline: 'Hands-on AI certification courses with verifiable credentials.',
    desc: 'Two courses — AI Prompt Engineer and AI Security Professional — with interactive labs, a timed exam and certificates checked server-side. Deployed to Cloudflare Workers, with lint, build and database tests in GitHub Actions.',
    tech: ['React', 'Vite', 'Supabase', 'Cloudflare Workers', 'GitHub Actions'],
    chips: ['REACT', 'SUPABASE', 'CF WORKERS', 'CI'],
  },
  {
    id: 'fundable',
    name: 'Fundable',
    repo: 'fundable-mvp-t1',
    live: 'https://fundable-mvp-t1.vercel.app',
    status: { kind: 'mvp', label: 'LIVE MVP' },
    tagline: 'Founders and investors: feed, requests, offers, chat.',
    desc: 'Founder–investor matching MVP with role-specific profiles, connection requests and offers, message rooms, and web-push notifications, on Supabase auth and Postgres.',
    tech: ['Next.js', 'TypeScript', 'Supabase', 'Web Push', 'shadcn/ui'],
    chips: ['NEXT.JS', 'SUPABASE', 'WEB PUSH'],
  },
  {
    id: 'walkscape',
    name: 'WalkScape',
    repo: 'walkscape',
    status: { kind: 'prototype', label: 'PROTOTYPE · MOCK DATA' },
    tagline: 'Surface-aware walking routes, launch city Milan.',
    desc: 'Expo / React Native prototype that routes around cobblestones, grates and wet pavement. Thirteen screens on fixture data and an SVG mock map; Supabase and Mapbox are stubbed.',
    tech: ['Expo', 'React Native', 'TypeScript', 'Zustand'],
    chips: ['EXPO', 'REACT NATIVE', 'ZUSTAND'],
  },
  {
    id: 'napoliwalks',
    name: 'Napoli Walks',
    repo: 'napoliwalks',
    status: { kind: 'course', label: 'COURSE PROJECT' },
    tagline: 'Free walking tours in Naples: tours, bookings, reports.',
    desc: 'Exam project for Introduction to Web Applications: guides publish tours, participants reserve places, and guides file post-tour reports. Server-rendered Flask with SQLite.',
    tech: ['Python', 'Flask', 'Flask-Login', 'SQLite', 'Jinja'],
    chips: ['FLASK', 'SQLITE', 'JINJA'],
  },
  {
    id: 'extensions',
    name: 'Browser extensions',
    repo: 'StickyNOte-broswerExtenstion',
    repo2: 'idle-monitor-alert',
    status: { kind: 'tool', label: 'TOOLS · LOAD UNPACKED' },
    tagline: 'Tab Sticky Notes + Back to Work Auditor.',
    desc: 'Two Manifest V3 Chrome extensions in vanilla JavaScript: per-URL sticky notes toggled with Alt+N, and an idle monitor that locks the tab with an overlay and chime. Both isolate their UI in Shadow DOM.',
    tech: ['JavaScript', 'Chrome MV3', 'Shadow DOM'],
    chips: ['JS', 'MANIFEST V3', 'SHADOW DOM'],
  },
];

export const WORKSHOP = [
  { name: 'Dumb Chess', repo: 'DUMB-CHESS-v1.0-beta', note: 'chess variant with friendly fire · Express + Pug' },
  { name: 'Air hockey', repo: 'camera-vision-air-hocky-v1.0', note: 'hand-tracked two-player game · OpenCV + MediaPipe' },
  { name: 'Wine Pairer', repo: 'WinePairer', note: 'offline pairing lookup · Tkinter + pandas' },
  { name: 'REfluenz', repo: 'REfluenz-app', note: 'creator-platform UI on a mock API · React' },
];

// Only technologies that appear in the public code (package.json / imports).
export const STACK = [
  { group: 'LANGUAGES', items: [['TypeScript', 'TypeScript'], ['JavaScript', 'JavaScript'], ['Python-Dark', 'Python'], ['HTML', 'HTML'], ['CSS', 'CSS']] },
  { group: 'FRONTEND', items: [['React-Dark', 'React'], ['NextJS-Dark', 'Next.js'], ['Vite-Dark', 'Vite'], ['TailwindCSS-Dark', 'Tailwind'], ['ThreeJS-Dark', 'Three.js']] },
  { group: 'BACKEND & DATA', items: [['NodeJS-Dark', 'Node.js'], ['ExpressJS-Dark', 'Express'], ['Flask-Dark', 'Flask'], ['PostgreSQL-Dark', 'Postgres'], ['SQLite', 'SQLite'], ['Supabase-Dark', 'Supabase']] },
  { group: 'CLOUD & DELIVERY', items: [['Vercel-Dark', 'Vercel'], ['Cloudflare-Dark', 'Cloudflare'], ['Workers-Dark', 'Workers'], ['GithubActions-Dark', 'Actions'], ['Git', 'Git']] },
  { group: 'TEST & VISION', items: [['Vitest-Dark', 'Vitest'], ['OpenCV-Dark', 'OpenCV']] },
];

export const repoUrl = (r) => `${GH}/${r}`;
