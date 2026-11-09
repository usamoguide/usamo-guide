import * as React from 'react';
import {
  useCurrentUser,
  useIsUserDataLoaded,
  useUpdateUserData,
} from '../../context/UserDataContext/UserDataContext';
import { supabase } from '../../lib/supabaseClient';
import Btn from '../ug/Btn';
import { IcoChev } from '../ug/icons';

const DIFFICULTY_SCALE: [string, string][] = [
  [
    '0.5',
    'Easiest math competition problems, often solvable even for early middle school students without experience.',
  ],
  [
    '1',
    'Problems strictly for beginners, often at a moderate middle school level.',
  ],
  [
    '1.5',
    'Problems for stronger beginner students, on the level of the middling problems in most middle school contests.',
  ],
  [
    '2',
    'For motivated beginners, harder questions from the previous categories.',
  ],
  [
    '2.5',
    'More advanced beginner problems, hardest questions from previous categories.',
  ],
  ['3', 'Early intermediate problems that require more creative thinking.'],
  [
    '3.5',
    'Tougher early intermediate problems that consistently stretch into higher-level creative thinking or conceptual knowledge.',
  ],
  ['4', 'Intermediate-level problems.'],
  [
    '4.5',
    'Upper intermediate problems approaching the upper bound for non-invitational sprint math competitions.',
  ],
  [
    '5',
    'More difficult AIME problems or simple proof-based Olympiad-style problems.',
  ],
  [
    '6',
    'High-level AIME-styled questions or introductory Olympiad-level questions.',
  ],
  [
    '7',
    'Tougher Olympiad-level questions, may require more technical knowledge.',
  ],
  ['8', 'High-level Olympiad-level questions.'],
  ['9', 'Expert Olympiad-level questions.'],
  [
    '9.5',
    'The hardest problems appearing on Olympiads which the strongest students could reasonably solve.',
  ],
  [
    '10',
    'Historically notorious problems, generally unsuitable for even very hard competitions because they are exceedingly tedious, long, and difficult.',
  ],
];

const DIFFICULTY_OPTIONS = Array.from({ length: 20 }, (_, index) =>
  Number((index / 2 + 0.5).toFixed(1))
);

/** Counts a signed-in user's first tag suggestion / rating on this problem. */
function useRecordContribution(uniqueId: string) {
  const currentUser = useCurrentUser();
  const isUserDataLoaded = useIsUserDataLoaded();
  const updateUserData = useUpdateUserData();
  return React.useCallback(
    (kind: 'tag' | 'difficulty') => {
      if (!uniqueId || !isUserDataLoaded || !currentUser) return;

      updateUserData(prevUserData => {
        if (kind === 'tag') {
          const taggedProblemIds =
            prevUserData.problemTaggingStats.taggedProblemIds;
          if (taggedProblemIds.includes(uniqueId)) {
            return { localStorageUpdate: {}, remoteUpdate: {} };
          }
          const updates = {
            problemsTagged: prevUserData.problemTaggingStats.problemsTagged + 1,
            taggedProblemIds: [...taggedProblemIds, uniqueId],
          };
          return {
            localStorageUpdate: { problemTaggingStats: updates },
            remoteUpdate: { problemTaggingStats: updates },
          };
        }

        const ratedProblemIds =
          prevUserData.problemDifficultyStats.ratedProblemIds;
        if (ratedProblemIds.includes(uniqueId)) {
          return { localStorageUpdate: {}, remoteUpdate: {} };
        }
        const updates = {
          problemsRated: prevUserData.problemDifficultyStats.problemsRated + 1,
          ratedProblemIds: [...ratedProblemIds, uniqueId],
        };
        return {
          localStorageUpdate: { problemDifficultyStats: updates },
          remoteUpdate: { problemDifficultyStats: updates },
        };
      });
    },
    [currentUser, isUserDataLoaded, uniqueId, updateUserData]
  );
}

