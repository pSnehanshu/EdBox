import { SafeAreaView, StyleSheet } from "react-native";
import { StaticRole, hasUserStaticRoles } from "schooltalk-shared/misc";
import { Text, View, ScrollView } from "../components/Themed";
import { RootTabScreenProps } from "../utils/types/common";
import { useCurrentUser } from "../utils/auth";
import { useSchool } from "../utils/useSchool";
import { RoutineSlider } from "../components/RoutineSlider";
import Announcements from "../components/Announcements";
import useColorScheme from "../utils/useColorScheme";

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
  const school = useSchool();
  const scheme = useColorScheme();

  if (!user) return null;

  return (
    <View style={styles.container}>
      <ScrollView stickyHeaderIndices={[0]}>
        {/* header */}
        <View
          style={[
            styles.header_container,
            { backgroundColor: scheme === "dark" ? "black" : "white" },
          ]}
        >
          <Text style={styles.text_head}>
            {greeting(new Date())}, {user.name.split(" ")[0]}
          </Text>
          <Text style={styles.text}>Welcome to {school?.name ?? "Home"}</Text>
        </View>

        {/* Routine carousel */}
        {hasUserStaticRoles(
          user,
          [StaticRole.student, StaticRole.teacher],
          "some",
        ) && <RoutineSlider style={styles.carousel} />}

        <Announcements />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    flex: 1,
  },
  header_container: {
    paddingTop: 55,
    paddingLeft: 30,
    paddingBottom: 10,
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
  carousel: {
    paddingTop: 5,
  },
});
