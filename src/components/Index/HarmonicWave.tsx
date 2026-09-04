import * as React from 'react';
import { useGsapScroll } from '../../hooks/useGsapScroll';

/**
 * Travelling harmonic wave, pinned.
 *
 * A stack of curves runs in from the left edge and keeps moving whether or not
 * you scroll — the motion is time-driven, so the scene is alive at rest.
 * Scrolling changes what the wave *is*: it begins as a single clean sine and
 * gains harmonics until the profile is a dense superposition.
 *
 * Rendered as real strokes at full device resolution rather than into a scaled
 * buffer, so the lines stay sharp on a retina display. The cost is bounded by
 * the sample step, not by pixel count: a few hundred `lineTo` calls per curve.
 */

/** How many curves are stacked. Each is phase- and amplitude-offset. */
const LINES = 9;

/** Horizontal sampling step in CSS pixels — small enough to look continuous. */
const STEP = 3;

/** Highest harmonic index at full scroll. */
const MAX_HARMONICS = 9;

const BANDS = [
  {
    at: 0,
    label: 'One term',
    title: 'A single sine',
    body: 'Smooth, predictable, and not much use on its own.',
  },
  {
    at: 0.3,
    label: 'Three terms',
    title: 'It starts to bite',
    body: 'Add the odd harmonics and the shape stops being obvious.',
  },
  {
    at: 0.58,
    label: 'Six terms',
    title: 'Structure inside structure',
    body: 'Every term you add is a technique you did not have before.',
  },
  {
    at: 0.82,
    label: 'Nine terms',
    title: 'The real thing',
    body: 'This is what an olympiad problem looks like from the outside — until you know the terms.',
  },
];

export default function HarmonicWave(): JSX.Element {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const progressRef = React.useRef(0);
  const [band, setBand] = React.useState(0);
  const bandRef = React.useRef(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let w = 0;
    let h = 0;
    let frameId: number | null = null;
    let onScreen = true;

    let ink = '237, 234, 229';
    let glow = '237, 234, 229';
    const readInk = () => {
      const cs = getComputedStyle(canvas);
      ink = cs.getPropertyValue('--wave-ink').trim() || '237, 234, 229';
      glow = cs.getPropertyValue('--wave-glow').trim() || ink;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const p = progressRef.current;

      // Harmonic count rises with scroll. Fractional, so terms fade in rather
      // than popping: the newest one is weighted by the fraction.
      const terms = 1 + p * (MAX_HARMONICS - 1);
      const whole = Math.floor(terms);
      const frac = terms - whole;

      // The wave occupies the left portion; the panel sits over the right.
      const span = w * 0.72;
      const midY = h * 0.5;
      const baseAmp = Math.min(h * 0.3, 260);

      for (let line = 0; line < LINES; line++) {
        const k = line / (LINES - 1 || 1);
        // Each curve is the same function sampled at a different moment, so
        // the stack reads as one wave with depth rather than as seven waves.
        const lag = k * 1.15;
        const yOffset = (k - 0.5) * h * 0.34;
        const amp = baseAmp * (1 - k * 0.3);
        const alpha = 0.95 - k * 0.62;

        ctx.beginPath();
        for (let x = 0; x <= span + STEP; x += STEP) {
          const u = x / span;

          // Envelope: the wave emerges from the left edge and tapers out
          // before it can collide with the copy on the right.
          const rise = Math.min(1, u / 0.16);
          const fall = 1 - Math.max(0, (u - 0.62) / 0.38) ** 1.5;
          const env = rise * Math.max(0, fall);

          let y = 0;
          let norm = 0;
          for (let n = 1; n <= whole + 1; n++) {
            // Odd harmonics only — the square-wave series, which is the one
            // that actually sharpens rather than just getting noisy.
            const harm = 2 * n - 1;
            let weight = 1 / harm;
            if (n === whole + 1) weight *= frac;
            y +=
              weight *
              Math.sin(u * Math.PI * 2 * 1.6 * harm - t * (1.9 + harm * 0.09) - lag);
            norm += 1 / harm;
          }
          y = (y / (norm || 1)) * amp * env;

          const px = x;
          const py = midY + yOffset + y;
          if (x === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        // The leading curve is the subject; the rest are its echoes. Giving
        // the front line a glow and real weight is what turns a stack of grey
        // hairlines into something with a front and a back.
        ctx.strokeStyle = `rgba(${ink}, ${Math.max(0.06, alpha)})`;
        ctx.lineWidth = line === 0 ? 3.4 : 1.9 - k * 0.7;
        if (line === 0) {
          ctx.shadowColor = `rgba(${glow}, 0.55)`;
          ctx.shadowBlur = 26;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Axis, so the oscillation reads against something.
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(span * 0.92, midY);
      ctx.strokeStyle = `rgba(${ink}, 0.14)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Full device resolution — the lines are the subject, so they have to be
      // sharp. This is why the render is strokes and not a pixel buffer.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      readInk();
      draw(reduceMotion ? 0 : performance.now() / 1000);
    };

    const loop = () => {
      frameId = requestAnimationFrame(loop);
      if (onScreen) draw(performance.now() / 1000);
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

    if (!reduceMotion) frameId = requestAnimationFrame(loop);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  useGsapScroll(
    ({ ScrollTrigger }) => {
      const root = rootRef.current;
      if (!root) return;
      const trigger = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: 0.6,
        onUpdate: self => {
          progressRef.current = self.progress;
          let next = 0;
          for (let i = BANDS.length - 1; i >= 0; i--) {
            if (self.progress >= BANDS[i].at) {
              next = i;
              break;
            }
          }
          if (next !== bandRef.current) {
            bandRef.current = next;
            setBand(next);
          }
        },
      });
      return () => trigger.kill();
    },
    {
      fallback: () => {
        progressRef.current = 1;
        setBand(BANDS.length - 1);
      },
    }
  );

  const current = BANDS[band];

  return (
    <section ref={rootRef} className="wave">
      <div className="wave__canvas-wrap">
        <canvas ref={canvasRef} className="wave__canvas" aria-hidden="true" />
      </div>

      <div className="wave__inner">
        <div className="wave__panel">
          <h2 className="wave__heading">Nothing here is one idea.</h2>
          <p className="wave__lede">
            Every hard problem is a sum of simpler ones. The guide gives you the
            terms in the order they become useful.
          </p>

          <div aria-live="polite" className="wave__readout">
            <p className="wave__count">{current.label}</p>
            <h3 className="wave__title">{current.title}</h3>
            <p className="wave__body">{current.body}</p>
          </div>

          <div className="wave__scale" aria-hidden="true">
            {BANDS.map((b, i) => (
              <span key={b.label} className={i <= band ? 'is-past' : undefined} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