/** Tags the community has approved for this problem (shown with its own tags). */
export function useApprovedTags(
  uniqueId: string | undefined
): [string[], React.Dispatch<React.SetStateAction<string[]>>] {
  const [approvedTags, setApprovedTags] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (!uniqueId) return;
    let isActive = true;
    void (async () => {
      const { data, error } = await supabase
        .from('problem_tag_approvals')
        .select('tag')
        .eq('problem_id', uniqueId);
      if (!isActive) return;
      if (error) {
        console.error('Failed to load approved problem tags', error);
        return;
      }
      setApprovedTags((data ?? []).map(row => row.tag).filter(Boolean));
    })();
    return () => {
      isActive = false;
    };
  }, [uniqueId]);
  return [approvedTags, setApprovedTags];
}

function averageOf(
  rows: { rating: unknown }[] | null
): [number | null, number] {
  const ratings = (rows ?? [])
    .map(row => Number(row.rating))
    .filter(value => !Number.isNaN(value));
  if (ratings.length === 0) return [null, 0];
  const average =
    ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
  return [Number(average.toFixed(1)), ratings.length];
}

/**
 * Community difficulty: the average of everyone's 0.5-10 ratings, and a form to
 * add yours. The average is hidden when the reader hides difficulty.
 */
export function CommunityDifficulty({
  uniqueId,
  showAverage,
}: {
  uniqueId: string;
  showAverage: boolean;
}): JSX.Element {
  const [difficultyAverage, setDifficultyAverage] = React.useState<
    number | null
  >(null);
  const [difficultyVoteCount, setDifficultyVoteCount] = React.useState(0);
  const [difficultyValue, setDifficultyValue] = React.useState('5');
  const [difficultyMessage, setDifficultyMessage] = React.useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const recordContribution = useRecordContribution(uniqueId);

  React.useEffect(() => {
    let isActive = true;
    void (async () => {
      const { data, error } = await supabase
        .from('problem_difficulty_ratings')
        .select('rating')
        .eq('problem_id', uniqueId);
      if (!isActive) return;
      if (error) {
        console.error('Failed to load community difficulty ratings', error);
        return;
      }
      const [avg, n] = averageOf(data);
      setDifficultyAverage(avg);
      setDifficultyVoteCount(n);
    })();
    return () => {
      isActive = false;
    };
  }, [uniqueId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const rating = Number(difficultyValue);
    if (Number.isNaN(rating)) {
      setDifficultyMessage('Please choose a valid difficulty.');
      return;
    }
    setIsSubmitting(true);
    setDifficultyMessage(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('problem_difficulty_ratings')
        .upsert(
          { problem_id: uniqueId, user_id: user?.id ?? null, rating },
          { onConflict: 'problem_id,user_id' }
        );
      if (error) throw error;
      recordContribution('difficulty');

      const { data: ratingRows, error: readError } = await supabase
        .from('problem_difficulty_ratings')
        .select('rating')
        .eq('problem_id', uniqueId);
      if (readError) throw readError;
      const [avg, n] = averageOf(ratingRows);
      if (n > 0) {
        setDifficultyAverage(avg);
        setDifficultyVoteCount(n);
      }
      setDifficultyMessage('Thanks! Your difficulty rating has been recorded.');
    } catch (error) {
      console.error('Failed to save community difficulty rating', error);
      setDifficultyMessage(
        'We could not save your rating right now. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="prb-panel" aria-labelledby="prb-h-rate">
      <div className="prb-panel-top">
        <div className="prb-panel-t">
          <h2 id="prb-h-rate">Community difficulty</h2>
          <p>
            {difficultyVoteCount === 0
              ? 'No ratings yet. Be the first to rate this problem.'
              : showAverage
                ? `Rated by ${difficultyVoteCount} ${difficultyVoteCount === 1 ? 'person' : 'people'} on a scale from 0.5 to 10.`
                : 'Hidden by your display settings. You can still add your rating.'}
          </p>
        </div>
        {showAverage && difficultyAverage !== null ? (
          <p
            className="prb-score"
            aria-label={`${difficultyAverage.toFixed(1)} out of 10`}
          >
            <b>{difficultyAverage.toFixed(1)}</b>
            <span>/ 10</span>
          </p>
        ) : null}
      </div>
      <form className="prb-form" onSubmit={handleSubmit}>
        <label className="sel prb-sel">
          <span className="sel-k">Your rating</span>
          <select
            value={difficultyValue}
            onChange={event => setDifficultyValue(event.target.value)}
          >
            {DIFFICULTY_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option.toFixed(1)}
              </option>
            ))}
          </select>
          <IcoChev />
        </label>
        <Btn kind="s" size="sm" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Submit rating'}
        </Btn>
      </form>
      {difficultyMessage ? (
        <p className="prb-msg" role="status">
          {difficultyMessage}
        </p>
      ) : null}
      <details className="reveal prb-scale-d">
        <summary>
          <span className="a-show">How the scale works</span>
          <span className="a-hide">Hide the scale</span>
        </summary>
        <dl className="prb-scale">
          {DIFFICULTY_SCALE.map(([n, text]) => (
            <div key={n}>
              <dt>{n}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}

/** Shown when a problem has no tags yet: suggestions become tags once enough people agree. */
export function SuggestTags({
  uniqueId,
  onApproved,
}: {
  uniqueId: string;
  onApproved: (tags: string[]) => void;
}): JSX.Element {
  const [tagInput, setTagInput] = React.useState('');
  const [message, setMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const recordContribution = useRecordContribution(uniqueId);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const tagsToSuggest = tagInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(Boolean);
    if (tagsToSuggest.length === 0) {
      setMessage('Please enter at least one tag.');
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error: insertError } = await supabase
        .from('problem_tag_suggestions')
        .insert(
          tagsToSuggest.map(tag => ({
            problem_id: uniqueId,
            tag,
            user_id: user?.id ?? null,
          }))
        );
      if (insertError) throw insertError;
      recordContribution('tag');

      const { data: suggestionRows, error: readError } = await supabase
        .from('problem_tag_suggestions')
        .select('tag')
        .eq('problem_id', uniqueId);
      if (readError) throw readError;

      const counts = new Map<string, number>();
      for (const row of suggestionRows ?? []) {
        const tag = row.tag?.trim().toLowerCase();
        if (!tag) continue;
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }

      const newlyApproved: string[] = [];
      for (const [tag, count] of counts.entries()) {
        if (count <= 5) continue;
        const { error: approvalError } = await supabase
          .from('problem_tag_approvals')
          .upsert(
            { problem_id: uniqueId, tag },
            { onConflict: 'problem_id,tag' }
          );
        if (!approvalError) newlyApproved.push(tag);
      }

      const { data: approvalRows, error: approvalReadError } = await supabase
        .from('problem_tag_approvals')
        .select('tag')
        .eq('problem_id', uniqueId);
      if (approvalReadError) throw approvalReadError;

      onApproved((approvalRows ?? []).map(row => row.tag).filter(Boolean));
      setTagInput('');
      setMessage(
        newlyApproved.length > 0
          ? `Thanks! Your suggestions were recorded and ${newlyApproved.join(', ')} ${newlyApproved.length === 1 ? 'is' : 'are'} now approved.`
          : 'Thanks! Your suggestions were recorded.'
      );
    } catch (error) {
      console.error('Failed to save problem tag suggestions', error);
      setMessage(
        'We could not save your tag suggestions right now. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="prb-panel" aria-labelledby="prb-h-tags">
      <div className="prb-panel-t">
        <h2 id="prb-h-tags">Suggest tags for this problem</h2>
        <p>
          This problem doesn't have any tags yet. Add a few useful ones, and
          once enough people agree they'll show up here.
        </p>
      </div>
      <form className="prb-form" onSubmit={handleSubmit}>
        <label className="prb-lbl prb-grow">
          <span className="sel-k">Suggested tags</span>
          <input
            type="text"
            value={tagInput}
            onChange={event => setTagInput(event.target.value)}
            placeholder="algebra, combinatorics"
            className="prb-in prb-in-wide"
          />
        </label>
        <Btn kind="s" size="sm" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Submit tags'}
        </Btn>
      </form>
      {message ? (
        <p className="prb-msg" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
