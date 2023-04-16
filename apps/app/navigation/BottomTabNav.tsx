import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useContext } from "react";
import { hasUserStaticRoles, StaticRole } from "schooltalk-shared/misc";
import { useCurrentUser } from "../utils/auth";
import { RootTabParamList } from "../utils/types/common";
import { ColorSchemeContext } from "../utils/useColorScheme";
import { useSchool } from "../utils/useSchool";
import Colors from "../constants/Colors";
import ChatsListScreen from "../screens/chat/ChatsTabScreen";
import HomeTabScreen from "../screens/HomeTabScreen";
import RoutineScreen from "../screens/routine/RoutineScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import MenuScreen from "../screens/MenuScreen";

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

export function BottomTabNavigator() {
  const { scheme } = useContext(ColorSchemeContext);
  const school = useSchool();
  const { user } = useCurrentUser();
  const isStudentOrTeacher = hasUserStaticRoles(
    user,
    [StaticRole.teacher, StaticRole.student],
    "some",
  );

  return (
    <BottomTab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: Colors[scheme].tint,
      }}
    >
      <BottomTab.Screen
        name="HomeTab"
        component={HomeTabScreen}
        options={{
          title: "Home",
          headerTitle: school?.name ?? "Home",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              size={30}
              style={{ marginBottom: -3 }}
              color={color}
            />
          ),
        }}
      />
      <BottomTab.Screen
        name="ChatsTab"
        component={ChatsListScreen}
        options={{
          title: "Chats",
          headerShown: true,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "ios-chatbox" : "chatbox-outline"}
              size={30}
              style={{ marginBottom: -3 }}
              color={color}
            />
          ),
        }}
      />

      <BottomTab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          title: "Menu",
          headerShown: true,
          tabBarButton: () => <MenuScreen />,
        }}
      />

      {isStudentOrTeacher ? (
        <>
          <BottomTab.Screen
            name="Routine"
            component={RoutineScreen}
            options={{
              title: "Routine",
              headerShown: true,
              tabBarIcon: ({ focused, color }) => (
                <Ionicons
                  name={focused ? "md-timer-sharp" : "md-timer-outline"}
                  size={30}
                  style={{ marginBottom: -3 }}
                  color={color}
                />
              ),
            }}
          />
        </>
      ) : null}

      <BottomTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          headerShown: true,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "settings-sharp" : "settings-outline"}
              size={30}
              style={{ marginBottom: -3 }}
              color={color}
            />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}
