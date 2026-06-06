import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as freshOrdering from './content/ordering';
import { typeDefs } from './graphql-types';
import { createXdmNode } from './src/gatsby/create-xdm-node';
import {
  getProblemInfo,
  getProblemURL,
  ProblemMetadata,
} from './src/models/problem';

const SECTION_FROM_CONTENT_DIR = {
  '1_Foundations': 'foundations',
  '2_Intermediate': 'intermediate',
  '3_Advanced': 'advanced',
  '4_USAMO': 'usamo',
} as const;

type SectionID = keyof typeof freshOrdering.SECTION_LABELS;

const normalizePath = (p: string) => p.replace(/\\/g, '/');

function getSectionFromContentRelativePath(
  relativePath: string
): SectionID | null {
  const normalized = normalizePath(relativePath);
  const [rootDir] = normalized.split('/');
  return (SECTION_FROM_CONTENT_DIR as Record<string, SectionID>)[rootDir] ?? null;
}

function parseFrontmatterId(content: string): string | null {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) return null;
  const idMatch = frontmatterMatch[1].match(
    /^id:\s*['\"]?([^'\"\n]+)['\"]?\s*$/m
  );
  return idMatch ? idMatch[1].trim() : null;
}

function collectAutoModuleSectionMap() {
  const contentRoot = path.join(__dirname, 'content');
  const autoMap: Record<string, SectionID> = {};

  const walk = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue;

      const relativeFromContent = path.relative(contentRoot, fullPath);
      const section = getSectionFromContentRelativePath(relativeFromContent);
      if (!section) continue;

      const content = fs.readFileSync(fullPath, 'utf8');
      const moduleId = parseFrontmatterId(content);
      if (moduleId) {
        autoMap[moduleId] = section;
      }
    }
  };

  if (fs.existsSync(contentRoot)) {
    walk(contentRoot);
  }

  return autoMap;
}

const autoModuleIDToSectionMap = collectAutoModuleSectionMap();
const resolvedModuleIDToSectionMap: Record<string, SectionID> = {
  ...freshOrdering.moduleIDToSectionMap,
  ...autoModuleIDToSectionMap,
};

let gitAvailable: boolean | null = null;
let unshallowAttempted = false;

function hasGitRepo() {
  if (gitAvailable !== null) return gitAvailable;
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    gitAvailable = true;
  } catch {
    gitAvailable = false;
  }
  return gitAvailable;
}

