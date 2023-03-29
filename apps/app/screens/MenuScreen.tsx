import { Foundation, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ReactNode, useMemo } from "react";
import { Pressable, StyleProp, StyleSheet } from "react-native";
import { ScrollView, Text, View } from "../components/Themed";
import useColorScheme from "../utils/useColorScheme";

interface MenuItem {
  name: string;
  icon: ReactNode;
  onPress?: () => void;
}

export default function MenuScreen() {
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";
  const navigation = useNavigation();

  const MenuItems = useMemo<MenuItem[]>(() => {
    return [
      {
        name: "Homework",
        icon: (
          <Foundation name="clipboard-pencil" size={30} color={iconColor} />
        ),
        onPress() {
          alert("Homework!");
        },
      },
      {
        name: "Class tests & Exams",
        icon: (
          <Ionicons
            name="newspaper-outline"
            size={30}
            style={{ marginBottom: -3 }}
            color={iconColor}
          />
        ),
        onPress() {
          navigation.navigate("ExamsScreen");
        },
      },
    ];
  }, [iconColor]);

  return (
    <ScrollView style={styles.container}>
      {MenuItems.map((item, i) => (
        <Pressable
          key={i}
          onPress={item.onPress}
          style={({ pressed }) => [styles.item, { opacity: pressed ? 0.5 : 1 }]}
        >
          <View style={styles.icon}>{item.icon}</View>
          <View style={styles.titleArea}>
            <Text style={styles.itemTitle}>{item.name}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  item: {
    paddingVertical: 16,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    flex: 1,
    flexDirection: "row",
    paddingLeft: 8,
  },
  icon: {
    width: 48,
    marginLeft: 8,
  },
  titleArea: {
    backgroundColor: undefined,
    flexGrow: 1,
    paddingVertical: 4,
  },
  itemTitle: {
    fontSize: 16,
  },
});
