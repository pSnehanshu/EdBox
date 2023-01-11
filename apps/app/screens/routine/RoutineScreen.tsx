import { ComponentProps, useCallback, useState, memo, useMemo } from "react";
import {
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import _ from "lodash";
import { format } from "date-fns";
import { TabView, TabBar } from "react-native-tab-view";
import Spinner from "react-native-loading-spinner-overlay";
import Timeline from "react-native-timeline-flatlist";
import { DayOfWeek, RoutinePeriod } from "schooltalk-shared/types";
import { trpc } from "../../utils/trpc";
import { Text } from "../../components/Themed";
import useColorScheme from "../../utils/useColorScheme";

type TabRoute = { key: DayOfWeek; title: string };
type RenderSceneProp = ComponentProps<typeof TabView<TabRoute>>["renderScene"];
type RenderTabBarProp = NonNullable<
  ComponentProps<typeof TabView<TabRoute>>["renderTabBar"]
>;
type TimelineOnPressProp = NonNullable<
  ComponentProps<typeof Timeline>["onEventPress"]
>;
interface DayRoutineProps {
  day: DayOfWeek;
  periods: RoutinePeriod[];
}
type GapPeriod = {
  is_gap: true;
  start_hour: number;
  start_min: number;
  end_hour: number;
  end_min: number;
};

/** Copied from https://github.com/Eugnis/react-native-timeline-flatlist/blob/9f08aaaf50fcd95398e1b47d0d39f063e7d2825f/lib/index.d.ts#L5-L17 */
type TimelineData<T = unknown> = {
  time?: string;
  title?: string;
  description?: any;
  lineWidth?: number;
  lineColor?: string;
  eventContainerStyle?: StyleProp<ViewStyle>;
  circleSize?: number;
  circleColor?: string;
  dotColor?: string;
  icon?: string | React.ReactNode;
  position?: "left" | "right";
  data: T;
};

const DayRoutine = memo(({ periods }: DayRoutineProps) => {
  type CustomPeriodType = (RoutinePeriod & { is_gap: false }) | GapPeriod;
  type RoutineTimelineData = TimelineData<CustomPeriodType>;

  const data = useMemo<RoutineTimelineData[]>(() => {
    // Sort
    const sorted = _.sortBy(periods.slice(), (p) =>
      parseFloat(`${p.start_hour}.${p.start_min}`)
    );
    // Insert gaps
    const withGaps: CustomPeriodType[] = [];
    sorted.forEach((p, i) => {
      // First insert the gap, then insert the period
      if (i === 0) {
        withGaps.push({
          ...p,
          is_gap: false,
        });
      } else {
        const previous = sorted[i - 1];
        const hasGap =
          previous.end_hour !== p.start_hour
            ? true
            : previous.end_min !== p.start_min;
        if (hasGap) {
          const gap: GapPeriod = {
            is_gap: true,
            start_hour: previous.end_hour,
            start_min: previous.end_min,
            end_hour: p.start_hour,
            end_min: p.start_min,
          };

          withGaps.push(gap);
        }

        withGaps.push({
          ...p,
          is_gap: false,
        });
      }
    });

    return withGaps.map((p) => {
      const isPM =
        p.start_hour > 12
          ? true
          : p.start_hour === 12
          ? p.start_min > 0
          : false;
      let startHour: number | string =
        p.start_hour > 12 ? p.start_hour - 12 : p.start_hour;
      startHour = startHour < 10 ? `0${startHour}` : `${startHour}`;
      const startMin: string =
        p.start_min < 10 ? `0${p.start_min}` : `${p.start_min}`;

      const time = `${startHour}:${startMin} ${isPM ? "pm" : "am"}`;

      // TODO: Show duration & End of day
      if (p.is_gap) {
        return {
          time,
          title: "Gap :)",
          description: "Enjoy your time off.",
          data: p,
        };
      } else {
        const isAttendanceTaken = p.AttendancesTaken.length > 0;

        return {
          time,
          title: `${p.Subject.name} - Class ${
            p.Class.name ?? p.Class.numeric_id
          } (${p.Section.name ?? p.Section.numeric_id})`,
          description: isAttendanceTaken
            ? "Attendance taken, tap to view"
            : "Tap to take attendance",
          data: p,
        };
      }
    });
  }, periods);

  const onEventPress = useCallback<TimelineOnPressProp>((e) => {
    const { data } = e as any as RoutineTimelineData;
    if (!data.is_gap) {
      const isAttendanceTaken = data.AttendancesTaken.length > 0;
      alert(isAttendanceTaken ? "View attendance" : "Take attendance please");
    }
  }, []);

  return (
    <Timeline
      data={data}
      separator
      style={styles.timeline}
      onEventPress={onEventPress}
    />
  );
});

const routes: TabRoute[] = [
  { key: "mon", title: "Monday" },
  { key: "tue", title: "Tuesday" },
  { key: "wed", title: "Wednesday" },
  { key: "thu", title: "Thursday" },
  { key: "fri", title: "Friday" },
  { key: "sat", title: "Saturday" },
  { key: "sun", title: "Sunday" },
];

export default function RoutineScreen() {
  const routineQuery = trpc.school.routine.fetchForTeacher.useQuery({});
  const layout = useWindowDimensions();
  const color = useColorScheme();
  const [index, setIndex] = useState(
    // Calculating the index of day-of-week. 0-Mon,1-Tue,so on...
    () => parseInt(format(new Date(), "i"), 10) - 1
  );
  const renderScene = useCallback<RenderSceneProp>(
    ({ route }) => (
      <DayRoutine
        day={route.key}
        periods={
          routineQuery.isFetched ? routineQuery.data?.[route.key] ?? [] : []
        }
      />
    ),
    [routineQuery.isFetched]
  );
  const renderTabBar = useCallback<RenderTabBarProp>(
    (props) => (
      <TabBar
        {...props}
        indicatorStyle={{
          backgroundColor: "#09c",
        }}
        style={{
          backgroundColor: color === "dark" ? "black" : "white",
          width: "auto",
        }}
        labelStyle={{
          color: color === "dark" ? "white" : "black",
        }}
        activeColor="#09c"
        scrollEnabled
      />
    ),
    [color]
  );

  if (routineQuery.isLoading) return <Spinner visible />;
  if (routineQuery.isError) return <Text>Error occured!</Text>;

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
      lazy
    />
  );
}

const styles = StyleSheet.create({
  timeline: {
    padding: 4,
    paddingTop: 16,
  },
});
