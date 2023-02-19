import { useCallback, useState, memo, useMemo } from "react";
import { RefreshControl, StyleSheet, useWindowDimensions } from "react-native";
import _ from "lodash";
import { format } from "date-fns";
import { TabView, TabBar } from "react-native-tab-view";
import Spinner from "react-native-loading-spinner-overlay";
import Timeline from "react-native-timeline-flatlist";
import { Text } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { trpc } from "../../utils/trpc";
import useColorScheme from "../../utils/useColorScheme";
import {
  DayRoutineProps,
  GapPeriod,
  RenderSceneProp,
  RenderTabBarProp,
  RoutinePeriod,
  RoutineRoutes,
  TimelineData,
  TimelineOnPressProp,
} from "./routine-types";
import { NoClassesToday } from "../../components/RoutineNoClasses";
import { getUserRoleHierarchical, StaticRole } from "schooltalk-shared/misc";
import { useCurrentUser } from "../../utils/auth";

const DayRoutine = memo(
  ({ periods, isFetching, onRefresh }: DayRoutineProps<RoutinePeriod>) => {
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
    const navigation = useNavigation();

    const onEventPress = useCallback<TimelineOnPressProp>((e) => {
      const { data } = e as any as RoutineTimelineData;
      if (!data.is_gap) {
        navigation.navigate("AttendanceTaker", { periodId: data.id });
      }
    }, []);

    const colorScheme = useColorScheme();
    const textColor = colorScheme === "dark" ? "white" : "black";

    if (data.length < 1) return <NoClassesToday />;

    return (
      <Timeline
        data={data}
        separator
        style={styles.timeline}
        onEventPress={onEventPress}
        titleStyle={{
          color: textColor,
        }}
        descriptionStyle={{
          color: textColor,
        }}
        timeStyle={{
          color: textColor,
        }}
        options={
          {
            refreshControl: (
              <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />
            ),
          } as any
        }
      />
    );
  }
);

export default function RoutineScreen() {
  const { user } = useCurrentUser();
  const hierarchicalRole = getUserRoleHierarchical(user);

  const routineQuery =
    hierarchicalRole === StaticRole.student
      ? trpc.school.routine.fetchForStudent.useQuery({})
      : trpc.school.routine.fetchForTeacher.useQuery({});

  const layout = useWindowDimensions();
  const color = useColorScheme();
  const [index, setIndex] = useState(
    // Calculating the index of day-of-week. 0-Mon,1-Tue,so on...
    () => parseInt(format(new Date(), "i"), 10) - 1
  );
  const refreshList = useCallback(() => {
    routineQuery.refetch();
  }, []);
  const renderScene = useCallback<RenderSceneProp>(
    ({ route }) => (
      <DayRoutine
        day={route.key}
        periods={
          routineQuery.isFetched ? routineQuery.data?.[route.key] ?? [] : []
        }
        isFetching={routineQuery.isRefetching}
        onRefresh={refreshList}
      />
    ),
    [routineQuery.fetchStatus]
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
      navigationState={{ index, routes: RoutineRoutes }}
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
