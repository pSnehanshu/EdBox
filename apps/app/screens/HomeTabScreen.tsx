import { SafeAreaView, StyleSheet } from "react-native";
import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../utils/types/common";
import { useCurrentUser } from "../utils/auth";
import { useSchool } from "../utils/useSchool";

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

  if (!user) return null;
  const school = useSchool();

  return (
    <SafeAreaView style={styles.container}>
      <View>
        {/* header */}
        <View style={styles.header_container}>
          <Text style={styles.text_head}>Hello, {user.name.split(" ")[0]}</Text>
          <Text style={styles.text}>Wellcome to {school?.name ?? "Home"}</Text>
        </View>

        {/* <Text style={styles.title}>
        {greeting(new Date())}, {user.name}!
      </Text> */}
      </View>
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
