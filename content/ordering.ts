// Section -> Chapter -> Module

export type SectionID =
  | 'foundations'
  | 'intermediate'
  | 'advanced'
  | 'usamo';

export type Chapter = {
  name: string;
  items: string[];
  description?: string;
};

const MODULE_ORDERING: { [key in SectionID]: Chapter[] } = {
  foundations: [
    {
      name: 'Basic Arithmetic and Notation',
      description: 'Speed, mental math, and fluency with core numerical operations.',
      items: [
        'arithmetic-nt-basics',
        'fraction-decimal-percent',
        'absolute-value-integers_p1',
        'absolute-value-integers_p2',
        'fractions_percentages_proportions_p1',
        'fractions_percentages_proportions_p2',
        'kinematics-and-rates',
      ],
    },
    {
      name: 'Data',
      description: 'Interpreting data, central tendency, and organizing information visually.',
      items: [
        'mean-median-mode-range',
        'chart-graph-interpretation-p1',
        'chart-graph-interpretation-p2',
        'venn-diagrams-sets',
      ],
    },
    {
      name: 'Algebra',
      description: 'Translating problems into equations, solving systems, and pattern recognition.',
      items: [
        'word-problem-translation',
        'word-problems',
        'linear-equations-inequalities',
        'systems-equations',
        'defined-operations',
        'exponent-rules',
        'quadratic-formula',
        'polynomial-factoring-and-identities',
        'sfft-factoring',
        'substitution-techniques',
        'arithmetic-sequences',
        'geometric-sequences',
        'extremal-principle',
      ],
    },
    {
      name: 'Geometry',
      description: 'Angles, triangles, circles, and spatial reasoning for contest problems.',
      items: [
        'geometry-basics',
        'angle-chasing-parallel-lines',
        'triangle-fundamentals',
        'triangle-types-properties',
        'right-triangles',
        'similarity-basics',
        'triangle-congruence-similarty',
        'proportionality-thales',
        'special-quadrilaterals',
        'composite-figures-shaded-areas',
        'coordinate-geometry-basics',
        'line-equations',
        'three-d-geometry-basics',
      ],
    },
    {
      name: 'Number Theory',
      description: 'Primes, divisibility, modular arithmetic, and integer properties.',
      items: [
        'divisibility-primes',
        'divisibility-rules',
        'gcd-and-lcm',
        'divisor-functions',
        'modular-arithmetic-intro',
        'units-digit-periodicity',
        'base-number-systems',
        'miscellaneous-number-theory',
        'linear-diophantine-equations',
      ],
    },
    {
      name: 'Combinatorics and Probability',
      description: 'Counting techniques, probability fundamentals, and strategic enumeration.',
      items: [
        'counting-fundamentals',
        'permutations-combinations',
        'systematic-casework',
        'complementary-counting',
        'inclusion-exclusion',
        'circular-permutations',
        'arrangements-rank-and-sums',
        'stars-and-bars',
        'splitting-objects-into-groups',
        'distributing-objects',
        'pascals-triangle-binomial-theorem',
        'multinomial-theorem-and-applications',
        'geometric-counting',
        'recursion-basics',
        'pigeonhole-principles',
        'intro-probability',
      ],
    },
  ],

  intermediate: [
    {
      name: 'Advanced Algebra',
      description: 'Quadratics, systems, and polynomial identities for AMC 10/12.',
      items: [
        'function-basics-p1',
        'function-basics-p2',
        'function-basics',
        'binomial-theorem-p1',
        'binomial-theorem-p2',
        'higher-power-factorizations',
        'sophie-germain-identity',
        'vieta-formulas',
        'locating-roots',
        'symmetric-polynomials',
        'sum-formulas-powers',
        'newton-sums',
        'polynomial-manipulations',
        'vieta-jumping',
        'telescoping'
      ],
    },
    {
      name: 'Functional Equations',
      description: 'Standard substitutions and symmetry-based approaches.',
      items: [
        'functional-equations-p1',
        'functional-equations-p2',
      ],
    },
    {
      name: 'Counting & Casework',
      description: 'Multi-step counting with careful case analysis.',
      items: [
        'advanced-counting',
        'block-walk'
      ],
    },
    {
      name: 'Probability',
      description: 'Conditional probability, geometric probability, and expected value.',
      items: [
        'geometric-probability',
        'expected-value',
      ],
    },
    {
      name: 'Number Theory',
      description: 'Modular arithmetic, CRT, and divisibility techniques.',
      items: [
        'modular-arithmetic',
        'chinese-remainder-theorem',
        'euler-totient-theorem',
        'chicken-mcnugget',
      ],
    },
    {
      name: 'Euclidean Geometry',
      description: 'Circle theorems, power of a point, and cyclic quadrilaterals.',
      items: [
        'euclidean-geometry',
        'arc-and-chord',
        'cyclic-quadrilaterals',
        'tangent-lines',
        'tangent-circles',
        'descartes-theorem',
        'power-of-a-point',
        'triangle-medians-centroid',
        'angle-bisectors',
        'altitudes-orthocenter',
        'law-of-sines',
        'law-of-cosines',
      ],
    },
    {
      name: 'Coordinate Geometry',
      description: 'Analytic methods, Shoelace formula, and coordinate-based proofs.',
      items: [
        'shoelace-theorem-p1',
        'shoelace-theorem-p2'
      ],
    },
    {
      name: 'Inequalities',
      description: 'Algebraic and geometric inequality techniques.',
      items: [
        'inequalities-foundations',
        'amgm-inequality',
        'cauchy-schwarz',
      ],
    },
    {
      name: 'Sequences & Series',
      description: 'Convergence, recursive formulas, and summation methods.',
      items: ['sequences-series-intermediate-p1',
        'sequences-series-intermediate-p2'
      ],
    },
    {
      name: 'Trigonometry',
      description: 'Identities, equations, and unit circle applications.',
      items: [
        'trig-unit-circle',
        'trigonometric-identities-and-series-p1',
        'trigonometric-identities-and-series-p2',
        'trig-equations',
        'trig-inverse-functions',
      ],
    },
    {
      name: 'Complex Numbers',
      description: 'Algebraic and geometric interpretation of complex numbers.',
      items: [
        'complex-basics',
        'complex-algebra',
        'complex-plane',
        'complex-polar-form',
        'roots-of-unity',
      ],
    },
    {
      name: 'Geometry Extensions',
      description: 'Additional geometric structures.',
      items: ['regular-polygons', 'three-d-geometry'],
    },
  ],

  advanced: [
    {
      name: 'Strong Number Theory',
      description: 'Lifting the exponent, orders, and deeper divisibility arguments.',
      items: ['number-theory-advanced'],
    },
    {
      name: 'Vectors',
      description: 'Lifting the exponent, orders, and deeper divisibility arguments.',
      items: ['intro-to-vectors'],
    },
    {
      name: 'Advanced Counting',
      description: 'Generating functions, bijections, and harder combinatorial arguments.',
      items: ['counting-advanced'],
    },
    {
      name: 'Calculus',
      description: 'Differentiation, Integration, and Differential Equations',
      items: [
        'intro-derivatives',
        'differentiation-rules',
        'chain-rule',
        'lhopitals-rule',
        'implicit-differentiation',
        'related-rates',
        'minima-maxima-optimization',
        'taylor-series',
        'intuition-behind-integrals',
        'fundamental-theorem-of-calculus',
        'integration-rules',
        'substitutions',
        'integration-by-parts',
        'trigonometric-substitution',
        'integral-averages',
        'gaussian-integrals',
      ],
    },
    {
      name: 'Polynomials & Roots',
      description: 'Root bounding, irreducibility, and polynomial manipulation.',
      items: ['polynomials-roots'],
    },
    {
      name: 'Advanced Geometry',
      description: 'Projective methods, inversions, homothety, and spiral similarity.',
      items: [
        'angle-chasing',
        'geometry-advanced',
        'homothety-spiral-similarity',
        'sphere-geometry',
      ],
    },
    {
      name: 'Trig in Contests',
      description: 'Contest-specific trig tricks and identities.',
      items: ['trig-contests'],
    },
    {
      name: 'Inequalities (AIME Level)',
      description: 'Multi-variable and advanced inequality methods.',
      items: ['inequalities-advanced'],
    },
    {
      name: 'Generating Functions',
      description: 'Using formal power series to solve counting problems.',
      items: ['generating-functions'],
    },
    {
      name: 'Functional Equations (AIME)',
      description: 'Harder functional equations requiring injectivity and Cauchy-type analysis.',
      items: ['functional-equations-advanced'],
    },
  ],

  usamo: [
    {
      name: 'Proof Writing',
      items: ['proof-writing-basics'],
    },
    {
      name: 'Induction and Extremal Principle',
      items: ['induction-extremal'],
    },
    {
      name: 'Graph Theory (Intro)',
      items: ['graph-theory-intro'],
    },
    {
      name: 'Advanced Inequalities',
      items: ['inequalities-olympiad'],
    },
    {
      name: 'Olympiad Number Theory',
      items: ['olympiad-number-theory',
        'lifting-the-exponent-lemma-p1',
        'lifting-the-exponent-lemma-p2', 
        'vieta-root-jumping'],
    },
    {
      name: 'Olympiad Geometry',
      items: ['olympiad-geometry'],
    },
    {
      name: 'Strategy and Writeups',
      items: ['strategy-writeup'],
    },
  ],
};

