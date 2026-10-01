// A stylised wireframe of the Mole Antonelliana (Turin), built from a
// square-plan profile and projected with a small perspective.
// The plan is square, so a 90° turn is visually identical to 0°: frames for
// 0..90° loop seamlessly when the path morphs back to the start.

import { r1 } from './svg.mjs';

// [height m, half-width m] from ground to the tip, roughly to scale.
const BODY = [
  [0, 27], [5, 27], [5, 24.5], [21, 24.5], [36, 24.5], [36, 26], [40, 26], [40, 22.5], [50, 22.5],
  ...Array.from({ length: 7 }, (_, i) => {
    const k = (i + 1) / 7; // dome: slightly convex square vault
    return [50 + 48 * k, 6.2 + 16.3 * (1 - Math.pow(k, 1.55))];
  }),
  [98, 8.5], [101, 8.5], [101, 5.6], [111, 5.6], [111, 6.6], [113, 6.6], [113, 4.3], [122, 4.3], [122, 5.2], [124, 5.2],
];
const SPIRE = [[124, 3.4], [133, 2.6], [142, 1.9], [151, 1.2], [159, 0.65], [165, 0.25], [167.5, 0]];

const CORNERS = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
// Faces as (corner a, corner b); a point on a face is lerp(a, b, (u+1)/2).
const FACES = [[0, 1], [1, 2], [2, 3], [3, 0]];

function facePoint(face, u, hw) {
  const [a, b] = FACES[face].map((i) => CORNERS[i]);
  const k = (u + 1) / 2;
  return [(a[0] + (b[0] - a[0]) * k) * hw, (a[1] + (b[1] - a[1]) * k) * hw];
}

/** Polylines in model space: arrays of [x, y, z]. */
function model() {
  const body = [];
  const spire = [];
  // horizontal rings (closed squares)
  for (const [z, hw] of BODY) body.push([...CORNERS, CORNERS[0]].map(([cx, cy]) => [cx * hw, cy * hw, z]));
  for (const [z, hw] of SPIRE.slice(0, -1)) spire.push([...CORNERS, CORNERS[0]].map(([cx, cy]) => [cx * hw, cy * hw, z]));
  // corner profiles, ground to tip
  for (const [cx, cy] of CORNERS) {
    body.push(BODY.map(([z, hw]) => [cx * hw, cy * hw, z]));
    spire.push(SPIRE.map(([z, hw]) => [cx * hw, cy * hw, z]));
  }
  // colonnade on the main block
  for (let f = 0; f < 4; f++)
    for (const u of [-0.6, -0.2, 0.2, 0.6]) {
      const [x, y] = facePoint(f, u, 24.5);
      body.push([[x, y, 5], [x, y, 36]]);
    }
  // ribs following the dome
  const dome = BODY.filter(([z]) => z >= 50 && z <= 98);
  for (let f = 0; f < 4; f++)
    for (const u of [-0.5, 0, 0.5]) body.push(dome.map(([z, hw]) => [...facePoint(f, u, hw), z]));
  // lantern columns
  for (let f = 0; f < 4; f++)
    for (const u of [-0.4, 0.4]) {
      const [x, y] = facePoint(f, u, 5.6);
      body.push([[x, y, 101], [x, y, 111]]);
    }
  return { body, spire };
}

const M = model();

/**
 * Project the model rotated by `deg` around its vertical axis.
 * Returns SVG path data for the body and the spire.
 */
export function moleFrame(deg, { cx, ground, scale, tilt = 13, dist = 520 }) {
  const th = (deg * Math.PI) / 180;
  const ph = (tilt * Math.PI) / 180;
  const zc = 80; // pivot height for the tilt
  const proj = ([x, y, z]) => {
    const xr = x * Math.cos(th) - y * Math.sin(th);
    const yr = x * Math.sin(th) + y * Math.cos(th);
    const up = (z - zc) * Math.cos(ph) - yr * Math.sin(ph);
    const depth = yr * Math.cos(ph) + (z - zc) * Math.sin(ph);
    const f = dist / (dist + depth);
    return [r1(cx + xr * scale * f), r1(ground - (zc + up * f) * scale)];
  };
  const toD = (lines) => lines.map((pl) => pl.map((p, i) => (i ? 'L' : 'M') + proj(p).join(' ')).join('')).join('');
  return { body: toD(M.body), spire: toD(M.spire) };
}

/** `values` strings for SMIL morphing over one 90° turn. */
export function moleAnimation(opts, steps = 9) {
  const frames = Array.from({ length: steps + 1 }, (_, i) => moleFrame((90 * i) / steps, opts));
  return {
    body: frames.map((f) => f.body).join(';'),
    spire: frames.map((f) => f.spire).join(';'),
    first: frames[0],
  };
}
