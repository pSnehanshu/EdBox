import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { StaticRole } from "schooltalk-shared/misc";
import { Dialog } from "@rneui/themed";
import { Entypo } from "@expo/vector-icons";
import { Text, View, ScrollView } from "../components/Themed";
import { useCurrentUser } from "../utils/auth";
import { useSchool } from "../utils/useSchool";
import { RoutineSlider } from "../components/RoutineSlider";
import Announcements from "../components/Announcements";
import useColorScheme from "../utils/useColorScheme";
import { useConfig } from "../utils/config";
import { StaticRoleSelector } from "../components/StaticRoleSelector";

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

export default function HomeTabScreen() {
  const { user } = useCurrentUser();
  const school = useSchool();
  const scheme = useColorScheme();
  const color = scheme === "dark" ? "black" : "white";
  const config = useConfig();

  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView stickyHeaderIndices={[0]}>
        {/* header */}
        <View>
          <View style={[styles.header_container, { backgroundColor: color }]}>
            <View style={styles.greeting}>
              <Text style={styles.text_head}>
                {greeting(new Date())}, {user?.name.split(" ")[0]}
              </Text>
              <Text style={styles.text}>
                Welcome to {school?.name ?? "your school"}
              </Text>
            </View>

            <Pressable
              onPress={() => setIsVisible(true)}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Entypo
                name="user"
                size={32}
                color="white"
                style={styles.user_avatar}
              />
            </Pressable>
          </View>
        </View>

        {/* Routine carousel */}
        {[StaticRole.student, StaticRole.teacher].includes(
          config.activeStaticRole,
        ) && <RoutineSlider style={styles.carousel} />}

        <Announcements />
      </ScrollView>

      <Dialog isVisible={isVisible} onBackdropPress={() => setIsVisible(false)}>
        <Dialog.Title title="Choose your role" />
        <StaticRoleSelector onChange={() => setIsVisible(false)} />
      </Dialog>
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
    padding: 16,
    flex: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  greeting: {
    flexGrow: 1,
  },
  user_avatar: {
    backgroundColor: "blue",
    margin: 2,
    borderRadius: 24,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  text_head: {
    fontSize: 24,
    fontWeight: "500",
  },
  text: {
    fontSize: 18,
  },
  carousel: {
    paddingTop: 5,
  },
});
