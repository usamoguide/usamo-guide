import * as React from 'react';

/**
 * The math insights the streak unlocks, one per prime-numbered day of a
 * streak (2, 3, 5, 7, 11, ...). Written in the export's style: variables in
 * `.mv` (the serif italic), worked numbers kept together with `.nw`.
 */
export const INSIGHTS: React.ReactNode[] = [
  // day 2
  <>
    A number is divisible by 9 exactly when the sum of its digits is. So 4,527
    is, because <span className="nw">4 + 5 + 2 + 7 = 18</span>.
  </>,
  // day 3
  <>
    The first <i className="mv">n</i> odd numbers always add up to{' '}
    <i className="mv">n</i>
    <sup>2</sup>. Try it: <span className="nw">1 + 3 + 5 + 7 = 16</span>.
  </>,
  // day 5
  <>
    Pair the first term with the last: 1 + 100, 2 + 99, and so on gives 50
    pairs of 101. So <span className="nw">1 + 2 + … + 100 = 5,050</span>, and
    in general the sum is <i className="mv">n</i>(<i className="mv">n</i> + 1)
    / 2.
  </>,
  // day 7
  <>
    To count divisors, add one to each exponent in the prime factorization and
    multiply. <span className="nw">72 = 2<sup>3</sup> · 3<sup>2</sup></span>,
    so it has <span className="nw">4 · 3 = 12</span> divisors.
  </>,
  // day 11
  <>
    For divisibility by 11, alternately add and subtract the digits. 9,174
    passes, because <span className="nw">9 − 1 + 7 − 4 = 11</span>.
  </>,
  // day 13
  <>
    Every perfect square leaves a remainder of 0 or 1 when divided by 4. So a
    number like 4,003, which leaves 3, can never be a square.
  </>,
  // day 17
  <>
    An angle inscribed in a circle is half the central angle on the same arc.
    That is why any angle inscribed in a semicircle is exactly 90°.
  </>,
  // day 19
  <>
    Squares of numbers near a round one are quick with (
    <i className="mv">a</i> + <i className="mv">b</i>)<sup>2</sup>:{' '}
    <span className="nw">
      51<sup>2</sup> = 2,500 + 100 + 1 = 2,601
    </span>
    .
  </>,
  // day 23
  <>
    For <i className="mv">x</i>
    <sup>2</sup> + <i className="mv">bx</i> + <i className="mv">c</i> = 0,
    the roots add to −<i className="mv">b</i> and multiply to{' '}
    <i className="mv">c</i>. The roots of{' '}
    <span className="nw">
      <i className="mv">x</i>
      <sup>2</sup> − 7<i className="mv">x</i> + 12
    </span>{' '}
    are 3 and 4.
  </>,
  // day 29
  <>
    Put 13 people in a room and two of them share a birth month. When there are
    more pigeons than holes, some hole gets two.
  </>,
  // day 31
  <>
    Choosing <i className="mv">k</i> of <i className="mv">n</i> things: a
    3-person team from 7 people can be picked in{' '}
    <span className="nw">7 · 6 · 5 / 3! = 35</span> ways.
  </>,
  // day 37
  <>
    A triangle's area is its inradius times its semiperimeter. The 3-4-5
    triangle has area 6 and semiperimeter 6, so its inradius is 1.
  </>,
  // day 41
  <>
    Last digits of powers repeat. Powers of 7 end in 7, 9, 3, 1, 7, 9, …, so 7
    <sup>2026</sup> ends in 9, because 2026 leaves a remainder of 2 when
    divided by 4.
  </>,
  // day 43
  <>
    Count the complement when "at least one" appears. Of the 2<sup>10</sup> =
    1,024 runs of ten coin flips, only one has no heads, so 1,023 have at least
    one.
  </>,
  // day 47
  <>
    The angles of any polygon with <i className="mv">n</i> sides add up to{' '}
    <span className="nw">
      (<i className="mv">n</i> − 2) · 180°
    </span>
    . Each angle of a regular hexagon is{' '}
    <span className="nw">720° / 6 = 120°</span>.
  </>,
];

/** The streak day each insight unlocks on: the primes, in order. */
export const INSIGHT_DAYS: number[] = (() => {
  const out: number[] = [];
  for (let n = 2; out.length < INSIGHTS.length; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) prime = false;
    if (prime) out.push(n);
  }
  return out;
})();
