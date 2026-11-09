import * as React from 'react';
import { useCurrentUser } from '../../../context/UserDataContext/UserDataContext';
import { useActiveGroup } from '../../../hooks/groups/useActiveGroup';
import { usePostActions } from '../../../hooks/groups/usePostActions';
import { GroupProblemData } from '../../../models/groups/problem';

// const ScoreInput = styled.input`
//   &::-webkit-outer-spin-button,
//   &::-webkit-inner-spin-button {
//     -webkit-appearance: none;
//     margin: 0;
//   }
//
//   /* Firefox */
//   &[type='number'] {
//     -moz-appearance: textfield;
//   }
// `;

export default function ProblemSubmissionInterface({
  problem,
}: {
  problem: GroupProblemData;
}) {
  const currentUser = useCurrentUser();
  const [submissionLink, setSubmissionLink] = React.useState('');
  const activeGroup = useActiveGroup();
  const { submitSubmissionLink } = usePostActions(
    activeGroup.activeGroupId!
  );

  if (activeGroup.activeUserId !== currentUser?.uid) {
    // this suggests the parent is viewing the child's account
    // or a group owner is viewing the group as a group member. either way
    // don't allow submissions.
    return (
      <p className="italic">
        Submission disabled while viewing another user's account.
      </p>
    );
  }

  const handleSubmitLink = async e => {
    e.preventDefault();
    if (!submissionLink.trim()) {
      alert('Cannot submit empty URL');
      return;
    }
    await submitSubmissionLink(submissionLink, problem.postId, problem.id);
    setSubmissionLink('');
  };

  return (
    <div>
      <h2 className="text-xl font-medium text-gray-900 dark:text-[var(--text-primary)]">
        Submit Solution
      </h2>
      <div className="mt-1 text-gray-900 dark:text-[var(--text-secondary)]">
        Share a link to your solution (PDF, image, or doc). Make sure the link
        is accessible to others.
      </div>
      <label htmlFor="submission-link" className="mt-4 block">
        Solution Link
      </label>
      <form onSubmit={handleSubmitLink}>
        <input
          id="submission-link"
          type="url"
          className="input"
          value={submissionLink}
          onChange={e => setSubmissionLink(e.target.value)}
        />
        <button type="submit" className="btn-legacy mt-4">
          Submit
        </button>
      </form>
    </div>
  );
}
