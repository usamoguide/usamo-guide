import { Link, PageProps } from 'gatsby';
import * as React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import { AppPageHead, AppSection } from '../components/ug/pages/AppPage';
import { IcoBack } from '../components/ug/pages/pageIcons';

export default function TermsOfServicePage(props: PageProps) {
  return (
    <Layout>
      <SEO title="Terms of Service" image={null} pathname={props.path} />
      <TopNavigationBar />

      <main className="wrap ap-page">
        <AppPageHead
          crumbs={[{ label: 'Home', to: '/' }, { label: 'Terms of Service' }]}
          k="Legal"
          title="Terms of Service"
          lede={
            <>
              By accessing or using USAMO Guide (&ldquo;we&rdquo;,
              &ldquo;our&rdquo;, or &ldquo;us&rdquo;), you agree to these Terms
              of Service.
            </>
          }
          meta={
            <span>
              Last updated <b>April 3, 2026</b>
            </span>
          }
        />

        <div className="ap-body">
          <AppSection id="use" title="Use of the service">
            <p>
              You may use the service for lawful educational purposes. You agree
              not to misuse the platform, attempt unauthorized access, or
              disrupt service availability for others.
            </p>
          </AppSection>
          <AppSection id="accounts" title="Accounts">
            <p>
              You are responsible for your account activity and for maintaining
              the confidentiality of your login credentials.
            </p>
          </AppSection>
          <AppSection id="license" title="Content and license">
            <p>
              Use of site materials is subject to our license and usage terms.
              For details, see the{' '}
              <a href="https://www.usamoguide.com/license.txt">
                License and Usage page
              </a>
              .
            </p>
          </AppSection>
          <AppSection id="third-party" title="Third-party services">
            <p>
              The platform may integrate with third-party services. Your use of
              those services may also be governed by their terms and policies.
            </p>
          </AppSection>
          <AppSection id="disclaimer" title="Disclaimer">
            <p>
              The service and content are provided on an &ldquo;as is&rdquo;
              basis without warranties of any kind, to the extent permitted by
              law.
            </p>
          </AppSection>
          <AppSection id="changes" title="Changes to these terms">
            <p>
              We may update these terms over time. Continued use of the service
              after updates means you accept the revised terms.
            </p>
          </AppSection>
          <AppSection id="contact" title="Contact">
            <p>
              For questions about these terms, contact us at{' '}
              <a href="mailto:contact@usamoguide.com">contact@usamoguide.com</a>
              .
            </p>
            <p className="ap-also">
              See also the <Link to="/privacy-policy">Privacy Policy</Link>.
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
