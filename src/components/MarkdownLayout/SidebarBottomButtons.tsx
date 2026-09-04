import { Link } from 'gatsby';
import * as React from 'react';
import { useMarkdownLayout } from '../../context/MarkdownLayoutContext';

const SidebarBottomButtons = () => {
  const { setIsMobileNavOpen } = useMarkdownLayout();
  return (
    <>
      <div className="flex shrink-0 border-t border-[var(--border)] dark:border-[var(--border)]">
        <Link
          className="group dark:text-dark-med-emphasis dark:hover:text-dark-high-emphasis dark:focus:text-dark-high-emphasis flex flex-1 items-center p-4 text-sm leading-5 font-medium text-[var(--text-muted)] transition duration-150 ease-in-out hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] focus:bg-[var(--bg-surface-alt)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] dark:hover:bg-[var(--accent-soft)] dark:focus:bg-[var(--bg-surface-alt)]"
          to="/settings"
        >
          <svg
            className="mr-4 h-6 w-6 text-[var(--text-muted)] transition duration-150 ease-in-out group-hover:text-[var(--text-primary)] group-focus:text-[var(--text-muted)] dark:text-[var(--text-muted)] dark:group-hover:text-[var(--text-primary)]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Settings
        </Link>
      </div>
      <div className="flex shrink-0 border-t border-[var(--border)] dark:border-[var(--border)]">
        <Link
          className="group dark:text-dark-med-emphasis dark:hover:text-dark-high-emphasis dark:focus:text-dark-high-emphasis flex flex-1 items-center p-4 text-sm leading-5 font-medium text-[var(--text-muted)] transition duration-150 ease-in-out hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] focus:bg-[var(--bg-surface-alt)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] dark:hover:bg-[var(--accent-soft)] dark:focus:bg-[var(--bg-surface-alt)]"
          to="/contact-us"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <svg
            className="mr-4 h-6 w-6 text-[var(--text-muted)] transition duration-150 ease-in-out group-hover:text-[var(--text-primary)] group-focus:text-[var(--text-muted)] dark:text-[var(--text-muted)] dark:group-hover:text-[var(--text-primary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Contact Us
        </Link>
      </div>
    </>
  );
};

export default SidebarBottomButtons;
