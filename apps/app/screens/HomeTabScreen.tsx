import { useRef } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { getUserRoleHierarchical, StaticRole } from "schooltalk-shared/misc";
import { Carousel } from "react-native-snap-carousel";
import { format } from "date-fns";
import type { DayOfWeek } from "@prisma/client";
import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../utils/types/common";
import { useCurrentUser } from "../utils/auth";
import { useSchool } from "../utils/useSchool";
import CarouselCardItem, {
  SLIDER_WIDTH,
  ITEM_WIDTH,
} from "../components/CarouselCardItem";
import { trpc } from "../utils/trpc";

/**
 * Get a greeting by the time of day.
 * Copied from https://github.com/elijahmanor/greeting-time/blob/master/index.js
 * @param date
 * @returns Greeting
 */
function greeting(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if ((hour >= 17 && hour <= 23) || hour < 5) {
    return "Good evening";
  }
  return "Hello";
}

export default function HomeTabScreen({}: RootTabScreenProps<"HomeTab">) {
  const { user } = useCurrentUser();

  // TODO: Uncomment this
  const dayOfWeek = "mon"; // format(new Date(), "iii").toLowerCase() as DayOfWeek;

  const routineQuery =
    getUserRoleHierarchical(user) === StaticRole.student
      ? trpc.school.routine.fetchForStudent.useQuery({
          daysOfWeek: [dayOfWeek],
        })
      : trpc.school.routine.fetchForTeacher.useQuery({
          daysOfWeek: [dayOfWeek],
        });

  const school = useSchool();
  // test
  const isCarousel = useRef(null);
  const data = [
    {
      title: "BIO-01",
      class_status: "",
      time: "",
    },
    {
      title: "MAT-06",
      class_status: "",
      time: "",
    },
    {
      title: "CHY-07",
      class_status: "",
      time: "",
    },
  ];

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* header */}
        <View style={styles.header_container}>
          <Text style={styles.text_head}>
            {greeting(new Date())}, {user.name.split(" ")[0]}
          </Text>
          <Text style={styles.text}>Welcome to {school?.name ?? "Home"}</Text>
        </View>

        <View>
          <Carousel
            layout="default"
            vertical={false}
            layoutCardOffset={9}
            firstItem={1}
            ref={isCarousel}
            data={data}
            renderItem={CarouselCardItem}
            sliderWidth={SLIDER_WIDTH}
            itemWidth={ITEM_WIDTH}
            inactiveSlideShift={0}
            useScrollView={true}
          />
        </View>

        <View>
          <Text>{JSON.stringify(routineQuery.data, null, 2)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: "center",
    // justifyContent: "center",
    backgroundColor: "#F1F1F1",
    marginTop: 0,
  },
  header_container: {
    marginTop: 70,
    marginBottom: 10,
    backgroundColor: "white",
    paddingLeft: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  text_head: {
    fontSize: 30,
    fontWeight: "500",
  },
  text: { fontSize: 18 },
});
