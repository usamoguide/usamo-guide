import classNames from 'classnames';
import {
  MotionValue,
  motion,
  useAnimationFrame,
  useMotionValue,
} from 'framer-motion';
import * as React from 'react';

function GridPattern({
  offsetX,
  offsetY,
}: {
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
}) {
  return (
    <svg className="h-full w-full" aria-hidden="true">
      <defs>
        <motion.pattern
          id="infinite-grid-pattern"
          x={offsetX}
          y={offsetY}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#infinite-grid-pattern)" />
    </svg>
  );
}

export const Component = () => {
  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + 0.35) % 40);
    gridOffsetY.set((gridOffsetY.get() + 0.35) % 40);
  });

  return (
    <div
      className={classNames(
        'pointer-events-none absolute inset-0 overflow-hidden'
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 text-white/70 opacity-[0.08]">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </div>
    </div>
  );
};
