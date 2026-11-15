import HanziWriter, { type CharacterJson } from 'hanzi-writer';

type Point = [number, number];
export function pointAlong(points: Point[], fraction: number): { x: number; y: number; angle: number } | null {
  const segments = points.slice(1).map((p, i) => ({ a: points[i], b: p, length: Math.hypot(p[0] - points[i][0], p[1] - points[i][1]) })).filter(s => s.length > 0);
  const total = segments.reduce((n, s) => n + s.length, 0);
  if (!total) return null;
  let distance = Math.max(0, Math.min(1, fraction)) * total;
  for (const s of segments) {
    if (distance <= s.length) { const t = distance / s.length; return { x: s.a[0] + (s.b[0] - s.a[0]) * t, y: s.a[1] + (s.b[1] - s.a[1]) * t, angle: Math.atan2(s.b[1] - s.a[1], s.b[0] - s.a[0]) * 180 / Math.PI }; }
    distance -= s.length;
  }
  return null;
}

export function createStrokeGuide(target: HTMLElement, size: number, padding: number) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`); svg.classList.add('stroke-guide'); svg.setAttribute('aria-hidden', 'true');
  target.style.position = 'relative'; target.style.width = `${size}px`; target.style.height = `${size}px`; target.append(svg);
  let data: CharacterJson | undefined, stroke = 0, frame = 0, disposed = false, active = false;
  const transform = HanziWriter.getScalingTransform(size, size, padding);
  const clear = () => { cancelAnimationFrame(frame); frame = 0; svg.replaceChildren(); };
  const show = () => {
    clear(); if (disposed || !active || !data?.medians[stroke]) return;
    const points = data.medians[stroke].map(([x, y]) => [transform.x + x * transform.scale, size - transform.y - y * transform.scale] as Point);
    if (!pointAlong(points, 0)) return;
    const path = document.createElementNS(ns, 'polyline'); path.setAttribute('points', points.map(p => p.join(',')).join(' ')); path.setAttribute('class', 'stroke-guide-path');
    const start = document.createElementNS(ns, 'circle'); start.setAttribute('cx', String(points[0][0])); start.setAttribute('cy', String(points[0][1])); start.setAttribute('r', '5'); start.setAttribute('class', 'stroke-guide-start');
    const arrow = document.createElementNS(ns, 'path'); arrow.setAttribute('d', 'M -8 -6 L 2 0 L -8 6 Z'); arrow.setAttribute('class', 'stroke-guide-arrow'); svg.append(path, start, arrow);
    const place = (fraction: number) => { const p = pointAlong(points, fraction); if (p) arrow.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${p.angle})`); };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { place(0.5); return; }
    let began: number | undefined;
    const tick = (time: number) => { if (disposed || !active) return; began ??= time; place(((time - began) % 1800) / 1800); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
  };
  return { setData(value: CharacterJson) { if (!disposed) { data = value; show(); } }, setStroke(value: number) { stroke = value; active = true; show(); }, hide() { active = false; clear(); }, dispose() { disposed = true; active = false; clear(); svg.remove(); } };
}
