import { graphql } from 'gatsby';
import * as React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import ClosingCta from '../components/ug/landing/ClosingCta';
import Community from '../components/ug/landing/Community';
import Faq from '../components/ug/landing/Faq';
import Hero from '../components/ug/landing/Hero';
import Ladder from '../components/ug/landing/Ladder';
import LandingFooter from '../components/ug/landing/LandingFooter';
import Mission from '../components/ug/landing/Mission';
import Olympiad4Everyone from '../components/ug/landing/Olympiad4Everyone';
import SampleLesson, {
  SampleLessonData,
} from '../components/ug/landing/SampleLesson';
import Scene from '../components/ug/landing/Scene';
import {
  LANDING_PREPAINT,
  useLandingMotion,
} from '../components/ug/landing/useLandingMotion';
import UGNav from '../components/ug/UGNav';

/**
 * The landing page, ported from usamo-guide-export/index.html. Markup and class
 * names follow the export so src/styles/ug/landing.css applies as is; the
 * export's script (reveals, scroll-linked variables, the ladder, the fox scene,
 * the contest climb, the dark nav over purple, Lenis) lives in useLandingMotion.
 */
export default function IndexPage({
  path,
  data,
}: {
  path: string;
  data: { xdm: SampleLessonData | null };
}): JSX.Element {
  const m = useLandingMotion();
  return (
    <Layout view="landing">
      <SEO
        title={null}
        description="Free, structured prep from AMC to USAMO: lessons, problem sets and mock contests in one place, written by USA(J)MO medalists and fully open source."
        image={null}
        pathname={path}
      />
      <script dangerouslySetInnerHTML={{ __html: LANDING_PREPAINT }} />
      <UGNav variant="landing" onLandingAnchor={m.onAnchor} />
      <Hero hookRef={m.hookRef} />
      {data?.xdm ? (
        <SampleLesson lesson={data.xdm} lsec={m.lsec} jumpTo={m.jumpTo} />
      ) : null}
      <Ladder step={m.step} />
      <Mission />
      <Scene sstep={m.sstep} />
      <Olympiad4Everyone climb={m.climb} />
      <Community />
      <Faq />
      <ClosingCta />
      <LandingFooter onAnchor={m.onAnchor} />
    </Layout>
  );
}

// The sample lesson: a real module, rendered in the lesson window
// (SAMPLE_MODULE_ID in SampleLesson.tsx; a page query can't interpolate it).
export const query = graphql`
  query LandingSampleLesson {
    xdm(frontmatter: { id: { eq: "shoelace-theorem-p1" } }) {
      body
      frontmatter {
        id
        title
        description
        difficulty
      }
      fields {
        division
      }
    }
  }
`;
