import { format, isBefore, isWithinInterval } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import type {
  TeacherRoutinePeriod,
  StudentRoutinePeriod,
} from "schooltalk-shared/types";
import type { GapPeriod } from "./types/routine-types";

type Period = TeacherRoutinePeriod | StudentRoutinePeriod;
export type PeriodWithGap =
  | (Period & { is_gap: false; time: string })
  | GapPeriod;

/**
 * Returns date object representing today with given hour and minute
 * @param hours
 * @param minutes
 * @returns
 */
function _getTimeFromHourMinute(hours: number, minutes: number) {
  const startTime = new Date();
  startTime.setHours(hours);
  startTime.setMinutes(minutes);
  startTime.setSeconds(0);
  startTime.setMilliseconds(0);

  return startTime;
}
const getTimeFromHourMinute = _.memoize(
  _getTimeFromHourMinute,
  (h, m) => `${h}:${m}`,
);

export function useRoutineWithGaps(periods: Period[]) {
  const [recalculateState, setRecalculateState] = useState(0);

  // Calculate everyting inside `useMemo`
  const { allPeriods, currentPeriodIndex } = useMemo(() => {
    const allPeriods = periods.slice();

    // Sort be time
    allPeriods.sort((p1, p2) => {
      const p1start = getTimeFromHourMinute(p1.start_hour, p1.start_min);
      const p2start = getTimeFromHourMinute(p2.start_hour, p2.start_min);

      if (isBefore(p1start, p2start)) {
        return -1;
      } else if (isBefore(p2start, p1start)) {
        return 1;
      }
      return 0;
    });

    const periodsWithGaps: PeriodWithGap[] = [];
    allPeriods.forEach((p, i) => {
      // Calculate formatted time
      const time = format(
        getTimeFromHourMinute(p.start_hour, p.start_min),
        "hh:mm aaa",
      );

      // Can't be gap at the beginning
      if (i === 0) {
        periodsWithGaps.push({
          ...p,
          is_gap: false,
          time,
        });
      } else {
        const previous = allPeriods[i - 1];

        // Check if there's any gap between the last period and this period
        const hasGap =
          previous.end_hour !== p.start_hour
            ? true
            : previous.end_min !== p.start_min;

        if (hasGap) {
          // There's a gap, push it
          const gap: GapPeriod = {
            is_gap: true,
            start_hour: previous.end_hour,
            start_min: previous.end_min,
            end_hour: p.start_hour,
            end_min: p.start_min,
            time,
          };

          periodsWithGaps.push(gap);
        }

        // Now push the period
        periodsWithGaps.push({
          ...p,
          is_gap: false,
          time,
        });
      }
    });

    // Determine the current period
    const time = new Date();
    const currentPeriodIndex = periodsWithGaps.findIndex((period) => {
      const start = getTimeFromHourMinute(period.start_hour, period.start_min);
      const end = getTimeFromHourMinute(period.end_hour, period.end_min);

      return isWithinInterval(time, { start, end });
    });

    const firstPeriodTime = getTimeFromHourMinute(
      periodsWithGaps[0]?.start_hour,
      periodsWithGaps[0]?.start_min,
    );

    return {
      allPeriods: periodsWithGaps,
      currentPeriodIndex:
        currentPeriodIndex < 0
          ? isBefore(time, firstPeriodTime)
            ? 0
            : periodsWithGaps?.length - 1
          : currentPeriodIndex,
    };
  }, [periods, recalculateState]);

  // Write an effect to re-calculate in interval
  useEffect(() => {
    const interval = setInterval(() => {
      setRecalculateState(Math.random());
    }, 5 * 60 * 1000 /* 5 min */);

    return () => clearInterval(interval);
  }, []);

  return {
    allPeriods,
    currentPeriodIndex,
  };
}
