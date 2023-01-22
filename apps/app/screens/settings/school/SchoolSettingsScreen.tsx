import { MaterialCommunityIcons, Entypo, Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo } from "react";
import {
  ListRenderItem,
  Pressable,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { getUserRole } from "schooltalk-shared/misc";
import { List, Text, View } from "../../../components/Themed";
import { SettingsOption } from "../../../types";
import { useCurrentUser } from "../../../utils/auth";
import useColorScheme from "../../../utils/useColorScheme";

export default function SchoolSettingsScreen() {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "white" : "black";
  const { user } = useCurrentUser();
  const role = user ? getUserRole(user) : "none";

  const settingsOptions = useMemo<SettingsOption[]>(() => {
    const items: SettingsOption[] = [];

    items.push(
      {
        title: "Classes & Sections",
        subtitle: "Manage classes and sections in your school",
        icon: <Entypo name="blackboard" size={30} color={iconColor} />,
        onPress() {
          //
        },
      },
      {
        title: "Subjects",
        subtitle: "Add, edit, remove subjects",
        icon: <Entypo name="open-book" size={30} color={iconColor} />,
        onPress() {
          //
        },
      },
      {
        title: "Routine (Timetable)",
        subtitle: "Manage routine, assign subjects and teachers",
        icon: (
          <MaterialCommunityIcons
            name="timetable"
            size={30}
            color={iconColor}
          />
        ),
        onPress() {
          //
        },
      },
      {
        title: "People",
        subtitle: "Manage teachers, students, staff, and parents",
        icon: <Ionicons name="people-outline" size={30} color={iconColor} />,
        onPress() {
          //
        },
      }
    );

    return items;
  }, [iconColor, role, colorScheme]);

  const renderItem = useCallback<ListRenderItem<SettingsOption>>(({ item }) => {
    return (
      <Pressable
        onPress={() => item.onPress?.()}
        style={({ pressed }) => ({
          ...styles.item,
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <View style={styles.icon}>{item.icon}</View>
        <View style={styles.titleArea}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubTitle}>{item.subtitle}</Text>
        </View>
      </Pressable>
    );
  }, []);

  return (
    <SafeAreaView>
      <List data={settingsOptions} renderItem={renderItem} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 16,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    flex: 1,
    flexDirection: "row",
  },
  icon: {
    width: 48,
    marginLeft: 8,
  },
  titleArea: {
    backgroundColor: undefined,
    flexGrow: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemSubTitle: {
    fontSize: 12,
    color: "gray",
  },
});
