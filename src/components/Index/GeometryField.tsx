import * as React from 'react';

/**
 * Hero backdrop: a field of geometric constructions that the cursor lights.
 *
 * The figures are laid out once, at fixed positions, and sit almost invisible
 * at rest. The pointer is a soft light — whatever falls inside its radius
 * brightens, and fades again behind you. Because the field is fixed rather
 * than generated per-move, the same figure is always in the same place, so
 * sweeping back over one you liked finds it again.
 *
 * Figures are real constructions — circumscribed and inscribed circles,
 * perpendicular bisectors, medians, compass arcs — not abstract polygons.
 * They are the vocabulary of the material the site teaches.
 *
 * Canvas rather than SVG: the alpha of every stroke changes on every pointer
 * move, and that would be a full style recalculation across dozens of DOM
 * nodes per frame.
 */

type Figure = {
  cx: number;
  cy: number;
  r: number;
  rot: number;
  kind: Kind;
};

/**
 * Every figure is a closed shape. The previous set leaned on open arcs, which
 * at low opacity read as stray marks rather than as constructions.
 */
type Kind =
  | 'triangle'
  | 'square'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'
  | 'star'
  | 'circleInPoly'
  | 'polyInCircle'
  | 'nested'
  | 'medians';

/** Deterministic PRNG, so the field is identical on every load. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Resting visibility. Low enough that the hero reads as plain until you move. */
const REST_ALPHA = 0.014;

const KINDS: Kind[] = [
  'triangle',
  'square',
  'pentagon',
  'hexagon',
  'octagon',
  'star',
  'circleInPoly',
  'polyInCircle',
  'nested',
  'medians',
];

/** Sides for the shapes whose name does not already say. */
const SIDES: Partial<Record<Kind, number>> = {
  triangle: 3,
  square: 4,
  pentagon: 5,
  hexagon: 6,
  octagon: 8,
};

/**
 * Positions are normalised so the field reflows with the viewport. Laid out on
 * a jittered grid rather than pure random, which would clump and leave holes.
 */
function buildFigures(): Figure[] {
  const rng = makeRng(90210);
  const figures: Figure[] = [];
  // Same count, but placed on a disciplined grid. Wide jitter plus wide size
  // variance was what turned this into a tangle: figures of very different
  // scales crossing at random angles read as noise rather than as a field of
  // constructions.
  const cols = 11;
  const rows = 7;
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      figures.push({
        cx: (gx + 0.5) / cols + (rng() - 0.5) * 0.055,
        cy: (gy + 0.5) / rows + (rng() - 0.5) * 0.07,
        r: 0.78 + rng() * 0.36,
        rot: rng() * Math.PI * 2,
        kind: KINDS[Math.floor(rng() * KINDS.length)],
      });
    }
  }
  return figures;
}

