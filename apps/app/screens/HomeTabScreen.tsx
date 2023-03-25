import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { StaticRole, hasUserStaticRoles } from "schooltalk-shared/misc";
import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../utils/types/common";
import { useCurrentUser } from "../utils/auth";
import { useSchool } from "../utils/useSchool";
import { RoutineSlider } from "../components/RoutineSlider";

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

        {/* Routine carousel */}
        {hasUserStaticRoles(
          user,
          [StaticRole.student, StaticRole.teacher],
          "some",
        ) && <RoutineSlider style={styles.carousel} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F1F1F1",
    marginTop: 0,
  },
  header_container: {
    paddingTop: 70,
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
  carousel: {
    paddingTop: 5,
  },
});
