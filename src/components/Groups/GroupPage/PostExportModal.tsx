import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import React, { useState } from 'react';
import { useCurrentUser } from '../../../context/UserDataContext/UserDataContext';
import { useUserGroups } from '../../../hooks/groups/useUserGroups';
import { supabase } from '../../../lib/supabaseClient';
import { GroupData } from '../../../models/groups/groups';
import { PostData } from '../../../models/groups/posts';
import { GroupProblemData } from '../../../models/groups/problem';

export default function PostExportModal(props: {
  showExportModal: boolean;
  onClose: () => void;
  post: PostData;
  group: GroupData;
}) {
  const currentUser = useCurrentUser();
  const groups = useUserGroups();
  const [problems, setProblems] = React.useState<GroupProblemData[]>([]);
  const [groupsUsedMap, setGroupsUsedMap] = useState(new Map());

  async function handleGroupExportChange(g: GroupData) {
    const { data, error } = await supabase
      .from('group_problems')
      .select('*')
      .eq('group_id', props.group.id)
      .eq('post_id', props.post.id!);
    if (!error) {
      setProblems((data ?? []) as GroupProblemData[]);
    }

    console.log(g.name);
    if (groupsUsedMap.has(g.id)) {
      setGroupsUsedMap(
        new Map(
          groupsUsedMap.set(g.id, new MapData(!groupsUsedMap.get(g.id).used, g))
        )
      );
      console.log(groupsUsedMap.get(g.id).used);
    } else {
      setGroupsUsedMap(new Map(groupsUsedMap.set(g.id, new MapData(true, g))));
      console.log(groupsUsedMap.get(g.id).used);
    }
    console.log(groupsUsedMap.size);
  }

  async function exportSelectedPosts() {
    console.log('cont');
    console.log(problems);
    const type = props.post.type;
    const defaultPost: Omit<PostData, 'timestamp'> = {
      name: props.post.name,
      isPublished: props.post.isPublished,
      isPinned: props.post.isPinned,
      body: props.post.body,
      isDeleted: props.post.isDeleted,
      type,
      pointsPerProblem: props.post.pointsPerProblem,
      problemOrdering: props.post.problemOrdering,
      ...(type === 'announcement'
        ? {}
        : {
            dueTimestamp: null,
          }),
    };

    console.log('gm ' + groupsUsedMap.size);
    console.log('Problem load ' + problems.length);
    for (const [key, value] of groupsUsedMap.entries()) {
      if (!value.used) continue;

      const { data: postData, error: postError } = await supabase
        .from('group_posts')
        .insert({
          group_id: key,
          name: defaultPost.name,
          is_published: defaultPost.isPublished,
          is_pinned: defaultPost.isPinned,
          body: defaultPost.body,
          is_deleted: defaultPost.isDeleted,
          type: defaultPost.type,
          points_per_problem: {},
          problem_ordering: [],
          due_at:
            defaultPost.type === 'assignment' ? defaultPost.dueTimestamp : null,
          timestamp: new Date().toISOString(),
        })
        .select('id')
        .single();
      if (postError) continue;

      await supabase.rpc('groups_append_post_ordering', {
        group_id: key,
        post_id: postData.id,
      });

      const newProblemOrdering: string[] = [];
      const pointsPerProblem: Record<string, number> = {};
      for (const problem of problems) {
        const { data: problemRow, error: problemError } = await supabase
          .from('group_problems')
          .insert({
            group_id: key,
            post_id: postData.id,
            name: problem.name,
            body: problem.body,
            source: problem.source,
            points: problem.points,
            difficulty: problem.difficulty,
            hints: problem.hints,
            solution: problem.solution,
            is_deleted: false,
            guide_problem_id: problem.guideProblemId,
            solution_release_mode: problem.solutionReleaseMode,
            solution_release_at: problem.solutionReleaseTimestamp ?? null,
          })
          .select('id')
          .single();
        if (problemError) continue;
        newProblemOrdering.push(problemRow.id);
        pointsPerProblem[problemRow.id] = problem.points;
      }

      await supabase
        .from('group_posts')
        .update({
          problem_ordering: newProblemOrdering,
          points_per_problem: pointsPerProblem,
        })
        .eq('id', postData.id);
    }
    props.onClose();
  }

  return (
    <Dialog
      open={props.showExportModal}
      onClose={props.onClose}
      className="relative z-30"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in dark:bg-gray-900/75"
      />
      <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center px-4 pt-4 pb-20 text-center sm:items-center sm:p-0">
          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <DialogPanel
            transition
            className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:align-middle data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    Export Post
                  </DialogTitle>
                  <div className="mt-2 text-gray-500">
                    Please select the groups you would like to export this
                    assignment to.
                    <div className="block">
                      {groups.isSuccess &&
                        (groups.data && groups.data.length > 0 ? (
                          groups.data.map(group =>
                            group &&
                            group.ownerIds.includes(currentUser!.uid) ? (
                              <div key={group.id}>
                                <label className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    onChange={() =>
                                      handleGroupExportChange(group)
                                    }
                                  />
                                  <span className="ml-2 text-gray-500">
                                    {group.name}
                                  </span>
                                </label>
                              </div>
                            ) : null
                          )
                        ) : (
                          <div>
                            <p>You aren't in an admin in any groups yet!</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white hover:bg-gray-400 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-hidden sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => exportSelectedPosts()}
              >
                Export
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => props.onClose()}
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export class MapData {
  constructor(b: boolean, g: GroupData) {
    this.used = b;
    this.group = g;
  }
  used: boolean;
  group: GroupData;
}
