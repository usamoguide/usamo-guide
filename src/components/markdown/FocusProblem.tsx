import { Link } from 'gatsby';
import * as React from 'react';
import { useMarkdownProblemLists } from '../../context/MarkdownProblemListsContext';
import { getProblemURL, ProblemInfo } from '../../models/problem';
import ProblemsListItemDropdown from './ProblemsList/ProblemsListItemDropdown';
import ProblemStatusCheckbox from './ProblemsList/ProblemStatusCheckbox';

export default function FocusProblem({
  problem: problemID,
}: {
  problem: string;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  const problemLists = useMarkdownProblemLists()!;
  const problemList = problemLists.find(x => x.listId === problemID);

  if (!problemList) {
    throw new Error("Couldn't find focus problem " + problemID);
  }
  if (problemList.problems.length !== 1) {
    throw new Error(
      `The focus problem list ${problemID} should have exactly one problem.`
    );
  }

  const problem: ProblemInfo = problemList.problems[0];

  // transform must go in the isHovered condition
  // See https://github.com/usamoguide/usamo-guide/issues/198
  // transform creates a new stacking context :(
  return (
    <div
      className={`mb-4 block transition dark:bg-gray-900 ${
        isHovered ? '-translate-y-1 transform' : ''
      }`}
      id={'problem-' + problem.uniqueId}
    >
      <div className="border-t-4 border-blue-600">
        <div className="flex items-center px-4 sm:px-6">
          <div className="mr-4 flex-1">
            <div className="flex items-center">
              <Link
                to={getProblemURL(problem)}
                className="group block flex-1 py-4 transition"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="dark:text-dark-high-emphasis flex items-center text-lg font-medium text-black sm:text-xl">
                  {problem.name}
                </div>
                <div className="dark:text-dark-med-emphasis mt-1 text-sm text-gray-500">
                  {problem.source} - {problem.difficulty}
                </div>
              </Link>
            </div>
          </div>
          <div className="mt-1 ml-2 flex shrink-0 items-center justify-center sm:mr-2">
            <div className="mr-2">
              <ProblemsListItemDropdown
                onShowSolutionSketch={(problem: ProblemInfo) => {
                  return problem;
                }}
                problem={problem}
                showTags={true}
                showDifficulty={true}
                isFocusProblem={true}
                isDivisionTable={false}
              />
            </div>
            <ProblemStatusCheckbox problem={problem} size="large" />
          </div>
        </div>
        <div className="border-t border-gray-100 sm:flex sm:justify-between dark:border-gray-700">
          <p className="mb-0! px-4 py-3 text-xs font-normal text-gray-400 italic sm:px-6">
            Focus Problem – try your best to solve this problem before
            continuing!
          </p>
          {problem.solution?.kind === 'internal' && (
            <span className="mb-0! inline-flex px-4 py-3 text-xs font-normal! text-gray-400! italic sm:px-6">
              Internal solution (module content only)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
