import { PageProps } from 'gatsby';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import { useCurrentUser } from '../context/UserDataContext/UserDataContext';
import useContactFormAction from '../hooks/useContactFormAction';
import useStickyState from '../hooks/useStickyState';

const Field = ({
  label,
  id,
  value,
  onChange,
  errorMsg = null as string | null,
}) => {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm leading-5 font-medium text-[var(--text-secondary)]"
      >
        {label}
      </label>
      <div className="relative rounded-md">
        <input
          type="text"
          id={id}
          className={
            'w-full rounded-md border border-[var(--border)] bg-[rgba(10,8,24,0.60)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[rgba(244,237,234,0.35)] focus:border-[var(--accent-fill)] focus:ring-1 focus:ring-[var(--accent-fill)] focus:outline-none' +
            (errorMsg
              ? ' border-red-400 focus:border-red-400 focus:ring-red-400'
              : '')
          }
          value={value}
          onChange={onChange}
        />
        {errorMsg && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      {errorMsg && <p className="mt-2 text-sm text-red-400">{errorMsg}</p>}
    </div>
  );
};

const validateEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export default function ContactUsPage(props: PageProps) {
  const currentUser = useCurrentUser();
  const submitForm = useContactFormAction();
  const defaultLocation = useMemo(() => {
    const search = props.location?.search ?? '';
    if (!search) return '';
    const params = new URLSearchParams(search);
    return params.get('location') ?? '';
  }, [props.location?.search]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState(defaultLocation);
  const [topic, setTopic] = useStickyState('', 'contact_form_topic');
  const [message, setMessage] = useStickyState('', 'contact_form_message');
  const [showSuccess, setShowSuccess] = useState(false);
  const [issueLink, setIssueLink] = useState('');
  const [submitEnabled, setSubmitEnabled] = useState(true);
  const [showErrors, setShowErrors] = useState(false);

  const topics = [
    ['Mistake', 'typo, broken link, wrong time complexity, wrong code'],
    ['Unclear Explanation'],
    ['Website Bug'],
    ['Suggestion'],
    ['Request - Missing Section or Solution'],
    ['Other'],
  ];

  useEffect(() => {
    if (!currentUser) return;
    if (email === '') {
      setEmail(currentUser.email!);
    }
    if (name === '') {
      setName(currentUser.displayName!);
    }
  }, [currentUser]);

  useEffect(() => {
    setLocation(defaultLocation);
  }, [defaultLocation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setShowErrors(true);
    if (
      name === '' ||
      email === '' ||
      !validateEmail(email) ||
      topic === '' ||
      message.length < 10 ||
      !currentUser
    ) {
      return;
    }
    setSubmitEnabled(false);
    try {
      const response = await submitForm({
        name,
        email,
        moduleName: location,
        url: window.location.href,
        topic,
        message,
      });
      setTopic('');
      setMessage('');
      setShowSuccess(true);
      setIssueLink(response.data as string);
    } catch (err: any) {
      setSubmitEnabled(true);
      alert('Form submission failed: ' + err.message);
    } finally {
      setShowErrors(false);
    }
  };

  return (
    <Layout>
      <SEO title="Contact Us" pathname={props.path} />
      <div
        data-page-tone="dark"
        className="min-h-screen"
        style={{
          background: 'var(--bg-page)',
        }}
      >
        <TopNavigationBar linkLogoToIndex={true} redirectToDashboard={false} />
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl leading-tight font-bold text-[var(--text-primary)]">
              Contact Us
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Contact us about anything: suggestions, bugs, assistance, and
              more! This will be submitted as a public{' '}
              <a
                href="https://github.com/usamoguide/usamo-guide/issues"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--accent)] underline hover:text-[var(--text-primary)]"
              >
                Github issue
              </a>
              .
            </p>
          </div>
          <div className="rounded-xl bg-[var(--card-bg)]">
            <form className="px-4 py-5 sm:p-6" onSubmit={handleSubmit}>
              {showSuccess && (
                <div className="rounded-md bg-green-50 p-4 dark:bg-green-800">
                  <div className="flex">
                    <div className="grow-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm leading-5 font-medium text-green-300">
                        Message received!
                      </h3>
                      <div className="mt-2 text-sm leading-5 text-green-400">
                        <p>
                          Your message has been submitted as an issue in our
                          GitHub repository. You can track the issue here:{' '}
                          <a
                            href={issueLink}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold hover:underline"
                          >
                            {issueLink}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!showSuccess && (
                <div className="space-y-6">
                  {!currentUser && (
                    <p className="mt-2 text-sm text-red-400">
                      You must be logged in to submit the contact form!
                    </p>
                  )}
                  <Field
                    label="Name (will not be shown publicly)"
                    id="contact_name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    errorMsg={
                      showErrors && name === ''
                        ? 'This field is required.'
                        : null
                    }
                  />
                  <Field
                    label="Email (will not be shown publicly)"
                    id="contact_email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    errorMsg={
                      showErrors
                        ? email === ''
                          ? 'This field is required.'
                          : !validateEmail(email)
                            ? 'Please enter a valid email address.'
                            : null
                        : null
                    }
                  />
                  <Field
                    label="Module or Solution (if applicable)"
                    id="contact_module"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                  <fieldset className="space-y-2">
                    <legend className="text-sm leading-5 font-medium text-[var(--text-secondary)]">
                      Topic
                    </legend>
                    <div className="text-sm text-[var(--text-muted)]">
                      The USAMO Guide is a community project and is not
                      affiliated with the MAA, AMC, AIME, USAMO, or AoPS. If
                      your question is about those organizations, please contact
                      them directly.
                    </div>
                    <div className="space-y-3">
                      {topics.map((t, idx) => (
                        <div key={idx}>
                          <div className="relative flex items-start">
                            <div className="absolute flex h-5 items-center">
                              <input
                                id={`contact_topic_${idx}`}
                                type="radio"
                                name="type"
                                className="form-radio h-4 w-4 border-[var(--border)] bg-[var(--bg-surface)] accent-[var(--accent-fill)]"
                                checked={topic === t[0]}
                                onChange={() => setTopic(t[0])}
                              />
                            </div>
                            <div className="pl-7 text-sm leading-5">
                              <label
                                htmlFor={`contact_topic_${idx}`}
                                className="font-medium text-[var(--text-secondary)]"
                              >
                                {t[0]} {t.length > 1 ? `(e.g., ${t[1]})` : ''}
                              </label>
                              {topic === t[0] && t[0].includes('Mistake') && (
                                <div>
                                  Submitting a pull request{' '}
                                  <a
                                    className="text-[var(--accent)] hover:underline"
                                    target="_blank"
                                    rel="noreferrer"
                                    href="https://github.com/usamoguide/usamo-guide/pulls"
                                  >
                                    here
                                  </a>{' '}
                                  is the preferred way to fix a mistake. See{' '}
                                  <a
                                    className="text-blue-600 hover:underline dark:text-blue-300"
                                    target="_blank"
                                    rel="noreferrer"
                                    href="https://github.com/usamoguide/usamo-guide/blob/main/docs/Math_Topic_Template.md"
                                  >
                                    this module
                                  </a>{' '}
                                  for how to contribute.
                                </div>
                              )}
                              {topic === t[0] && t[0].startsWith('Unclear') && (
                                <div>
                                  You may get a faster response by reaching out
                                  on the{' '}
                                  <a
                                    className="text-blue-600 hover:underline dark:text-blue-300"
                                    href="https://artofproblemsolving.com/community"
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    AoPS community
                                  </a>{' '}
                                  instead.
                                </div>
                              )}
                              {topic === t[0] &&
                                t[0].includes('Website Bug') && (
                                  <div>
                                    If you are reporting a loss of user data,
                                    please include steps to reproduce and your
                                    browser info.
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {showErrors && topic === '' && (
                        <p className="mt-2 text-sm text-red-400">
                          This field is required.
                        </p>
                      )}
                    </div>
                  </fieldset>
                  <div className="space-y-1">
                    <label
                      htmlFor="contact_message"
                      className="block text-sm leading-5 font-medium text-[var(--text-secondary)]"
                    >
                      Message (markdown is supported)
                    </label>
                    {showErrors && !currentUser && (
                      <p className="mt-2 text-sm text-red-400">
                        You must be logged in to submit the contact form!
                      </p>
                    )}
                    <div className="relative rounded-md">
                      <textarea
                        id="contact_message"
                        rows={5}
                        className={
                          'w-full rounded-md border border-[var(--border)] bg-[rgba(10,8,24,0.60)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[rgba(244,237,234,0.35)] focus:border-[var(--accent-fill)] focus:ring-1 focus:ring-[var(--accent-fill)] focus:outline-none ' +
                          (showErrors && message.length < 10
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                            : '')
                        }
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                      />
                      {showErrors && message.length < 10 && (
                        <div className="pointer-events-none absolute top-0 right-0 flex items-center pt-2 pr-3">
                          <svg
                            className="h-5 w-5 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    {showErrors && message.length < 10 && (
                      <p className="mt-2 text-sm text-red-400">
                        Message must be at least 10 chars.
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!submitEnabled}
                      className="rounded-lg bg-[var(--accent-fill)] px-5 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-fill-hover)] disabled:opacity-50"
                    >
                      Contact Us
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </Layout>
  );
}
