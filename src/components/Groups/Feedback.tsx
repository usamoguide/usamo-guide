import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useCurrentUser } from '../../context/UserDataContext/UserDataContext';
import { supabase } from '../../lib/supabaseClient';

export default function Feedback({ videoId }): JSX.Element {
  const { uid } = useCurrentUser()!;
  const baseClasses =
    'rounded-full border h-8 w-8 text-xl transform transition focus:outline-hidden';
  const unselectedClasses = 'hover:scale-110 border-gray-200 dark:border-[var(--border)]';
  const selectedClasses = 'scale-110 border-cyan-600';

  const [selected, setSelected] = useState<
    'very_bad' | 'bad' | 'good' | 'great' | null
  >(null);
  const [comment, setComment] = useState('');
  const [showAdditionalFeedback, setShowAdditionalFeedback] = useState(false);

  useEffect(() => {
    if (!uid) return;
    supabase
      .from('video_feedback')
      .select('rating')
      .eq('video_id', videoId)
      .eq('user_id', uid)
      .maybeSingle()
      .then(({ data }) => {
        setSelected(data?.rating || null);
      });
  }, [uid, videoId]);

  // Code to log video feedback to console
  // const group = useActiveGroup();
  // const isUserAdmin = isUserAdminOfGroup(group.groupData, group.activeUserId);
  // useEffect(() => {
  //   if (!db || !videoId || !isUserAdmin) return;
  //   // actually, only some people can view video feedback, not just any admin
  //   // but this is good enough whatever
  //   getDocs(collection(db, 'videos', videoId, 'feedback'))
  //     .then(snap => {
  //       console.log(snap.docs.map(doc => doc.data()));
  //     })
  //     .catch(e => {});
  // }, [videoId, db, isUserAdmin]);

  return (
    <>
      <div className="text-center">
        <span className="justify-left flex items-center space-x-2">
          <div className="font-medium">How was the video?</div>
          {[
            ['😨', 'very_bad', 'very bad'],
            ['🤨', 'bad'],
            ['😀', 'good'],
            ['😍', 'great'],
          ].map(
            ([emoji, key, name]: [
              string,
              'very_bad' | 'bad' | 'good' | 'great',
              string,
            ]) => (
              <button
                key={key}
                type="button"
                title={`Rate video as ${name || key}`}
                className={classNames(
                  baseClasses,
                  selected === key ? selectedClasses : unselectedClasses
                )}
                onClick={() => {
                  if (selected === key) {
                    setSelected(null);
                    supabase
                      .from('video_feedback')
                      .upsert(
                        {
                          video_id: videoId,
                          user_id: uid,
                          rating: null,
                        },
                        { onConflict: 'video_id,user_id' }
                      )
                      .catch(() => null);
                  } else {
                    setSelected(key);
                    if (key == 'very_bad' || key == 'bad') {
                      setShowAdditionalFeedback(true);
                    }
                    toast.promise(
                      supabase.from('video_feedback').upsert(
                        {
                          video_id: videoId,
                          user_id: uid,
                          rating: key,
                        },
                        { onConflict: 'video_id,user_id' }
                      ),
                      {
                        loading: 'Submitting...',
                        success: 'Thanks for the feedback!',
                        error: err => {
                          console.log(err);
                          return 'Error submitting feedback.';
                        },
                      }
                    );
                  }
                }}
              >
                {emoji}
              </button>
            )
          )}
          {!showAdditionalFeedback && (
            <button
              title={'Write us a private comment'}
              type="button"
              className={classNames(
                'ml-4 h-8 transform rounded-full border px-2 text-sm transition hover:border-cyan-600 focus:outline-hidden'
              )}
              onClick={() => setShowAdditionalFeedback(true)}
            >
              Comment
            </button>
          )}
        </span>
      </div>
      {showAdditionalFeedback && (
        <form
          onSubmit={e => {
            e.preventDefault();
            setShowAdditionalFeedback(false);
            const originalComment = comment;
            setComment('');
            toast.promise(
              supabase
                .from('video_feedback')
                .select('comments')
                .eq('video_id', videoId)
                .eq('user_id', uid)
                .maybeSingle()
                .then(({ data }) => {
                  const nextComments = [
                    ...(data?.comments ?? []),
                    originalComment,
                  ];
                  return supabase.from('video_feedback').upsert(
                    {
                      video_id: videoId,
                      user_id: uid,
                      comments: nextComments,
                    },
                    { onConflict: 'video_id,user_id' }
                  );
                }),
              {
                loading: 'Submitting...',
                success: 'Thanks for your comment!',
                error: err => {
                  console.log(err);
                  return 'Error submitting comment.';
                },
              }
            );
          }}
        >
          <textarea
            required
            style={{
              height: '4rem',
              minHeight: '4rem',
            }}
            className="mt-4 mr-2 w-full rounded-md border-gray-300 px-2 py-2 text-sm placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500 dark:border-[var(--border)]"
            placeholder="Tell us how you felt about the video..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <div className="block">
            <button
              type="submit"
              className="mt-2 items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-hidden sm:mt-0 dark:bg-[var(--bg-surface)] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--bg-surface-alt)] dark:border-[var(--border)]"
            >
              Submit Private Comment
            </button>
            <button
              type="button"
              onClick={() => setShowAdditionalFeedback(false)}
              className="mt-2 ml-2 items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-hidden sm:mt-0 dark:bg-[var(--bg-surface)] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--bg-surface-alt)] dark:border-[var(--border)]"
            >
              Close
            </button>
          </div>
        </form>
      )}
    </>
  );
}
