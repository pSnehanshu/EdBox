import { useNavigation } from "@react-navigation/native";
import {
  ListRenderItem,
  Pressable,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { List, Text, View } from "../../components/Themed";
import { ColorSchemeContext } from "../../utils/useColorScheme";
import { useCallback, useContext, useMemo } from "react";
import { useCurrentUser, useLogout } from "../../utils/auth";
import { hasUserStaticRoles, StaticRole } from "schooltalk-shared/misc";
import { SettingsOption } from "../../utils/types/common";

export function SettingsScreen() {
  const { scheme: colorScheme, change } = useContext(ColorSchemeContext);
  const iconColor = colorScheme === "dark" ? "white" : "black";
  const navigation = useNavigation();
  const { user } = useCurrentUser();
  const isPrincipal = hasUserStaticRoles(
    user,
    [StaticRole.principal, StaticRole.vice_principal],
    "some",
  );
  const logout = useLogout();

  const settingsOptions = useMemo<SettingsOption[]>(() => {
    const items: SettingsOption[] = [];

    items.push({
      title: "My account",
      subtitle: "Manage your details, password, phone number etc.",
      icon: (
        <MaterialCommunityIcons
          name="account-settings"
          size={30}
          color={iconColor}
        />
      ),
      onPress() {
        alert("Account Settings");
      },
    });

    if (isPrincipal) {
      items.push({
        title: "School settings",
        subtitle: "Manage classes, subjects, routine etc.",
        icon: <FontAwesome5 name="school" size={25} color={iconColor} />,
        onPress() {
          navigation.navigate("SchoolSettings");
        },
      });
    }

    items.push(
      {
        title: `Switch to ${colorScheme === "dark" ? "light" : "dark"} mode`,
        subtitle: `You are in ${colorScheme} mode`,
        icon: (
          <MaterialCommunityIcons
            name={
              colorScheme === "light" ? "moon-waning-crescent" : "weather-sunny"
            }
            size={30}
            color={iconColor}
          />
        ),
        onPress() {
          change(colorScheme === "light" ? "dark" : "light");
        },
      },
      {
        title: "Logout",
        subtitle: "Logout of your account",
        icon: (
          <MaterialCommunityIcons name="power" size={30} color={iconColor} />
        ),
        onPress: logout,
      },
      {
        title: "About this app",
        subtitle: "Company info, version, support contact etc.",
        icon: (
          <MaterialCommunityIcons
            name="application-brackets-outline"
            size={30}
            color={iconColor}
          />
        ),
      },
    );

    return items;
  }, [iconColor, isPrincipal, colorScheme]);

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
