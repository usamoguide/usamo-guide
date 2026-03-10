require('dotenv').config();

if (!process.env.GATSBY_SUPABASE_URL && process.env.SUPABASE_URL) {
  process.env.GATSBY_SUPABASE_URL = process.env.SUPABASE_URL;
}

if (!process.env.GATSBY_SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY) {
  process.env.GATSBY_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
}

const flags = {
  FAST_DEV: false,
  DEV_SSR: false,
};

const siteMetadata = {
  title: `USAMO Guide`,
  description: `A comprehensive, free learning platform for AMC 8, AMC 10/12, AIME, and USAMO mathematics. Organized lessons, worked examples, and curated problem sets with full solutions.`,
  author: `@usamoguide`,
  siteUrl: `https://usamo.guide/`,
  keywords: ['USAMO', 'AIME', 'AMC 10', 'AMC 12', 'AMC 8', 'Math Contest'],
};

const plugins = [
  {
    resolve: 'gatsby-plugin-sitemap',
    options: {
      excludes: ['/license/', '/editor/'],
    },
  },
  {
    resolve: `gatsby-plugin-typescript`,
    options: {
      allowNamespaces: true,
    },
  },
  /* any images referenced by .mdx needs to be loaded before the mdx file is loaded. */
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      path: `${__dirname}/src/assets`,
      name: `assets`,
    },
  },
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      path: `${__dirname}/content`,
      name: `content-images`,
      ignore: [`**/*.json`, `**/*.mdx`],
    },
  },
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      path: `${__dirname}/solutions`,
      name: `solution-images`,
      ignore: [`**/*.json`, `**/*.mdx`],
    },
  },
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      path: `${__dirname}/content`,
      name: `content`,
    },
  },
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      path: `${__dirname}/solutions`,
      name: `solutions`,
    },
  },
  `gatsby-plugin-image`,
  `gatsby-plugin-sharp`,
  {
    resolve: `gatsby-plugin-postcss`,
  },
  `gatsby-plugin-react-helmet`,
  `gatsby-plugin-catch-links`,
  `gatsby-transformer-sharp`,
  {
    resolve: `gatsby-plugin-manifest`,
    options: {
      name: `USAMO Guide`,
      short_name: `USAMO`,
      start_url: `/`,
      background_color: `#0f172a`,
      theme_color: `#0f172a`,
      display: `minimal-ui`,
      icon: `src/assets/usamo-logo.svg`, // This path is relative to the root of the site.
    },
  },
  {
    resolve: `gatsby-plugin-google-gtag`,
    options: {
      trackingIds: ['G-1JGYFFBHXN'],
      pluginConfig: {
        head: false,
      },
    },
  },
  {
    // This plugin must be placed last in your list of plugins to ensure that it can query all the GraphQL data
    resolve: 'gatsby-plugin-algolia',
    options: {
      appId: process.env.ALGOLIA_APP_ID,
      apiKey: process.env.ALGOLIA_API_KEY,
      queries: require('./src/utils/algolia-queries'),
      enablePartialUpdates: true,
      skipIndexing: !process.env.ALGOLIA_APP_ID,
    },
  },
  // devMode currently has some sketchy output
  // See https://github.com/JimmyBeldone/gatsby-plugin-webpack-bundle-analyser-v2/issues/343
  // {
  //   resolve: 'gatsby-plugin-webpack-bundle-analyser-v2',
  //   options: {
  //     devMode: false,
  //   },
  // },
  `gatsby-plugin-meta-redirect`,
];

module.exports = {
  flags,
  siteMetadata,
  plugins,
  graphqlTypegen: {
    generateOnBuild: process.env.NODE_ENV === 'production',
    typesOutputPath:
      process.env.NODE_ENV === 'production'
        ? 'src/gatsby-types.d.ts'
        : '.cache/typegen/gatsby-types.d.ts',
  },
};
