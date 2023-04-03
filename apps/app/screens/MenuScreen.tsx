import {
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ReactNode, useCallback, useMemo, useRef } from "react";
import {
  Button,
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
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

  const refRBSheet = useRef<RBSheet>(null);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="dots-grid"
        size={34}
        onPress={() => refRBSheet?.current?.open()}
        color={"#999"}
      />
      <Text
        style={{
          ...styles.tab_icon_text,
          color: "#999",
        }}
      >
        Menu
      </Text>

      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={150}
        customStyles={{
          container: styles.bottom_sheet_container,
          wrapper: styles.bottom_sheet_wrapper,
          draggableIcon: styles.bottom_sheet_draggable_icon,
        }}
      >
        <View style={styles.list_container}>
          {MenuItems.map((item, i) => (
            <Pressable
              key={i}
              onPress={() => {
                refRBSheet.current?.close();
                item.onPress?.();
              }}
              style={({ pressed }) => [
                styles.item,
                { opacity: pressed ? 0.5 : 1 },
              ]}
            >
              <View style={styles.icon}>{item.icon}</View>
              <View style={styles.titleArea}>
                <Text style={styles.itemTitle}>{item.name}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </RBSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  list_container: {
    height: "100%",
  },
  tab_icon_text: { fontSize: 10, marginTop: 0 },
  item: {
    paddingVertical: 16,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
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
  bottom_sheet_container: {
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  bottom_sheet_wrapper: {
    backgroundColor: "transparent",
  },
  bottom_sheet_draggable_icon: {
    backgroundColor: "#000",
  },
});
