import { PageProps } from 'gatsby';
import * as React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';

const TEXT_PRIMARY = '#F4EDEA';
const TEXT_SECONDARY = 'rgba(244, 237, 234, 0.80)';

const APPLY_EMAIL = 'team@usamoguide.com';
const APPLY_MAILTO = `mailto:${APPLY_EMAIL}?subject=Ambassador%20Program`;

/** Countries with an ambassador already onboarded. */
const countries = [
  'Kosovo',
  'Algeria',
  'United Arab Emirates',
  'Moldova',
  'India',
  'Luxembourg',
  'Syria',
  'Singapore',
  'United Kingdom',
];

const duties = [
  'Introduce us to math organizations, olympiad programs, and school clubs in your country.',
  'Speak or write publicly about the guide when press or schools come calling in your region.',
  'Localize how we talk about USAMO Guide so it actually lands where you are.',
  'Send outreach emails to teachers and organizers under the ambassador title.',
  "Connect us with teachers who'll publicly vouch for the material.",
];

export default function AmbassadorsPage(props: PageProps) {
  return (
    <Layout>
      <SEO
        title="International Ambassador Program"
        description="Olympiad-level students represent USAMO Guide in their own countries. Nine chapters so far."
        image={null}
        pathname={props.path}
      />

      <TopNavigationBar />

      <div
        data-page-tone="dark"
        className="min-h-screen"
        style={{ background: 'var(--bg-page)' }}
      >
        <main className="mx-auto max-w-3xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
          <header className="mb-10">
            <h1
              className="text-4xl font-extrabold"
              style={{ color: TEXT_PRIMARY }}
            >
              International Ambassador Program
            </h1>
            <p className="mt-4 text-lg" style={{ color: TEXT_SECONDARY }}>
              Good olympiad prep is scarce or expensive in most of the world. So
              we hand USAMO Guide to olympiad-level students in those countries
              and let them run it locally. Nine ambassadors are onboarded so
              far.
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>
              What an ambassador does
            </h2>
            <ul
              className="list-disc space-y-2 pl-6 text-lg"
              style={{ color: TEXT_SECONDARY }}
            >
              {duties.map(duty => (
                <li key={duty}>{duty}</li>
              ))}
            </ul>
            <p className="text-lg" style={{ color: TEXT_SECONDARY }}>
              A couple of hours a month, unpaid like everything else we do. What
              you get is the title, the platform, and a say in how this reaches
              your country.
            </p>
          </section>

          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>
              Where we already are
            </h2>
            <ul className="flex flex-wrap gap-2">
              {countries.map(country => (
                <li
                  key={country}
                  className="rounded-full px-4 py-1.5 text-base"
                  style={{
                    border: '1px solid rgba(240, 194, 255, 0.28)',
                    color: TEXT_SECONDARY,
                  }}
                >
                  {country}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>
              Want your country on that list?
            </h2>
            <p className="text-lg" style={{ color: TEXT_SECONDARY }}>
              Email{' '}
              <a
                href={APPLY_MAILTO}
                className="underline"
                style={{ color: '#F0C2FF' }}
              >
                {APPLY_EMAIL}
              </a>{' '}
              with your country, your competition record, and a few lines on
              what olympiad prep looks like where you are. That's the whole
              application.
            </p>
          </section>
        </main>
      </div>
    </Layout>
  );
}
