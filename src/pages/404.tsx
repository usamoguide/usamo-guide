import * as React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import Btn from '../components/ug/Btn';
import { UG_LINKS } from '../components/ug/links';
import { AppPageHead } from '../components/ug/pages/AppPage';

export default function NotFoundPage() {
  return (
    <Layout>
      <SEO
        title="404 Not Found"
        image={undefined}
        pathname={undefined}
        noIndex
      />
      <TopNavigationBar />

      <main className="wrap ap-page ap-404">
        <AppPageHead
          k="Error 404"
          title="We couldn't find that page."
          lede="The link may be broken, or the page may have moved. Head back home, or look for a problem by name."
          pose="panda-stuck"
        >
          <Btn kind="p" size="lg" to="/" arrow>
            Return home
          </Btn>
          <Btn kind="s" size="lg" to={UG_LINKS.problems}>
            Search problems
          </Btn>
        </AppPageHead>
      </main>
    </Layout>
  );
}
