import { useNavigation } from "@react-navigation/native";
import { format, isBefore, isWithinInterval } from "date-fns";
import { useMemo, useRef } from "react";
import {
  Dimensions,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Carousel } from "react-native-snap-carousel";
import { getUserRoleHierarchical, StaticRole } from "schooltalk-shared/misc";
import type { DayOfWeek, TeacherRoutinePeriod } from "schooltalk-shared/types";
import { useCurrentUser } from "../utils/auth";
import { trpc } from "../utils/trpc";
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
  period: TeacherRoutinePeriod;
  index: number;
}
function SinglePeriodCard({ period }: SingleRoutineCardProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.container_carousel}>
      <Text style={styles.header}>{period.Subject.name}</Text>

      {/* TODO: This action is valid for teachers only */}
      <Pressable
        style={styles.button}
        onPress={() =>
          navigation.navigate("AttendanceTaker", { periodId: period.id })
        }
      >
        {/* TODO: Show "View attendance" when attendance is already taken */}
        <Text style={styles.button_text}>Take Attendance</Text>
      </Pressable>
    </View>
  );
}

interface RoutineSliderProps {
  style?: StyleProp<ViewStyle>;
}
export function RoutineSlider(props: RoutineSliderProps) {
  const dayOfWeek = format(new Date(), "iii").toLowerCase() as DayOfWeek;
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

    // TODO: Insert Gaps, refer to RoutineScreen.tsx

    // Determine the current period
    const time = new Date();
    const currentPeriodIndex = allPeriods.findIndex((period) => {
      const start = getTimeFromHourMinute(period.start_hour, period.start_min);
      const end = getTimeFromHourMinute(period.end_hour, period.end_min);

      return isWithinInterval(time, { start, end });
    });

    return {
      allPeriods,
      // TODO: Show first period if no periods have begun, show last period if all periods are over
      currentPeriodIndex: currentPeriodIndex < 0 ? 0 : currentPeriodIndex,
    };
  }, [routineQuery.isFetching]);

  // Don't show anything unless  loaded
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
});