export default function GeometryField(): JSX.Element {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const pointer = React.useRef({ x: -9999, y: -9999, on: false });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const figures = buildFigures();
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let w = 0;
    let h = 0;
    let frameId: number | null = null;
    let onScreen = true;
    // Eased pointer, so the light glides instead of snapping between samples.
    let lx = -9999;
    let ly = -9999;
    const lit = new Float32Array(figures.length);

    let ink = '237, 234, 229';
    const readInk = () => {
      ink =
        getComputedStyle(canvas).getPropertyValue('--geo-ink').trim() ||
        '237, 234, 229';
    };

    const stroke = (a: number) => `rgba(${ink}, ${a})`;

    /** Regular n-gon path, circumradius `size`, starting at angle `rot`. */
    const polyPath = (n: number, size: number, rot: number) => {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const th = rot + (i * Math.PI * 2) / n;
        const x = Math.cos(th) * size;
        const y = Math.sin(th) * size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    /** One figure, drawn around (0,0) at circumradius `size`. */
    const drawFigure = (f: Figure, size: number, a: number) => {
      ctx.lineWidth = 1;
      const n = SIDES[f.kind] ?? 6;

      switch (f.kind) {
        case 'triangle':
        case 'square':
        case 'pentagon':
        case 'hexagon':
        case 'octagon': {
          polyPath(n, size, f.rot);
          ctx.strokeStyle = stroke(a);
          ctx.stroke();
          break;
        }

        case 'star': {
          // {n/2} star polygon: connect every second vertex of a heptagon, so
          // it closes in one stroke rather than needing two triangles.
          const points = 7;
          ctx.beginPath();
          for (let i = 0; i <= points; i++) {
            const idx = (i * 2) % points;
            const th = f.rot + (idx * Math.PI * 2) / points;
            const x = Math.cos(th) * size;
            const y = Math.sin(th) * size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.strokeStyle = stroke(a);
          ctx.stroke();
          break;
        }

        case 'circleInPoly': {
          polyPath(n, size, f.rot);
          ctx.strokeStyle = stroke(a);
          ctx.stroke();
          // Inradius of a regular n-gon is R·cos(pi/n) — the incircle touches
          // each edge exactly, which is the whole point of drawing it.
          ctx.beginPath();
          ctx.arc(0, 0, size * Math.cos(Math.PI / n), 0, Math.PI * 2);
          ctx.strokeStyle = stroke(a * 0.6);
          ctx.stroke();
          break;
        }

        case 'polyInCircle': {
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.strokeStyle = stroke(a * 0.6);
          ctx.stroke();
          polyPath(n, size, f.rot);
          ctx.strokeStyle = stroke(a);
          ctx.stroke();
          break;
        }

        case 'nested': {
          // Each ring rotated by half a step, so vertices sit over edges.
          for (let k = 0; k < 3; k++) {
            polyPath(
              n,
              size * (1 - k * 0.26),
              f.rot + (k * Math.PI) / n
            );
            ctx.strokeStyle = stroke(a * (1 - k * 0.24));
            ctx.stroke();
          }
          break;
        }

        case 'medians':
        default: {
          const pts: [number, number][] = [];
          for (let i = 0; i < 3; i++) {
            const th = f.rot + (i * Math.PI * 2) / 3;
            pts.push([Math.cos(th) * size, Math.sin(th) * size]);
          }
          polyPath(3, size, f.rot);
          ctx.strokeStyle = stroke(a);
          ctx.stroke();
          ctx.strokeStyle = stroke(a * 0.5);
          ctx.beginPath();
          for (let i = 0; i < 3; i++) {
            const m: [number, number] = [
              (pts[(i + 1) % 3][0] + pts[(i + 2) % 3][0]) / 2,
              (pts[(i + 1) % 3][1] + pts[(i + 2) % 3][1]) / 2,
            ];
            ctx.moveTo(pts[i][0], pts[i][1]);
            ctx.lineTo(m[0], m[1]);
          }
          ctx.stroke();
          break;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const p = pointer.current;
      if (p.on) {
        if (lx < -9000) {
          lx = p.x;
          ly = p.y;
        } else {
          lx += (p.x - lx) * 0.16;
          ly += (p.y - ly) * 0.16;
        }
      }

      // Light radius scales with the viewport so it covers a similar share of
      // the field on a laptop and on a large display.
      const radius = Math.max(250, Math.min(w, h) * 0.34);
      // Scaled to the grid cell, so a figure stays inside its own patch.
      const base = Math.min(w / 11, h / 7) * 0.5;

      for (let i = 0; i < figures.length; i++) {
        const f = figures[i];
        const fx = f.cx * w;
        const fy = f.cy * h;

        let target = 0;
        if (p.on) {
          const d = Math.hypot(fx - lx, fy - ly);
          if (d < radius) {
            const t = 1 - d / radius;
            target = t * t; // falloff with a soft edge rather than a hard rim
          }
        }

        // Asymmetric easing: rises quickly, releases slowly. A symmetric ease
        // makes the field feel like it is chasing the cursor; this leaves a
        // trail of figures still lit behind you.
        const rate = target > lit[i] ? 0.16 : 0.022;
        lit[i] += (target - lit[i]) * rate;
        const alpha = REST_ALPHA + lit[i] * 0.8;
        if (alpha < REST_ALPHA + 0.006) {
          // Still draw the resting trace: the field must exist without a
          // pointer at all, including on touch, where there never is one.
          ctx.save();
          ctx.translate(fx, fy);
          drawFigure(f, base * f.r, REST_ALPHA);
          ctx.restore();
          continue;
        }

        ctx.save();
        ctx.translate(fx, fy);
        drawFigure(f, base * f.r * (1 + lit[i] * 0.045), alpha);
        ctx.restore();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      readInk();
      draw();
    };

    const loop = () => {
      frameId = requestAnimationFrame(loop);
      if (onScreen) draw();
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Only light while the pointer is actually over the hero.
      pointer.current = {
        x,
        y,
        on: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height,
      };
    };
    const onLeave = () => {
      pointer.current.on = false;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const io = new IntersectionObserver(
      e => {
        onScreen = e[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    if (!reduceMotion) {
      frameId = requestAnimationFrame(loop);
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
    }

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className="geo" aria-hidden="true">
      <canvas ref={canvasRef} className="geo__canvas" />
    </div>
  );
}
