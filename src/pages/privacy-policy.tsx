import { Link, PageProps } from 'gatsby';
import * as React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';

export default function PrivacyPolicyPage(props: PageProps) {
  return (
    <Layout>
      <SEO title="Privacy Policy" image={null} pathname={props.path} />

      <TopNavigationBar />

      <div
        data-page-tone="dark"
        className="min-h-screen"
        style={{ background: 'var(--bg-page)' }}
      >
        <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <h1 className="mt-8 text-4xl font-extrabold text-[var(--text-primary)]">
            Privacy Policy
          </h1>

          <div className="mt-6 space-y-4 text-lg text-[var(--text-secondary)]">
            <p>Last updated: April 3, 2026</p>

            <p>
              USAMO Guide ("we", "our", or "us") respects your privacy. This
              Privacy Policy explains what information we collect, how we use
              it, and your choices.
            </p>

            <h2 className="pt-2 text-2xl font-bold text-[var(--text-primary)]">
              Information We Collect
            </h2>
            <p>
              We may collect account information (such as your email and basic
              profile details), progress/activity data within the guide, and
              limited technical information used for security and reliability.
            </p>

            <h2 className="pt-2 text-2xl font-bold text-[var(--text-primary)]">
              How We Use Information
            </h2>
            <p>
              We use collected information to provide and improve the website,
              authenticate users, save learning progress, and maintain the
              safety and integrity of our services.
            </p>

            <h2 className="pt-2 text-2xl font-bold text-[var(--text-primary)]">
              Third-Party Services
            </h2>
            <p>
              We use trusted third-party services to operate parts of the
              platform, including authentication providers (for example, Google)
              and infrastructure providers. These services process data
              according to their own privacy policies.
            </p>

            <h2 className="pt-2 text-2xl font-bold text-[var(--text-primary)]">
              Data Sharing
            </h2>
            <p>
              We do not sell personal data. We only share information as needed
              to run the service, comply with legal obligations, or protect the
              rights and safety of users and the community.
            </p>

            <h2 className="pt-2 text-2xl font-bold text-[var(--text-primary)]">
              Your Choices
            </h2>
            <p>
              You can contact us to request account-related help or to ask
              questions about your data. You may also choose not to use optional
              sign-in methods.
            </p>

            <h2 className="pt-2 text-2xl font-bold text-[var(--text-primary)]">Contact</h2>
            <p>
              For privacy questions, contact us at{' '}
              <a
                href="mailto:contact@usamoguide.com"
                className="text-[var(--accent)] underline hover:text-[var(--text-primary)]"
              >
                contact@usamoguide.com
              </a>
              .
            </p>

            <Link
              to="/"
              className="mb-4 block text-[var(--accent)] underline hover:text-[var(--text-primary)]"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
