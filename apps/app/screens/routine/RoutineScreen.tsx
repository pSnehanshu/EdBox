import { useCallback, useState, memo } from "react";
import { RefreshControl, StyleSheet, useWindowDimensions } from "react-native";
import { format } from "date-fns";
import { TabView, TabBar } from "react-native-tab-view";
import Spinner from "react-native-loading-spinner-overlay";
import Timeline from "react-native-timeline-flatlist";
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
} from "../../utils/types/routine-types";
import { NoClassesToday } from "../../components/RoutineNoClasses";
import { StaticRole } from "schooltalk-shared/misc";
import { useRoutineWithGaps } from "../../utils/routine-utils";
import { Banner } from "../../components/Banner";
import { useConfig } from "../../utils/config";

const DayRoutine = memo(
  ({ periods, isFetching, onRefresh }: DayRoutineProps<RoutinePeriod>) => {
    type CustomPeriodType = (RoutinePeriod & { is_gap: false }) | GapPeriod;
    type RoutineTimelineData = TimelineData<CustomPeriodType>;

    const { allPeriods } = useRoutineWithGaps(periods);
    const data: RoutineTimelineData[] = allPeriods.map((p) => {
      if (p.is_gap) {
        return {
          time: p.time,
          title: "Gap :)",
          description: "Enjoy your time off.",
          data: p,
        };
      } else {
        const isAttendanceTaken = p.AttendancesTaken.length > 0;

        return {
          time: p.time,
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
  },
);

export default function RoutineScreen() {
  const config = useConfig();

  const routineQuery =
    config.activeStaticRole === StaticRole.student
      ? trpc.school.routine.fetchForStudent.useQuery({})
      : trpc.school.routine.fetchForTeacher.useQuery({});

  const layout = useWindowDimensions();
  const color = useColorScheme();
  const [index, setIndex] = useState(
    // Calculating the index of day-of-week. 0-Mon,1-Tue,so on...
    () => parseInt(format(new Date(), "i"), 10) - 1,
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
    [routineQuery.fetchStatus],
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
    [color],
  );

  if (routineQuery.isLoading) return <Spinner visible />;
  if (routineQuery.isError)
    return (
      <Banner text="Failed to fetch routine, please try again" type="error" />
    );

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