function isShallowGitRepo() {
  if (!hasGitRepo()) return false;
  try {
    const output = execSync('git rev-parse --is-shallow-repository', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()
      .toLowerCase();
    return output === 'true';
  } catch {
    return false;
  }
}

function getGitAuthorTime(filePath: string) {
  if (hasGitRepo()) {
    try {
      return execSync(`git log -1 --pretty=format:%aI ${filePath}`).toString();
    } catch {
      // Fall through to file mtime.
    }
  }
  try {
    return fs.statSync(filePath).mtime.toISOString();
  } catch {
    return null;
  }
}

// Questionable hack to get full commit history so that timestamps work
if (!unshallowAttempted && hasGitRepo() && isShallowGitRepo()) {
  unshallowAttempted = true;
  try {
    execSync('git fetch --unshallow');
  } catch (e) {
    console.warn(
      'Git fetch failed. Ignore this if developing or building locally.'
    );
  }
}

// ideally problems would be its own query with
// source nodes: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#sourceNodes
let stream = fs.createWriteStream('ids.log', { flags: 'a' });
exports.onCreateNode = async api => {
  const { node, actions, loadNodeContent, createContentDigest, createNodeId } =
    api;
  const { createNodeField, createNode, createParentChildLink } = actions;
  if (node.internal.type === `File` && node.ext === '.mdx') {
    const content = await loadNodeContent(node);
    const xdmNode = await createXdmNode(
      {
        id: createNodeId(`${node.id} >>> Xdm`),
        node,
        content,
      },
      api
    );
    createNode(xdmNode);
    createParentChildLink({ parent: node, child: xdmNode });
  }
  function transformObject(obj, id) {
    const problemInfoNode = {
      ...obj,
      id,
      children: [],
      parent: node.id,
      internal: {
        contentDigest: createContentDigest(obj),
        type: 'ProblemInfo',
      },
    };
    createNode(problemInfoNode);
    createParentChildLink({ parent: node, child: problemInfoNode });
  }
  const isExtraProblems =
    node.internal.mediaType === 'application/json' &&
    node.sourceInstanceName === 'content' &&
    node.relativePath.endsWith('extraProblems.json');
  if (
    node.internal.mediaType === 'application/json' &&
    node.sourceInstanceName === 'content' &&
    (node.relativePath.endsWith('.problems.json') || isExtraProblems)
  ) {
    const content = await loadNodeContent(node);
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      const hint = node.absolutePath
        ? `file ${node.absolutePath}`
        : `in node ${node.id}`;
      throw new Error(`Unable to parse JSON: ${hint}`);
    }
    const moduleId = parsedContent['MODULE_ID'];
    if (!moduleId && !isExtraProblems) {
      throw new Error(
        'Module ID not found in problem JSON file: ' + node.absolutePath
      );
    }

    const sectionFromPath = getSectionFromContentRelativePath(node.relativePath);
    const moduleSection =
      (moduleId && resolvedModuleIDToSectionMap[moduleId]) || sectionFromPath;
    const mapForNode = moduleId
      ? {
          ...resolvedModuleIDToSectionMap,
          ...(moduleSection ? { [moduleId]: moduleSection } : {}),
        }
      : resolvedModuleIDToSectionMap;

    if (!isExtraProblems && !moduleSection) {
      throw new Error(
        '.problems.json moduleId cannot be resolved from content ordering or file path: ' +
          moduleId +
          ', path: ' +
          node.absolutePath
      );
    }
    Object.keys(parsedContent).forEach(tableId => {
      if (tableId === 'MODULE_ID') return;
      try {
        parsedContent[tableId].forEach((metadata: ProblemMetadata) => {
          // Validate that statement is provided
          if (!metadata.statement || !metadata.statement.trim()) {
            throw new Error(
              `Problem "${metadata.uniqueId}" (${metadata.name}) is missing a required statement field. ` +
              `All problems must include their full problem statement in Markdown format. ` +
              `File: ${node.absolutePath}`
            );
          }
          if (process.env.CI) stream.write(metadata.uniqueId + '\n');
          transformObject(
            {
              ...getProblemInfo(metadata, {
                ...freshOrdering,
                moduleIDToSectionMap: mapForNode,
              }),
              module: moduleId,
            },
            createNodeId(
              `${node.id} ${tableId} ${metadata.uniqueId} >>> ProblemInfo`
            )
          );
        });
      } catch (e) {
        console.error(
          'Failed to create problem info for',
          parsedContent[tableId]
        );
        throw new Error(e);
      }
    });
    if (moduleId) {
      // create a node that contains all of a module's problems
      const id = createNodeId(`${node.id} >>> ModuleProblemLists`);
      const problemLists = Object.keys(parsedContent)
        .filter(x => x !== 'MODULE_ID')
        .map(listId => ({
          listId,
          problems: parsedContent[listId].map(x => {
            return {
              ...getProblemInfo(x, {
                ...freshOrdering,
                moduleIDToSectionMap: mapForNode,
              }),
            };
          }),
        }));
      const data = {
        problemLists,
        moduleId,
      };
      const problemInfoNode = {
        ...data,
        id,
        children: [],
        parent: node.id,
        internal: {
          contentDigest: createContentDigest(data),
          type: 'ModuleProblemLists',
        },
      };
      createNode(problemInfoNode);
      createParentChildLink({ parent: node, child: problemInfoNode });
    }
  } else if (
    node.internal.type === 'Xdm' &&
    node.fileAbsolutePath.includes('content')
  ) {
    if (!node.frontmatter?.id || !node.frontmatter?.title) {
      return;
    }

    const contentRoot = path.join(__dirname, 'content');
    const relativeFromContent = path.relative(contentRoot, node.fileAbsolutePath);
    const inferredDivision =
      resolvedModuleIDToSectionMap[node.frontmatter.id] ||
      getSectionFromContentRelativePath(relativeFromContent);

    if (!inferredDivision) {
      console.warn(
        'Skipping content MDX without recognized section directory: ' +
          node.absolutePath
      );
      return;
    }
    createNodeField({
      name: 'division',
      node,
      value: inferredDivision,
    });
    // https://angelos.dev/2019/09/add-support-for-modification-times-in-gatsby/
    const gitAuthorTime = getGitAuthorTime(node.fileAbsolutePath);
    if (gitAuthorTime) {
      createNodeField({
        node,
        name: 'gitAuthorTime',
        value: gitAuthorTime,
      });
    }
  }
};

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    cache: false,
  });
};

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage, createRedirect } = actions;
  const redirectsData = fs.readFileSync('./src/redirects.txt');
  (redirectsData + '')
    .split('\n')
    .filter(line => line != '')
    .filter(line => line.charAt(0) !== '#')
    .map(line => {
      const tokens = line.split('\t');
      return {
        from: tokens[0],
        to: tokens[1],
      };
    })
    .forEach(({ from, to }) => {
      createRedirect({
        fromPath: from,
        toPath: to,
        isPermanent: true,
      });
    });
  const result = await graphql(`
    query CreatePagesQuery {
      modules: allXdm(
        filter: {
          fileAbsolutePath: { regex: "/content/" }
          fields: { division: { ne: null } }
        }
      ) {
        edges {
          node {
            frontmatter {
              id
              redirects
              prerequisites
            }
            fields {
              division
            }
            fileAbsolutePath
          }
        }
      }
      problems: allProblemInfo {
        edges {
          node {
            uniqueId
            name
            url
            tags
            source
            solution {
              kind
              label
              labelTooltip
              sketch
              url
              hasHints
            }
            difficulty
            module {
              frontmatter {
                id
              }
            }
          }
        }
      }
    }
  `);
  if (result.errors) {
    reporter.panicOnBuild('🚨 ERROR: Loading "createPages" query');
    return;
  }
  // Check to make sure problems with the same unique ID have consistent information, and that there aren't duplicate slugs
  const problems = result.data.problems.edges;
  let problemSlugs = {}; // maps slug to problem unique ID
  let problemInfo = {}; // maps unique problem ID to problem info
  let problemURLToUniqueID = {}; // maps problem URL to problem unique ID
  let urlsThatCanHaveMultipleUniqueIDs: string[] = [
    'https://usamoguide.com/',
    'https://www.omegalearn.org/mastering-amc8',
  ];
  problems.forEach(({ node }) => {
    let slug = getProblemURL(node);
    if (
      problemSlugs.hasOwnProperty(slug) &&
      problemSlugs[slug] !== node.uniqueId
    ) {
      throw new Error(
        `The problems ${problemSlugs[slug]} and ${node.uniqueId} have the same slugs!`
      );
    }
    if (problemInfo.hasOwnProperty(node.uniqueId)) {
      const a = node,
        b = problemInfo[node.uniqueId];
      if (a.name !== b.name || a.url !== b.url || a.source !== b.source) {
        throw new Error(
          `The problem ${node.uniqueId} appears more than once but has different information! They need to have the same name / url / source.`
        );
      }
    }
    if (
      problemURLToUniqueID.hasOwnProperty(node.url) &&
      problemURLToUniqueID[node.url] !== node.uniqueId &&
      !urlsThatCanHaveMultipleUniqueIDs.includes(node.url)
    ) {
      throw new Error(
        `The URL ${node.url} is assigned to both problem unique ID ${
          problemURLToUniqueID[node.url]
        } and ${
          node.uniqueId
        }. Is this correct? (If this is correct, add the URL to \`urlsThatCanHaveMultipleUniqueIDs\` in gatsby-node.ts)`
      );
    }

    problemSlugs[slug] = node.uniqueId;
    problemInfo[node.uniqueId] = node;
    problemURLToUniqueID[node.url] = node.uniqueId;
  });
  // End problems check
  const problemPageTemplate = path.resolve(`./src/templates/problemTemplate.tsx`);
  const problemPagesSeen = new Set<string>();
  problems.forEach(({ node }) => {
    if (problemPagesSeen.has(node.uniqueId)) return;
    problemPagesSeen.add(node.uniqueId);
    createPage({
      path: getProblemURL(node),
      component: problemPageTemplate,
      context: {
        uniqueId: node.uniqueId,
      },
    });
  });
  const moduleTemplate = path.resolve(`./src/templates/moduleTemplate.tsx`);
  const modules = result.data.modules.edges;
  modules.forEach(({ node }) => {
    if (!node.fields?.division) return;
    const path = `/${node.fields.division}/${node.frontmatter.id}`;
    if (node.frontmatter.redirects) {
      node.frontmatter.redirects.forEach(fromPath => {
        createRedirect({
          fromPath,
          toPath: path,
          redirectInBrowser: true,
          isPermanent: true,
        });
      });
    }
    createPage({
      path,
      component: moduleTemplate,
      context: {
        id: node.frontmatter.id,
      },
    });

    // const freshOrdering = importFresh<any>(
    //   path.join(__dirname, './content/ordering.ts')
    // );
    if (node.frontmatter.prerequisites)
      for (const prereq of node.frontmatter.prerequisites) {
        if (!(prereq in resolvedModuleIDToSectionMap)) {
          console.warn(
            'Module ' +
              node.fileAbsolutePath +
              ': Prerequisite "' +
              prereq +
              '" is not a module'
          );
        }
      }
  });  // Generate Syllabus Pages //
  const syllabusTemplate = path.resolve(`./src/templates/syllabusTemplate.tsx`);
  freshOrdering.SECTIONS.forEach(division => {
    createPage({
      path: `/${division}`,
      component: syllabusTemplate,
      context: {
        division: division,
      },
    });
  });
  // End Generate Syllabus Pages //
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  createTypes(typeDefs);
};
exports.onCreateWebpackConfig = ({ actions, stage, loaders, plugins }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        path: path.resolve('path-browserify'),
      },
      fallback: {
        fs: false,
      },
    },
    module: {
      rules: [
        {
          test: /\.mdx$/,
          use: [
            loaders.js(),
            {
              loader: path.resolve(__dirname, 'src/gatsby/webpack-xdm.js'),
              options: {},
            },
          ],
        },
      ],
    },
  });
  if (stage === 'build-javascript' || stage === 'develop') {
    actions.setWebpackConfig({
      plugins: [plugins.provide({ process: 'process/browser' })],
    });
  }
  if (stage === 'develop') {
    actions.setWebpackConfig({
      cache: false,
      devServer: {
        hot: false,
        liveReload: true,
      },
    });
  }
  if (stage === 'build-html' || stage === 'develop-html') {
    actions.setWebpackConfig({
      module: {
        rules: [],
      },
    });
  }
};

