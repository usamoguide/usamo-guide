import * as React from 'react';

const completedColor = '#6A3E85';
const inProgressColor = '#A96BC2';
const skippedColor = '#D5A6E7';
const notStartedColor = '#40365F';
const trackColor = 'rgba(244, 237, 234, 0.14)';
const mutedText = 'rgba(244, 237, 234, 0.72)';

const ProgressBar = ({ text, green, yellow, blue }) => {
  return (
    <div className="relative">
      <div className="flex h-4 overflow-hidden text-xs rounded-full" style={{ background: trackColor }}>
        <div
          style={{ width: `${green}%`, background: completedColor }}
          className="flex flex-col justify-center text-center whitespace-nowrap text-white"
        />
        <div
          style={{ width: `${yellow}%`, background: inProgressColor }}
          className="flex flex-col justify-center text-center whitespace-nowrap text-white"
        />
        <div
          style={{ width: `${blue}%`, background: skippedColor }}
          className="flex flex-col justify-center text-center whitespace-nowrap text-white"
        />
      </div>
      <div className="text-right">
        <span className="inline-block text-sm font-semibold" style={{ color: mutedText }}>
          {text}
        </span>
      </div>
    </div>
  );
};

const FancyNumber = ({
  number,
  text,
  textColor,
  bgColor,
  subTextColor = null as string | null,
}) => (
  <div className="text-center">
    <span
      className={`text-3xl font-bold ${textColor} ${bgColor} inline-flex h-16 w-16 items-center justify-center rounded-full`}
    >
      {number}
    </span>
    <span
      className={`mt-1 block text-sm font-medium uppercase ${
        subTextColor ? subTextColor : textColor
      }`}
    >
      {text}
    </span>
  </div>
);

type ProgressCounts = {
  completed: number;
  inProgress: number;
  skipped: number;
  notStarted: number;
  total: number;
};

export default function DashboardProgress({
  completed,
  inProgress,
  skipped,
  notStarted,
  total,
}: ProgressCounts): JSX.Element {
  return (
    <div>
      <div className="mb-4 grid grid-cols-4 gap-2">
        <FancyNumber
          number={completed}
          text="Completed"
          textColor="text-[#F4EDEA]"
          bgColor="bg-[#6A3E85]"
        />
        <FancyNumber
          number={inProgress}
          text="In Progress"
          textColor="text-[#F4EDEA]"
          bgColor="bg-[#A96BC2]"
        />
        <FancyNumber
          number={skipped}
          text="Skipped"
          textColor="text-[#F4EDEA]"
          bgColor="bg-[#D5A6E7]"
        />
        <FancyNumber
          number={notStarted}
          text="Not Started"
          textColor="text-[#F4EDEA]"
          bgColor="bg-[#40365F]"
          subTextColor="text-[#D2D4C8]"
        />
      </div>
      <ProgressBar
        green={total === 0 ? 0 : (completed / total) * 100}
        yellow={total === 0 ? 0 : (inProgress / total) * 100}
        blue={total === 0 ? 0 : (skipped / total) * 100}
        text={`${total} total`}
      />
    </div>
  );
}

const ProgressBarSmall = ({
  className = undefined as string | undefined,
  text,
  green,
  yellow,
  blue,
}) => {
  return (
    <div className={className}>
      <div className="inline-block">
        <div className="flex h-2 w-24 items-center overflow-hidden rounded-full text-xs" style={{ background: trackColor }}>
          <div
            style={{ width: `${green}%`, background: completedColor }}
            className="h-2"
          />
          <div
            style={{ width: `${yellow}%`, background: inProgressColor }}
            className="h-2"
          />
          <div
            style={{ width: `${blue}%`, background: skippedColor }}
            className="h-2"
          />
        </div>
      </div>
      {/*  text-gray-800 dark:text-dark-med-emphasis */}
      <div className="ml-1 inline-block">
        {text && <span className="text-sm font-semibold" style={{ color: mutedText }}>&nbsp;{text}</span>}
      </div>
    </div>
  );
};

export function DashboardProgressSmall({
  completed,
  inProgress,
  skipped,
  total,
}: ProgressCounts): JSX.Element {
  return (
    <ProgressBarSmall
      text={completed + '/' + total}
      green={total === 0 ? 0 : (completed / total) * 100}
      yellow={total === 0 ? 0 : (inProgress / total) * 100}
      blue={total === 0 ? 0 : (skipped / total) * 100}
    />
  );
}

