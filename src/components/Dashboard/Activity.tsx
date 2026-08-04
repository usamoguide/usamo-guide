import * as React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import {
  useUserProgressOnModulesActivity,
  useUserProgressOnProblemsActivity,
} from '../../context/UserDataContext/properties/userProgress';
import { useActivity } from '../../hooks/useActivity';
import './heatmap-styles.css';

type ModuleActivity = ReturnType<typeof useUserProgressOnModulesActivity>[0];
type ProblemActivity = ReturnType<typeof useUserProgressOnProblemsActivity>[0];

export type ActivityHeatmapProps = {
  moduleActivities: { [key: number]: ModuleActivity[] };
  problemActivities: { [key: number]: ProblemActivity[] };
  activityCount: { [key: number]: number };
  endDate?: Date;
};

export function ActivityHeatmap({
  moduleActivities,
  problemActivities,
  activityCount,
  endDate,
}: ActivityHeatmapProps) {
  const [activeDate, setActiveDate] = React.useState<Date | null>(null);
  if (!endDate) endDate = new Date();
  const normalizedEndDate = new Date(endDate);
  normalizedEndDate.setHours(0, 0, 0, 0);
  const startDate = new Date(normalizedEndDate);
  startDate.setMonth(normalizedEndDate.getMonth() - 6);

  const heatmapValues = React.useMemo(() => {
    const values: { date: Date; count: number }[] = [];
    const cursor = new Date(startDate);

    while (cursor <= normalizedEndDate) {
      const key = cursor.getTime();
      values.push({ date: new Date(cursor), count: activityCount[key] ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return values;
  }, [activityCount, startDate, normalizedEndDate]);

  const activeDateKey = activeDate?.getTime();
  const activeDateCount = activeDateKey
    ? (activityCount[activeDateKey] ?? 0)
    : 0;
  const activeDateProblemsSolved =
    (activeDateKey && problemActivities[activeDateKey]?.length) ?? 0;
  const activeDateModulesCompleted =
    (activeDateKey && moduleActivities[activeDateKey]?.length) ?? 0;
  return (
    <div className="mt-4">
      <div
        className="px-4 py-5 transition sm:rounded-2xl sm:p-6"
        style={{
          background: 'rgba(43, 30, 57, 0.92)',
        }}
      >
        <div className="grid gap-y-4 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-0">
          <div className="col-span-2">
            <div className="overflow-x-auto px-1 pt-2 pb-3">
              <CalendarHeatmap
                startDate={startDate}
                endDate={normalizedEndDate}
                values={heatmapValues}
                gutterSize={4}
                onMouseOver={(_ev, value) => {
                  if (!value) setActiveDate(null);
                  else setActiveDate(value.date);
                }}
                transformDayElement={(element: React.ReactElement) => {
                  const size = 13;
                  return React.cloneElement(element, {
                    width: size,
                    height: size,
                    x: element.props.x,
                    y: element.props.y,
                    rx: 0,
                    ry: 0,
                  });
                }}
                classForValue={value => {
                  if (!value || value.count === 0) {
                    return 'color-empty';
                  }
                  return `color-scale-${Math.min(value.count, 4)}`;
                }}
                tooltipDataAttrs={value => {
                  if (!value || !value.date || value.count === 0) {
                    return { title: 'No activity' };
                  }

                  return {
                    title: `${value.count} activit${value.count === 1 ? 'y' : 'ies'}`,
                  };
                }}
              />
            </div>
          </div>
          <div className="col-span-1">
            {activeDate ? (
              <div style={{ color: '#D2D4C8' }}>
                <b>{activeDate.toString().substring(0, 16)}</b> <br />
                {activeDateCount === 0 ? (
                  <p>No activity</p>
                ) : (
                  <>
                    <p>{activeDateProblemsSolved} problem(s) solved</p>
                    <p>
                      {activeDateModulesCompleted} module(s) marked practicing /
                      completed
                    </p>
                  </>
                )}
              </div>
            ) : (
              <p
                className="mt-3 text-sm"
                style={{ color: 'rgba(244, 237, 234, 0.72)' }}
              >
                Hover over a square to view more details!
              </p>
            )}
          </div>
        </div>

        <p
          className="mt-3 text-sm"
          style={{ color: 'rgba(244, 237, 234, 0.72)' }}
        >
          Note that activity calculations are very much in development and will
          change in the near future.
        </p>
      </div>
    </div>
  );
}

export default function Activity() {
  const { moduleActivities, problemActivities, activityCount } = useActivity();
  return (
    <ActivityHeatmap
      moduleActivities={moduleActivities}
      problemActivities={problemActivities}
      activityCount={activityCount}
    />
  );
}
