import { graphql, useStaticQuery } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';

type JsonLdEntry = Record<string, unknown>;

type SEOProps = {
  description?: string;
  lang?: string;
  meta?: Array<Record<string, unknown>>;
  image?: {
    src: string;
    height: number;
    width: number;
  } | null;
  title?: string | null;
  pathname?: string;
  noIndex?: boolean;
  structuredData?: JsonLdEntry | JsonLdEntry[];
};

function normalizePathname(pathname?: string): string | null {
  if (!pathname) {
    return null;
  }

  const cleanPathname = pathname.split(/[?#]/)[0];
  if (!cleanPathname) {
    return null;
  }

  return cleanPathname.startsWith('/') ? cleanPathname : `/${cleanPathname}`;
}

function SEO({
  description,
  lang = 'en',
  meta,
  image: metaImage,
  title,
  pathname,
  noIndex = false,
  structuredData = [],
}: SEOProps) {
  const { site, image: defaultImage } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          siteName
          description
          author
          keywords
          siteUrl
          locale
          twitterUsername
        }
      }
      image: file(relativePath: { eq: "social-media-image.jpg" }) {
        childImageSharp {
          resize(width: 1200, quality: 100) {
            src
            height
            width
          }
        }
      }
    }
  `);
  if (!metaImage) {
    metaImage = defaultImage.childImageSharp.resize;
  }

  const siteUrl = site.siteMetadata.siteUrl.replace(/\/$/, '');
  const metaDescription = description || site.siteMetadata.description;
  const metaTags = (meta ?? []) as Array<{
    name?: string;
    property?: string;
    content?: unknown;
  }>;
  const image =
    metaImage && metaImage.src ? `${siteUrl}${metaImage.src}` : null;
  const normalizedPathname = normalizePathname(pathname);
  const canonical = normalizedPathname
    ? new URL(normalizedPathname, siteUrl).toString()
    : null;
  const normalizedCanonical = canonical || siteUrl;
  const isHome = !normalizedPathname || normalizedPathname === '/';
  const metaRobots = noIndex
    ? 'noindex,nofollow,noarchive'
    : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
  const navItems = [
    { name: 'Foundations', url: `${siteUrl}/foundations` },
    { name: 'Problem Sets', url: `${siteUrl}/problems` },
    { name: 'Contests', url: 'https://contests.usamoguide.com/' },
    { name: 'Resources', url: `${siteUrl}/other-useful-resources` },
    { name: 'Philosophy', url: `${siteUrl}/philosophy` },
  ];
  const structuredDataEntries: JsonLdEntry[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${siteUrl}#organization`,
      name: site.siteMetadata.siteName || site.siteMetadata.title,
      url: siteUrl,
      logo: `${siteUrl}/images/cropped_circle_image.png`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteUrl}#website`,
      url: siteUrl,
      name: site.siteMetadata.siteName || site.siteMetadata.title,
      description: site.siteMetadata.description,
      inLanguage: site.siteMetadata.locale || lang,
      publisher: {
        '@id': `${siteUrl}#organization`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${normalizedCanonical}#webpage`,
      url: normalizedCanonical,
      name: title || site.siteMetadata.title,
      description: metaDescription,
      inLanguage: site.siteMetadata.locale || lang,
      isPartOf: {
        '@id': `${siteUrl}#website`,
      },
    },
    ...(isHome
      ? navItems.map(item => ({
          '@context': 'https://schema.org',
          '@type': 'SiteNavigationElement',
          name: item.name,
          url: item.url,
        }))
      : []),
    ...(Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    ).filter(Boolean),
  ];
  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={`%s · ${site.siteMetadata.title}`}
      defaultTitle={site.siteMetadata.title}
      link={
        canonical
          ? [
              {
                rel: 'canonical',
                href: canonical,
              },
            ]
          : []
      }
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          name: 'keywords',
          content: site.siteMetadata.keywords.join(','),
        },
        {
          property: `og:title`,
          content: title || site.siteMetadata.title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          property: `og:site_name`,
          content: site.siteMetadata.siteName || site.siteMetadata.title,
        },
        {
          property: `og:locale`,
          content: site.siteMetadata.locale || 'en_US',
        },
        {
          property: `og:url`,
          content: normalizedCanonical,
        },
        {
          name: `robots`,
          content: metaRobots,
        },
        {
          name: `googlebot`,
          content: metaRobots,
        },
        {
          name: `twitter:creator`,
          content: site.siteMetadata.author,
        },
        {
          name: `twitter:site`,
          content:
            site.siteMetadata.twitterUsername || site.siteMetadata.author,
        },
        {
          name: `twitter:url`,
          content: normalizedCanonical,
        },
        {
          name: `twitter:title`,
          content: title || site.siteMetadata.title,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
      ]
        .concat(
          metaImage
            ? [
                {
                  property: 'og:image',
                  content: image,
                },
                {
                  property: 'og:image:width',
                  content: metaImage.width,
                },
                {
                  property: 'og:image:height',
                  content: metaImage.height,
                },
                {
                  name: 'twitter:card',
                  content: 'summary_large_image',
                },
                {
                  name: 'twitter:image',
                  content: image,
                },
              ]
            : [
                {
                  name: 'twitter:card',
                  content: 'summary',
                },
              ]
        )
        .concat(metaTags as any)}
      script={structuredDataEntries.map((schema, index) => ({
        type: 'application/ld+json',
        key: `jsonld-${index}`,
        children: JSON.stringify(schema),
      }))}
    />
  );
}
SEO.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
  noIndex: false,
  structuredData: [],
};
SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string,
  noIndex: PropTypes.bool,
  structuredData: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]),
  image: PropTypes.shape({
    src: PropTypes.string.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  }),
  pathname: PropTypes.string,
};
export default SEO;

// /**
//  * SEO component that queries for data with
//  *  Gatsby's useStaticQuery React hook
//  *
//  * See: https://www.gatsbyjs.org/docs/use-static-query/
//  */
//
// import * as React from 'react';
// import { Helmet } from 'react-helmet';
// import { useStaticQuery, graphql } from 'gatsby';
//
// function SEO({ description = '', lang = 'en', meta = [], title }) {
//   const { site } = useStaticQuery(
//     graphql`
//       query {
//         site {
//           siteMetadata {
//             title
//             description
//             author
//           }
//         }
//       }
//     `
//   );
//
//   const metaDescription = description || site.siteMetadata.description;
//
//   return (
//     <Helmet
//       htmlAttributes={{
//         lang,
//       }}
//       title={title}
//       titleTemplate={`%s | ${site.siteMetadata.title}`}
//       defaultTitle={site.siteMetadata.title}
//       meta={[
//         {
//           name: `description`,
//           content: metaDescription,
//         },
//         {
//           property: `og:title`,
//           content: title,
//         },
//         {
//           property: `og:description`,
//           content: metaDescription,
//         },
//         {
//           property: `og:type`,
//           content: `website`,
//         },
//         {
//           name: `twitter:card`,
//           content: `summary`,
//         },
//         {
//           name: `twitter:creator`,
//           content: site.siteMetadata.author,
//         },
//         {
//           name: `twitter:title`,
//           content: title,
//         },
//         {
//           name: `twitter:description`,
//           content: metaDescription,
//         },
//       ].concat(meta)}
//     />
//   );
// }
//
// export default SEO;
