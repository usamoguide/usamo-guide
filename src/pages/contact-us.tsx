import { PageProps } from 'gatsby';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import Btn from '../components/ug/Btn';
import { IcoCheck, IcoExternal, IcoUsers } from '../components/ug/icons';
import { UG_LINKS } from '../components/ug/links';
import { AppPageHead } from '../components/ug/pages/AppPage';
import { IcoChat, IcoCode, IcoMail } from '../components/ug/pages/pageIcons';
import { useSignIn } from '../context/SignInContext';
import { useCurrentUser } from '../context/UserDataContext/UserDataContext';
import useContactFormAction from '../hooks/useContactFormAction';
import useStickyState from '../hooks/useStickyState';

const Field = ({
  label,
  id,
  value,
  onChange,
  errorMsg = null as string | null,
  autoComplete,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMsg?: string | null;
  autoComplete?: string;
}) => {
  return (
    <div className="ap-field">
      <label htmlFor={id} className="ap-label">
        {label}
      </label>
      <input
        type="text"
        id={id}
        className={errorMsg ? 'ap-in err' : 'ap-in'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={errorMsg ? true : undefined}
        aria-describedby={errorMsg ? `${id}-err` : undefined}
      />
      {errorMsg && (
        <p className="ap-err" id={`${id}-err`}>
          {errorMsg}
        </p>
      )}
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
  const { signIn } = useSignIn();
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
      <TopNavigationBar current="contact" />

      <main className="wrap ap-page">
        <AppPageHead
          crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact us' }]}
          k="Contact"
          title="Contact us"
          lede={
            <>
              Contact us about anything: suggestions, bugs, assistance, and
              more! This will be submitted as a public{' '}
              <a href={UG_LINKS.githubIssues} target="_blank" rel="noreferrer">
                GitHub issue
              </a>
              .
            </>
          }
          pose="panda-point"
        />

        <div className="ap-split">
          <div className="card ap-formcard">
            {showSuccess ? (
              <div className="ap-done" role="status">
                <span className="ap-done-ic" aria-hidden="true">
                  <IcoCheck />
                </span>
                <div>
                  <h2>Message received!</h2>
                  <p>
                    Your message has been submitted as an issue in our GitHub
                    repository. You can track the issue here:{' '}
                    <a href={issueLink} target="_blank" rel="noreferrer">
                      {issueLink}
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <form className="ap-form" onSubmit={handleSubmit} noValidate>
                {!currentUser && (
                  <div className="ap-note">
                    <p>You must be logged in to submit the contact form!</p>
                    <Btn kind="p" size="sm" onClick={() => signIn()}>
                      Log in
                    </Btn>
                  </div>
                )}
                <div className="ap-grid2">
                  <Field
                    label="Name (not shown publicly)"
                    id="contact_name"
                    value={name}
                    autoComplete="name"
                    onChange={e => setName(e.target.value)}
                    errorMsg={
                      showErrors && name === ''
                        ? 'This field is required.'
                        : null
                    }
                  />
                  <Field
                    label="Email (not shown publicly)"
                    id="contact_email"
                    value={email}
                    autoComplete="email"
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
                </div>
                <Field
                  label="Module or solution (if applicable)"
                  id="contact_module"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
                <fieldset className="ap-field">
                  <legend className="ap-label">Topic</legend>
                  <p className="ap-help">
                    The USAMO Guide is a community project and is not affiliated
                    with the MAA, AMC, AIME, USAMO, or AoPS. If your question is
                    about those organizations, please contact them directly.
                  </p>
                  <div className="ap-radios">
                    {topics.map((t, idx) => (
                      <div
                        key={idx}
                        className={topic === t[0] ? 'ap-radio on' : 'ap-radio'}
                      >
                        <label htmlFor={`contact_topic_${idx}`}>
                          <input
                            id={`contact_topic_${idx}`}
                            type="radio"
                            name="type"
                            checked={topic === t[0]}
                            onChange={() => setTopic(t[0])}
                          />
                          <span className="ap-radio-o" aria-hidden="true" />
                          <span className="ap-radio-t">
                            {t[0]}
                            {t.length > 1 ? (
                              <small> (e.g., {t[1]})</small>
                            ) : null}
                          </span>
                        </label>
                        {topic === t[0] && t[0].includes('Mistake') && (
                          <p className="ap-radio-x">
                            Submitting a pull request{' '}
                            <a
                              target="_blank"
                              rel="noreferrer"
                              href="https://github.com/usamoguide/usamo-guide/pulls"
                            >
                              here
                            </a>{' '}
                            is the preferred way to fix a mistake. See{' '}
                            <a
                              target="_blank"
                              rel="noreferrer"
                              href="https://github.com/usamoguide/usamo-guide/blob/main/docs/Math_Topic_Template.md"
                            >
                              this module
                            </a>{' '}
                            for how to contribute.
                          </p>
                        )}
                        {topic === t[0] && t[0].startsWith('Unclear') && (
                          <p className="ap-radio-x">
                            You may get a faster response by reaching out on the{' '}
                            <a
                              href="https://artofproblemsolving.com/community"
                              target="_blank"
                              rel="noreferrer"
                            >
                              AoPS community
                            </a>{' '}
                            instead.
                          </p>
                        )}
                        {topic === t[0] && t[0].includes('Website Bug') && (
                          <p className="ap-radio-x">
                            If you are reporting a loss of user data, please
                            include steps to reproduce and your browser info.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {showErrors && topic === '' && (
                    <p className="ap-err">This field is required.</p>
                  )}
                </fieldset>
                <div className="ap-field">
                  <label htmlFor="contact_message" className="ap-label">
                    Message (markdown is supported)
                  </label>
                  <textarea
                    id="contact_message"
                    rows={6}
                    className={
                      showErrors && message.length < 10
                        ? 'ap-in ap-ta err'
                        : 'ap-in ap-ta'
                    }
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                  {showErrors && !currentUser && (
                    <p className="ap-err">
                      You must be logged in to submit the contact form!
                    </p>
                  )}
                  {showErrors && message.length < 10 && (
                    <p className="ap-err">Message must be at least 10 chars.</p>
                  )}
                </div>
                <div className="ap-form-go">
                  <Btn kind="p" type="submit" disabled={!submitEnabled} arrow>
                    Contact us
                  </Btn>
                </div>
              </form>
            )}
          </div>

          <aside className="ap-aside" aria-label="Other ways to reach us">
            <p className="ap-aside-k">Other ways to reach us</p>
            <a
              className="ap-way"
              href={UG_LINKS.discord}
              target="_blank"
              rel="noreferrer"
            >
              <IcoChat />
              <span>
                <b>Discord</b>
                <small>The fastest way to get an answer.</small>
              </span>
              <IcoExternal />
            </a>
            <a className="ap-way" href="mailto:contact@usamoguide.com">
              <IcoMail />
              <span>
                <b>Email</b>
                <small>contact@usamoguide.com</small>
              </span>
            </a>
            <a
              className="ap-way"
              href={UG_LINKS.github}
              target="_blank"
              rel="noreferrer"
            >
              <IcoCode />
              <span>
                <b>GitHub</b>
                <small>Open a pull request to fix a mistake yourself.</small>
              </span>
              <IcoExternal />
            </a>
            <a
              className="ap-way"
              href="https://artofproblemsolving.com/community"
              target="_blank"
              rel="noreferrer"
            >
              <IcoUsers />
              <span>
                <b>AoPS community</b>
                <small>For help with a math question.</small>
              </span>
              <IcoExternal />
            </a>
          </aside>
        </div>
      </main>
    </Layout>
  );
}
