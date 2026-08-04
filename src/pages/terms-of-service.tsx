import { Link, PageProps } from 'gatsby';
import * as React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';

export default function TermsOfServicePage(props: PageProps) {
  return (
    <Layout>
      <SEO title="Terms of Service" image={null} pathname={props.path} />

      <TopNavigationBar />

      <div
        data-page-tone="dark"
        className="min-h-screen"
        style={{ background: 'var(--bg-page)' }}
      >
        <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <h1 className="mt-8 text-4xl font-extrabold text-[#F4EDEA]">
            Terms of Service
          </h1>

          <div className="mt-6 space-y-4 text-lg text-[rgba(244,237,234,0.80)]">
            <p>Last updated: April 3, 2026</p>

            <p>
              By accessing or using USAMO Guide ("we", "our", or "us"), you
              agree to these Terms of Service.
            </p>

            <h2 className="pt-2 text-2xl font-bold text-[#F4EDEA]">
              Use of the Service
            </h2>
            <p>
              You may use the service for lawful educational purposes. You agree
              not to misuse the platform, attempt unauthorized access, or
              disrupt service availability for others.
            </p>

            <h2 className="pt-2 text-2xl font-bold text-[#F4EDEA]">Accounts</h2>
            <p>
              You are responsible for your account activity and for maintaining
              the confidentiality of your login credentials.
            </p>

            <h2 className="pt-2 text-2xl font-bold text-[#F4EDEA]">
              Content and License
            </h2>
            <p>
              Use of site materials is subject to our license and usage terms.
              For details, see the{' '}
              <Link
                to="https://www.usamoguide.com/license.txt"
                className="text-[#F0C2FF] underline hover:text-[#F4EDEA]"
              >
                License and Usage page
              </Link>
              .
            </p>

            <h2 className="pt-2 text-2xl font-bold text-[#F4EDEA]">
              Third-Party Services
            </h2>
            <p>
              The platform may integrate with third-party services. Your use of
              those services may also be governed by their terms and policies.
            </p>

            <h2 className="pt-2 text-2xl font-bold text-[#F4EDEA]">
              Disclaimer
            </h2>
            <p>
              The service and content are provided on an "as is" basis without
              warranties of any kind, to the extent permitted by law.
            </p>

            <h2 className="pt-2 text-2xl font-bold text-[#F4EDEA]">
              Changes to These Terms
            </h2>
            <p>
              We may update these terms over time. Continued use of the service
              after updates means you accept the revised terms.
            </p>

            <h2 className="pt-2 text-2xl font-bold text-[#F4EDEA]">Contact</h2>
            <p>
              For questions about these terms, contact us at{' '}
              <a
                href="mailto:contact@usamoguide.com"
                className="text-[#F0C2FF] underline hover:text-[#F4EDEA]"
              >
                contact@usamoguide.com
              </a>
              .
            </p>

            <Link
              to="/"
              className="mb-4 block text-[#F0C2FF] underline hover:text-[#F4EDEA]"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
