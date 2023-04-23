import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import {
  Dimensions,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Carousel } from "react-native-snap-carousel";
import { StaticRole } from "schooltalk-shared/misc";
import type { DayOfWeek } from "schooltalk-shared/types";
import { useConfig } from "../utils/config";
import { PeriodWithGap, useRoutineWithGaps } from "../utils/routine-utils";
import { trpc } from "../utils/trpc";
import { LottieAnimation } from "./LottieAnimation";
import { Text, View } from "./Themed";

interface SingleRoutineCardProps {
  period: PeriodWithGap;
  index: number;
}
function SinglePeriodCard({ period }: SingleRoutineCardProps) {
  const navigation = useNavigation();
  const config = useConfig();
  const isTeacher = config.activeStaticRole === StaticRole.teacher;

  return (
    <View style={styles.container_carousel}>
      {/* Class and time  */}
      {!period.is_gap && (
        <View style={styles.time_loc}>
          <Text style={styles.time_dislay}>{period.time}</Text>
          <Text style={styles.time_dislay}>
            {period.Class.name} ({period.Section.name})
          </Text>
        </View>
      )}

      <Text style={styles.header}>
        {period.is_gap ? "Gap" : period?.Subject?.name}
      </Text>

      {isTeacher && !period.is_gap && (
        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate("AttendanceTaker", { periodId: period.id })
          }
        >
          <Text style={styles.button_text}>
            {period.AttendancesTaken.length > 0
              ? "View attendance"
              : "Take Attendance"}
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
  const dayOfWeek = format(new Date(), "iii").toLowerCase() as DayOfWeek;
  const config = useConfig();

  const SLIDER_WIDTH = Dimensions.get("window").width;
  const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.8);

  const routineQuery =
    config.activeStaticRole === StaticRole.student
      ? trpc.school.routine.fetchForStudent.useQuery({
          daysOfWeek: [dayOfWeek],
        })
      : trpc.school.routine.fetchForTeacher.useQuery({
          daysOfWeek: [dayOfWeek],
        });

  const { allPeriods, currentPeriodIndex } = useRoutineWithGaps(
    routineQuery.data?.[dayOfWeek] ?? [],
  );

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

      {allPeriods.length < 1 && (
        <LottieAnimation
          src={require("../assets/lotties/no-classes.json")}
          caption="No classes today, relax!"
          height={150}
        />
      )}
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
