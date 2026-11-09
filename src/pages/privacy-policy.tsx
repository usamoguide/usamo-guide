import { Link, PageProps } from 'gatsby';
import * as React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import { AppPageHead, AppSection } from '../components/ug/pages/AppPage';
import { IcoBack } from '../components/ug/pages/pageIcons';

export default function PrivacyPolicyPage(props: PageProps) {
  return (
    <Layout>
      <SEO title="Privacy Policy" image={null} pathname={props.path} />
      <TopNavigationBar />

      <main className="wrap ap-page">
        <AppPageHead
          crumbs={[{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }]}
          k="Legal"
          title="Privacy Policy"
          lede={
            <>
              USAMO Guide (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or
              &ldquo;us&rdquo;) respects your privacy. This Privacy Policy
              explains what information we collect, how we use it, and your
              choices.
            </>
          }
          meta={
            <span>
              Last updated <b>April 3, 2026</b>
            </span>
          }
        />

        <div className="ap-body">
          <AppSection id="collect" title="Information we collect">
            <p>
              We may collect account information (such as your email and basic
              profile details), progress/activity data within the guide, and
              limited technical information used for security and reliability.
            </p>
          </AppSection>
          <AppSection id="use" title="How we use information">
            <p>
              We use collected information to provide and improve the website,
              authenticate users, save learning progress, and maintain the
              safety and integrity of our services.
            </p>
          </AppSection>
          <AppSection id="third-party" title="Third-party services">
            <p>
              We use trusted third-party services to operate parts of the
              platform, including authentication providers (for example, Google)
              and infrastructure providers. These services process data
              according to their own privacy policies.
            </p>
          </AppSection>
          <AppSection id="sharing" title="Data sharing">
            <p>
              We do not sell personal data. We only share information as needed
              to run the service, comply with legal obligations, or protect the
              rights and safety of users and the community.
            </p>
          </AppSection>
          <AppSection id="choices" title="Your choices">
            <p>
              You can contact us to request account-related help or to ask
              questions about your data. You may also choose not to use optional
              sign-in methods.
            </p>
          </AppSection>
          <AppSection id="contact" title="Contact">
            <p>
              For privacy questions, contact us at{' '}
              <a href="mailto:contact@usamoguide.com">contact@usamoguide.com</a>
              .
            </p>
            <p className="ap-also">
              See also the <Link to="/terms-of-service">Terms of Service</Link>.
            </p>
          </AppSection>
        </div>

        <Link to="/" className="prb-back ap-back">
          <IcoBack />
          Back to home
        </Link>
      </main>
    </Layout>
  );
}
