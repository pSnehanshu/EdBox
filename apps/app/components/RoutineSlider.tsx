import { useNavigation } from "@react-navigation/native";
import { format, isBefore, isWithinInterval } from "date-fns";
import { constant } from "lodash";
import { useMemo, useRef } from "react";
import {
  Dimensions,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Carousel } from "react-native-snap-carousel";
import {
  getUserRoleHierarchical,
  hasUserStaticRoles,
  StaticRole,
} from "schooltalk-shared/misc";
import type { DayOfWeek, TeacherRoutinePeriod } from "schooltalk-shared/types";
import { useCurrentUser } from "../utils/auth";
import { trpc } from "../utils/trpc";
import {
  GapPeriod,
  RoutinePeriod,
  TimelineData,
} from "../utils/types/routine-types";
import { Text, View } from "./Themed";

function getTimeFromHourMinute(hours: number, minutes: number) {
  const startTime = new Date();
  startTime.setHours(hours);
  startTime.setMinutes(minutes);
  startTime.setSeconds(0);
  startTime.setMilliseconds(0);

  return startTime;
}

interface SingleRoutineCardProps {
  period: (TeacherRoutinePeriod & { is_gap: false }) | GapPeriod;
  index: number;
}
function SinglePeriodCard({ period }: SingleRoutineCardProps) {
  const navigation = useNavigation();
  const { user } = useCurrentUser();
  const teacher = hasUserStaticRoles(user, [StaticRole.teacher], "some");
  const time = new Date();
  const start = getTimeFromHourMinute(period.start_hour, period.start_min);
  const end = getTimeFromHourMinute(period.end_hour, period.end_hour);

  return (
    <View style={styles.container_carousel}>
      {/* location and time for teacher */}
      {teacher && !period.is_gap && (
        <View style={styles.time_loc}>
          <Text style={styles.time_dislay}>{format(start, "hh:mm aa")}</Text>
          <Text style={styles.time_dislay}>
            {period.Class.name}-S {period.Section.name}
          </Text>
        </View>
      )}
      <Text style={styles.header}>
        {!period.is_gap ? period?.Subject?.name : "Gap"}
      </Text>

      {teacher && !period.is_gap && (
        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate("AttendanceTaker", { periodId: period.id })
          }
        >
          <Text style={styles.button_text}>
            {!(period.AttendancesTaken.length > 0)
              ? "Take Attendance"
              : "View attendance"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

interface RoutineSliderProps {
  style?: StyleProp<ViewStyle>;
}
export function RoutineSlider(props: RoutineSliderProps) {
  // const dayOfWeek = format(new Date(), "iii").toLowerCase() as DayOfWeek;
  const dayOfWeek = "tue";
  const { user } = useCurrentUser();

  const SLIDER_WIDTH = Dimensions.get("window").width;
  const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.8);

  const routineQuery =
    getUserRoleHierarchical(user) === StaticRole.student
      ? trpc.school.routine.fetchForStudent.useQuery({
          daysOfWeek: [dayOfWeek],
        })
      : trpc.school.routine.fetchForTeacher.useQuery({
          daysOfWeek: [dayOfWeek],
        });

  const { allPeriods, currentPeriodIndex } = useMemo(() => {
    const allPeriods = routineQuery.data?.[dayOfWeek] ?? [];
    type CustomPeriodType = (RoutinePeriod & { is_gap: false }) | GapPeriod;
    type RoutineTimelineData = TimelineData<CustomPeriodType>;

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

    const withGaps: CustomPeriodType[] = [];
    allPeriods.forEach((p, i) => {
      if (i === 0) {
        withGaps.push({
          ...p,
          is_gap: false,
        });
      } else {
        const previous = allPeriods[i - 1];
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

    // Determine the current period
    const time = new Date();
    const currentPeriodIndex = withGaps.findIndex((period) => {
      const start = getTimeFromHourMinute(period.start_hour, period.start_min);
      const end = getTimeFromHourMinute(period.end_hour, period.end_min);

      return isWithinInterval(time, { start, end });
    });

    const firstPeriod = getTimeFromHourMinute(
      withGaps[0]?.start_hour,
      withGaps[0]?.start_min,
    );

    return {
      allPeriods: withGaps,

      currentPeriodIndex:
        currentPeriodIndex < 0
          ? isBefore(time, firstPeriod)
            ? 0
            : withGaps?.length - 1
          : currentPeriodIndex,
    };
  }, [routineQuery.isFetching]);
  console.log(allPeriods, currentPeriodIndex, "allperiods");

  if (routineQuery.isLoading) return <></>;

  return (
    <View style={[props.style]}>
      <Carousel
        layout="default"
        vertical={false}
        layoutCardOffset={9}
        firstItem={currentPeriodIndex}
        data={allPeriods}
        renderItem={({ item, index }) => (
          <SinglePeriodCard period={item} index={index} />
        )}
        sliderWidth={SLIDER_WIDTH}
        itemWidth={ITEM_WIDTH}
        inactiveSlideShift={0}
        useScrollView={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container_carousel: {
    alignItems: "center",
    backgroundColor: "#4E48B2",
    borderRadius: 8,
    padding: 40,
    marginTop: 10,
    height: 190,
  },
  header: {
    color: "#f4f4f4",
    fontSize: 36,
    fontWeight: "bold",
  },
  button: {
    marginTop: 15,
    padding: 7,
    width: "100%",
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "black",
  },
  button_text: {
    fontSize: 18,
    color: "black",
    textAlign: "center",
  },
  time_loc: {
    // flex: 1,
    backgroundColor: "#4E48B2",
    marginTop: -3,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time_dislay: {
    fontSize: 12,
    color: "white",
  },
});
