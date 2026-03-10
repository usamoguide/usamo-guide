import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.6';

serve(async req => {
  try {
    const { name, email, moduleName, url, lang, topic, message } =
      await req.json();

    if (!name || !topic || !message || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields.' }),
        { status: 400 }
      );
    }

    const githubToken = Deno.env.get('CONTACT_FORM_GITHUB_TOKEN');
    if (!githubToken) {
      return new Response(
        JSON.stringify({ error: 'Missing CONTACT_FORM_GITHUB_TOKEN.' }),
        { status: 500 }
      );
    }

    const body =
      `Someone submitted the contact form!\n\n` +
      `**URL**: ${url}\n` +
      `**Module**: ${moduleName ? moduleName : 'None'}\n` +
      `**Topic**: ${topic}\n` +
      `**Message**: \n${message}`;

    const labels: string[] = [];
    if (
      topic.includes('Mistake') ||
      topic.includes('Unclear Explanation') ||
      topic.includes('Request')
    ) {
      labels.push('content', 'good first issue');
    }
    if (topic.includes('Website Bug')) {
      labels.push('website', 'bug');
    }
    if (topic.includes('Suggestion')) labels.push('enhancement');

    let title = `Contact Form Submission - ${topic}`;
    if (moduleName) {
      title += ` (${moduleName})`;
    }

    const issueResponse = await fetch(
      'https://api.github.com/repos/usamoguide/usamo-guide/issues',
      {
        method: 'POST',
        headers: {
          Authorization: `token ${githubToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'usamo-guide-supabase',
        },
        body: JSON.stringify({
          title,
          body,
          labels,
        }),
      }
    );

    if (!issueResponse.ok) {
      const errorText = await issueResponse.text();
      return new Response(
        JSON.stringify({ error: `GitHub error: ${errorText}` }),
        { status: 502 }
      );
    }

    const issue = await issueResponse.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    await supabase.from('contact_form_submissions').insert({
      name,
      email,
      module_name: moduleName,
      url,
      lang,
      topic,
      message,
      issue_number: issue.number,
    });

    return new Response(JSON.stringify({ url: issue.html_url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error?.message ?? 'Unknown error' }),
      { status: 500 }
    );
  }
});
