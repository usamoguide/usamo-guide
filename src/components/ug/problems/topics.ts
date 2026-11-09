/**
 * Topic groups for the problem-search sidebar. The index has several hundred
 * free-form tags; each one is sorted into a group by keyword, first rule wins.
 * Rules run in this order (not display order) so that, e.g., "Triangle
 * trigonometry" lands in Trigonometry and "Geometric Probability" in
 * Combinatorics.
 */
export type TopicGroupName =
  | 'Number Theory'
  | 'Algebra'
  | 'Geometry'
  | 'Trigonometry'
  | 'Combinatorics'
  | 'Arithmetic'
  | 'Calculus'
  | 'Other';

/** Display order. The first three start open, as in the design. */
export const TOPIC_GROUPS: TopicGroupName[] = [
  'Number Theory',
  'Algebra',
  'Geometry',
  'Trigonometry',
  'Combinatorics',
  'Arithmetic',
  'Calculus',
  'Other',
];

const RULES: [TopicGroupName, RegExp][] = [
  [
    'Arithmetic',
    /order of operations|compound interest|place value|scientific notation|dot plot|scatter plot|graph reading|graph interpretation|bar graph/i,
  ],
  ['Combinatorics', /enumerat|dependent events|\bcycles\b/i],
  ['Number Theory', /^congruence$/i],
  [
    'Calculus',
    /deriv|integra(l|tion)|differentiat|\blimits?\b|taylor|l'h[oô]pital|related rates|\bodes?\b|chain rule|calculus|intermediate value|curvature/i,
  ],
  [
    'Trigonometry',
    /trig|\bsines?\b|cosine|law of (sines|cosines)|arctan|unit circle|de moivre|radian/i,
  ],
  [
    'Algebra',
    /symmetric (functions|polynomial)|symmetric cubic|nested radical|change of base|involution/i,
  ],
  [
    'Geometry',
    /geometr|angle|triang|circle|circum|incent|orthocent|centroid|cyclic|quadrilateral|tangen|homothe|radical axis|inversion|polygon|polyhedr|\barea|perimeter|volume|surface|\b[23]d\b|cube|sphere|cylinder|cone\b|prism|pyramid|coordinat|cartesian|similar|menelaus|ceva|cevian|simson|miquel|spiral|rotation|translation|reflection|symmedian|brocard|polar\b|isogonal|isotomic|barycentric|concurren|collinear|locus|loci|construction|distance chasing|pythag|squares?\b|rectang|rhomb|trapezo|parallelogram|kite|hexagon|pentagon|octagon|chord|\barcs?\b|arc length|power of a point|shoelace|pick's|heron|ptolemy|stewart|apollonius|napoleon|nine-point|euler line|desargues|pappus|midpoint|altitude|bisector|vectors?|slope|line equations?|\blines?\b|\bnets?\b|folding|shapes?|figures?|spatial|visual|projection|transformation|symmetr|sector|segment|inscribed|perpendicular|parallel|radius|protractor|convex hull|cross section|mass points|shaded|graphing/i,
  ],
  [
    'Combinatorics',
    /combinator|\bcount|probabilit|expected|permutation|combination|pigeonhole|graph theory|graphs?\b|coloring|colouring|invarian|monovariant|game|greedy|inclusion|exclusion|stars and bars|casework|bijection|recursion|catalan|partition|tiling|tessellat|\bpaths?\b|walking|tournament|binomial|pascal|extremal|venn|\bsets?\b|subsets|set theory|seating|dice|coin|spinner|sample space|arrangement|enumerat|independent events|outcomes|algorithm|simulation|existential|logic|deduct|elimination|truth values|grid|chessboard|handshake|ramsey|matching|bipartite|trees?\b|two ways|multiplication principle|generating function|fundamentals|burnside|stirling|markov|euler characteristic|euler's formula|covering|dissection|pairing|tetromino|tangram|sudoku|worst.case|distinguishab/i,
  ],
  [
    'Number Theory',
    /number theory|divisib|divisor|modul|\bmod\b|mod p|prime|\bgcd\b|\blcm\b|greatest common|least common|totient|φ|τ|σ|residue|chinese remainder|remainder|fermat|euler|wilson|diophantine|multiplicative order|\borders?\b|parity|integers?\b|factori|factors\b|multiples|unique factorization|pell|quadratic (fields|reciprocity|forms)|primitive root|inverses mod|digit|perfect squares|lifting|\blte\b|infinite descent|root flipping|vieta jumping|mcnugget|binary|bases?\b|number properties|palindrom|algebraic numbers|field theory|ring theory|group theory|möbius|mobius|floors? and ceilings?|repeated squaring|powers of|power of 10|large numbers/i,
  ],
  [
    'Algebra',
    /algebra|polynom|inequal|am-gm|qm|cauchy|schwarz|jensen|muirhead|majorization|power mean|holder|functional|\bfe\b|function|sequence|series|\bsums?\b|summation|product|telescop|roots? of unity|vieta|symmetric|newton|quadratic|linear|equation|exponent|logarithm|complex|induction|smoothing|optimi[sz]ation|maxim|minim|min-max|recurren|interpolation|irreducib|eisenstein|matri|determinant|absolute value|manipulat|substitut|system|progression|arithmetic mean|harmonic mean|identit|abel|chebyshev|injectiv|surjectiv|growth|decay|variable|expression|factoring|sophie germain|simon's|nth term|powers?\b|simplification|inverse variation|sign analysis|evaluation|intervals?/i,
  ],
  [
    'Arithmetic',
    /arithmetic|percent|ratio|rate\b|rates|fraction|decimal|money|cost|profit|time|unit conversion|conversion|dimensional|average|mean|median|mode\b|range|statistic|data|graph reading|graph interpretation|bar graph|pie chart|histogram|table|chart|plot|word problem|estimation|approximation|pattern|calendar|clock|dates?\b|mixture|discount|\bages?\b|age problem|proportion|addition|subtraction|multiplication|division|operations?|rounding|speed|distance|work|scale|scaling|measure|estimat|puzzle|temperature|fuel|scoring|comparison|differences|total items|lengths?/i,
  ],
];

const cache = new Map<string, TopicGroupName>();

export function topicGroupOf(tag: string): TopicGroupName {
  const hit = cache.get(tag);
  if (hit) return hit;
  let group: TopicGroupName = 'Other';
  for (const [name, re] of RULES) {
    if (re.test(tag)) {
      group = name;
      break;
    }
  }
  cache.set(tag, group);
  return group;
}
