import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.6';
import prettier from 'https://esm.sh/prettier@3.6.2';

type ProblemMetadata = {
  uniqueId: string;
  name: string;
  url: string;
  source: string;
  difficulty: string;
  isStarred: boolean;
  tags: string[];
  solutionMetadata: { kind: string; url?: string; label?: string; sketch?: string };
};

const PROBLEM_DIFFICULTY_OPTIONS = [
  'Easy',
  'Normal',
  'Medium',
  'Hard',
  'Very Hard',
];

const hashString = async (input: string) => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 12);
};

const generateProblemUniqueId = async (
  source: string,
  name: string,
  link: string
) => {
  return `${source}-${await hashString(`${name}|${link}`)}`;
};

serve(async req => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const githubToken = Deno.env.get('PROBLEM_SUGGESTION_GITHUB_TOKEN') ?? '';

    if (!supabaseUrl || !anonKey || !serviceKey || !githubToken) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase or GitHub env vars.' }),
        { status: 500 }
      );
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'You must be logged in to suggest a problem.' }),
        { status: 401 }
      );
    }

    const {
      name,
      moduleName,
      link,
      difficulty,
      tags,
      additionalNotes,
      problemTableLink,
      section,
      problemListName,
      source,
      filePath,
    } = await req.json();

    if (
      !name ||
      !moduleName ||
      !link ||
      !problemTableLink ||
      !section ||
      !filePath
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields.' }),
        { status: 400 }
      );
    }

    if (String(filePath).includes('..')) {
      return new Response(
        JSON.stringify({ error: 'Invalid filePath.' }),
        { status: 400 }
      );
    }

    const tagsArr = String(tags || '')
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);

    const generatedProblemId = await generateProblemUniqueId(
      source,
      name,
      link
    );
    const suggestedProblem: ProblemMetadata = {
      uniqueId: generatedProblemId,
      name,
      url: link,
      source,
      difficulty,
      isStarred: false,
      tags: tagsArr,
      solutionMetadata: { kind: 'none' },
    };

    const submitterProfile = await supabaseAdmin
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle();

    const submitterName = submitterProfile.data?.display_name ?? user.email;

    const body =
      `User \`${user.id}\` suggested adding the problem [${name}](${link}) ` +
      `to the \`${problemListName}\` table of the module [${moduleName}](${problemTableLink}).\n\n` +
      `**Automatically Generated JSON:**\n` +
      '```json\n' +
      JSON.stringify(suggestedProblem, null, 2) +
      '\n```\n' +
      `**Additional Notes**:${
        additionalNotes ? '\n' + additionalNotes : ' None'
      }\n\n` +
      (source === 'other'
        ? `**Warning: The source of this problem is currently set to \`other\`. You must correct the problem source and the solution before merging.**\n`
        : '') +
      `*This PR was automatically generated from a user-submitted problem suggestion on the USAMO Guide.*`;

    const githubHeaders = {
      Authorization: `token ${githubToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'usamo-guide-supabase',
    };

    const refsResponse = await fetch(
      'https://api.github.com/repos/usamoguide/usamo-guide/git/refs/heads',
      { headers: githubHeaders }
    );
    const refs = await refsResponse.json();
    const masterRef = refs.find((r: any) => r.ref === 'refs/heads/master');
    const masterHash = masterRef.object.sha;

    const branchNameBase = `problem-suggestion/${generatedProblemId}`;
    let increment = 0;
    let foundEmptyBranch = false;
    for (increment; increment < 5; increment++) {
      const branchName =
        branchNameBase + (increment === 0 ? '' : '-' + increment);
      const branchResp = await fetch(
        `https://api.github.com/repos/usamoguide/usamo-guide/branches/${branchName}`,
        { headers: githubHeaders }
      );
      if (branchResp.status === 404) {
        foundEmptyBranch = true;
        break;
      }
    }
    if (!foundEmptyBranch) {
      return new Response(
        JSON.stringify({
          error:
            'More than five suggestions with the same generated problem ID already exist.',
        }),
        { status: 409 }
      );
    }

    const branchName =
      branchNameBase + (increment === 0 ? '' : '-' + increment);
    await fetch('https://api.github.com/repos/usamoguide/usamo-guide/git/refs', {
      method: 'POST',
      headers: githubHeaders,
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: masterHash }),
    });

    const filePathJson = `content/${String(filePath).replace(/\.mdx$/, '.problems.json')}`;
    const oldFileResp = await fetch(
      `https://api.github.com/repos/usamoguide/usamo-guide/contents/${filePathJson}?ref=${branchName}`,
      { headers: githubHeaders }
    );
    const oldFileData = await oldFileResp.json();
    const oldFileHash = oldFileData.sha;
    const oldFileContent = atob(oldFileData.content);

    const parsedOldFileData = JSON.parse(oldFileContent);
    const tableToEdit = parsedOldFileData[problemListName];

    parsedOldFileData[problemListName] = (
      [
        ...tableToEdit.map((el: any, i: number) => ({ index: i, data: el })),
        { index: tableToEdit.length, data: suggestedProblem },
      ] as { index: number; data: ProblemMetadata }[]
    )
      .sort((a, b) => {
        const difficultyDiff =
          PROBLEM_DIFFICULTY_OPTIONS.indexOf(a.data.difficulty) -
          PROBLEM_DIFFICULTY_OPTIONS.indexOf(b.data.difficulty);
        return difficultyDiff !== 0 ? difficultyDiff : a.index - b.index;
      })
      .map(prob => prob.data);

    const newContent = JSON.stringify(parsedOldFileData, null, 2) + '\n';
    const formattedNewContent = prettier.format(newContent, {
      endOfLine: 'lf',
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      useTabs: false,
      trailingComma: 'es5',
      arrowParens: 'avoid',
      parser: 'json',
    });

    await fetch(
      `https://api.github.com/repos/usamoguide/usamo-guide/contents/${filePathJson}`,
      {
        method: 'PUT',
        headers: githubHeaders,
        body: JSON.stringify({
          content: btoa(formattedNewContent),
          message: `Feat: add suggested problem '${name}'`,
          branch: branchName,
          sha: oldFileHash,
        }),
      }
    );

    const prResp = await fetch(
      'https://api.github.com/repos/usamoguide/usamo-guide/pulls',
      {
        method: 'POST',
        headers: githubHeaders,
        body: JSON.stringify({
          head: branchName,
          base: 'master',
          maintainer_can_modify: true,
          title: `Problem Suggestion: Add "${name}" to ${moduleName}`,
          body,
        }),
      }
    );
    const pr = await prResp.json();

    await fetch(
      `https://api.github.com/repos/usamoguide/usamo-guide/issues/${pr.number}/labels`,
      {
        method: 'POST',
        headers: githubHeaders,
        body: JSON.stringify(['Problem Suggestion']),
      }
    );

    return new Response(JSON.stringify({ url: pr.html_url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error?.message ?? 'Unknown error' }),
      { status: 500 }
    );
  }
});