export default MODULE_ORDERING;
export const SECTIONS: SectionID[] = Object.keys(
  MODULE_ORDERING
) as SectionID[];
export const SECTION_LABELS: { [key in SectionID]: string } = {
  foundations: 'Foundations (AMC 8)',
  intermediate: 'Intermediate (AMC 10-12)',
  advanced: 'Advanced (AIME)',
  usamo: 'Olympiad (USA(J)MO)',
} as const;
export const SECTION_SEO_DESCRIPTION: { [key in SectionID]: string } = {
  foundations:
    'AMC 8 preparation: arithmetic, data analysis, algebra, geometry, number theory, combinatorics, and probability.',
  intermediate:
    'AMC 10/12 topics: algebra, functional equations, counting, probability, number theory, geometry, inequalities, and sequences.',
  advanced:
    'AIME-level techniques: advanced number theory, counting, polynomials, complex numbers, geometry, trig, inequalities, and generating functions.',
  usamo:
    'USAMO preparation: proof writing, induction, extremal arguments, olympiad number theory and geometry, and contest strategy.',
};
export const SECTION_SEO_TITLES: { [key in SectionID]: string } = {
  foundations: 'Foundations (AMC 8)',
  intermediate: 'Intermediate (AMC 10-12)',
  advanced: 'Advanced (AIME)',
  usamo: 'Olympiad (USA(J)MO)',
};

const moduleIDToSectionMap: { [key: string]: SectionID } = {};

SECTIONS.forEach(section => {
  MODULE_ORDERING[section].forEach(category => {
    category.items.forEach(moduleID => {
      moduleIDToSectionMap[moduleID] = section;
    });
  });
});

export { moduleIDToSectionMap, moduleIDToURLMap };

const moduleIDToURLMap: { [key: string]: string } = {};

SECTIONS.forEach(section => {
  MODULE_ORDERING[section].forEach(category => {
    category.items.forEach(moduleID => {
      moduleIDToURLMap[moduleID] = `/${section}/${moduleID}`;
    });
  });
});