exports.onPostBuild = async ({ graphql, reporter }) => {
  const result = await graphql(`
    query SitemapQuery {
      site {
        siteMetadata {
          siteUrl
        }
      }
      allSitePage {
        nodes {
          path
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('Failed to generate sitemap.');
    return;
  }

  const envSiteUrl =
    process.env.SITE_URL ||
    (process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '') ||
    'http://localhost:8000';
  const baseUrl = envSiteUrl || result.data?.site?.siteMetadata?.siteUrl;

  const excludedPathPrefixes = [
    '/404',
    '/auth',
    '/dashboard',
    '/dev-404-page',
    '/offline-plugin-app-shell-fallback',
    '/settings',
    '/test',
  ];
  const shouldIndexPath = (pathname: string) => {
    if (pathname === '/') {
      return true;
    }

    const normalizedPath = pathname.replace(/\/+$/, '') || '/';
    return !excludedPathPrefixes.some(
      prefix => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
    );
  };

  const rawPaths = (result.data?.allSitePage?.nodes || [])
    .map(node => node?.path)
    .filter(Boolean);
  const filteredPaths = rawPaths.filter(
    path => path.startsWith('/api/') === false && shouldIndexPath(path)
  );
  const uniquePaths = Array.from(new Set(filteredPaths));
  const urls = uniquePaths.length ? uniquePaths : ['/'];

  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(path => `  <url><loc>${baseUrl}${path}</loc></url>`),
    '</urlset>',
  ];

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xmlLines.join('\n'));
  reporter.info(`Sitemap written to ${path.join(publicDir, 'sitemap.xml')}`);
};
