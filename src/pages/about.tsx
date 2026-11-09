import { PageProps } from 'gatsby';
import * as React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import Btn from '../components/ug/Btn';
import { UG_LINKS } from '../components/ug/links';
import { AppPageHead, AppSection } from '../components/ug/pages/AppPage';

export default function AboutPage(props: PageProps) {
  return (
    <Layout>
      <SEO
        title="About"
        description="Learn what USAMO Guide is, why it exists, and how we help students prepare for AMC, AIME, and USAMO."
        image={null}
        pathname={props.path}
      />
      <TopNavigationBar current="about" />

      <main className="wrap ap-page">
        <AppPageHead
          crumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
          k="About USAMO Guide"
          size="sm"
          title={
            <>
              Umm, so what is this &ldquo;USAMO Guide&rdquo; that everyone is
              talking about?
            </>
          }
          lede="USAMO Guide is a free, structured learning platform that helps students progress from early contest problem solving to Olympiad-level proof writing."
          meta={
            <>
              <span>
                <b>130k+</b> students helped
              </span>
              <span>
                <b>4</b> tracks, AMC 8 to USA(J)MO
              </span>
              <span>
                <b>Free</b>, and open source
              </span>
            </>
          }
          pose="panda-wave"
        >
          <Btn kind="p" size="lg" to={UG_LINKS.start} arrow>
            Start learning
          </Btn>
          <Btn kind="s" size="lg" href={UG_LINKS.discord} target="_blank">
            Join the Discord
          </Btn>
        </AppPageHead>

        <div className="ap-body">
          <AppSection id="why" k="Our philosophy" title="Why do we exist?">
            <p>
              What we do at USAMO Guide is take away the barriers to learning
              math.
            </p>
            <p>
              We have a chance to change the way all of us think about preparing
              for math olympiads. Gatekept resources, unstructured learning and
              online courses that cost $$$ have kept Olympiad math restricted
              away from the rest of us.
            </p>
            <p>We think we have a chance to make a difference.</p>
          </AppSection>

          <AppSection
            id="so-far"
            k="So far"
            title="Okayyyy! I see y'all are ambitious, but what have you actually achieved till now?"
          >
            <p>
              Well, we have helped 130k+ students get all the resources they
              would ever need! Here's a small list of what we give:
            </p>
            <ul className="ap-list">
              <li>
                Structured learning tracks for AMC 8, AMC 10/12, AIME, and
                USAMO.
              </li>
              <li>Curated resources, explanations, and topic guidance.</li>
              <li>Extensive problem sets with full solutions and hints.</li>
              <li>
                Mock exams and contests through our{' '}
                <a href={UG_LINKS.contests} target="_blank" rel="noreferrer">
                  contests platform
                </a>
                .
              </li>
              <li>Progress tracking and study planning tools.</li>
            </ul>
          </AppSection>

          <AppSection
            id="different"
            k="What's different"
            title="What makes us different"
          >
            <p>
              USAMO Guide is made by <b>high schoolers</b>: ones who went
              through trying to prepare for olympiads without any resources, and
              did so super recently.
            </p>
            <p>
              The adults who teach do so for profit. They gotta earn some way or
              the other, don't they? We don't. We have no intention to make
              money off of you, and we couldn't possibly gain anything by doing
              so. The only reason we exist is to help promote equity in learning
              math.
            </p>
            <ul className="ap-list">
              <li>
                Clear roadmaps that connect foundational topics to proof
                writing.
              </li>
              <li>Community-driven updates and feedback loops.</li>
              <li>Free access to the full curriculum.</li>
              <li>
                Biweekly contests that make sure you are prepared on test day.
              </li>
            </ul>
          </AppSection>

          <AppSection id="aims" k="Where we're going" title="Our aims">
            <p>
              We aim to make olympiad preparation less intimidating by breaking
              it into achievable steps, helping students build confidence, and
              supporting long-term mathematical growth.
            </p>
          </AppSection>
        </div>

        <section className="ap-band" aria-labelledby="involved-h">
          <img
            className="ap-band-fox"
            src="/ug/img/panda-idea.webp"
            alt=""
            width={450}
            height={464}
          />
          <div className="ap-band-t">
            <h2 id="involved-h">Get involved</h2>
            <p>
              Spot a gate we missed? Help us break it. Open a PR on GitHub, DM
              the admins on Discord, or email{' '}
              <a href="mailto:team@usamoguide.com">team@usamoguide.com</a>.
              However you reach us, it's fine! You're not just giving feedback,
              you're holding the door open for another kid.
            </p>
          </div>
          <div className="ap-band-ctl">
            <Btn kind="w" size="sm" href={UG_LINKS.discord} target="_blank">
              Join the Discord
            </Btn>
            <Btn kind="o" size="sm" href={UG_LINKS.github} target="_blank">
              Open GitHub
            </Btn>
          </div>
        </section>
      </main>
    </Layout>
  );
}
