import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ColorSchemeName, Pressable } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useContext } from "react";
import Colors from "../constants/Colors";
import { ColorSchemeContext } from "../utils/useColorScheme";
import { useSchool } from "../utils/useSchool";
import LoginScreen from "../screens/auth/Login";
import PreLoginScreen from "../screens/auth/PreLogin";
import HomeTabScreen from "../screens/HomeTabScreen";
import ChatsListScreen from "../screens/chat/ChatsTabScreen";
import { RootStackParamList, RootTabParamList } from "../types";
import { useCurrentUser } from "../utils/auth";
import LinkingConfiguration from "./LinkingConfiguration";
import { SocketProvider, useSocket } from "../utils/socketio";
import { MessagesProvider } from "../utils/messages-repository";
import ChatWindowScreen from "../screens/chat/ChatWindow";
import { navigationRef } from "./navRef";
import TeacherRoutineScreen from "../screens/routine/role-wise-routine/TeacherRoutineScreen";
import StudentRoutineScreen from "../screens/routine/role-wise-routine/StudentRoutineScreen";
import AttendanceTakerScreen from "../screens/attendance/AttendanceTakerScreen";
import { View } from "../components/Themed";
import { getUserRole } from "schooltalk-shared/misc";
import { trpc } from "../utils/trpc";
import Toast from "react-native-toast-message";
import { useDB } from "../utils/db";

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      ref={navigationRef}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const school = useSchool();
  const { isLoggedIn } = useCurrentUser();

  if (!school) return null;

  return isLoggedIn ? (
    <SocketProvider>
      <MessagesProvider>
        <Stack.Navigator>
          <Stack.Screen
            name="Root"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChatWindow"
            component={ChatWindowScreen}
            options={({ route }) => ({
              headerShown: true,
              title: `${route.params.name ?? "Messages"}`,
            })}
          />
          <Stack.Screen
            name="AttendanceTaker"
            component={AttendanceTakerScreen}
            options={{
              headerShown: true,
              title: "Take Attendance",
            }}
          />
        </Stack.Navigator>
      </MessagesProvider>
    </SocketProvider>
  ) : (
    <Stack.Navigator>
      <Stack.Screen
        name="PreLogin"
        component={PreLoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: `Login to ${school.name}` }}
      />
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const { scheme, change } = useContext(ColorSchemeContext);
  const socket = useSocket();
  const school = useSchool();
  const utils = trpc.useContext();
  const db = useDB();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess() {
      Toast.show({
        type: "success",
        text1: "You have been logged out",
        position: "top",
      });
      utils.auth.whoami.invalidate();

      // Clear all SQLite data
      db.transaction(
        (tx) => {
          tx.executeSql("DELETE FROM messages");
          tx.executeSql("DELETE FROM groups");
        },
        (error) => {
          console.error("Failed to delete all SQLite data", error);
        },
        () => {
          console.log("Deleted all SQLite data!");
        }
      );
    },
    onError(error, variables, context) {
      Toast.show({
        type: "error",
        text1: "Failed to logout",
        text2: "Please try again later",
        position: "top",
      });
    },
  });
  const { user } = useCurrentUser();
  const role = user ? getUserRole(user) : "none";

  const RoutineScreen =
    role === "teacher"
      ? TeacherRoutineScreen
      : role === "student"
      ? StudentRoutineScreen
      : () => <></>;

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
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="home"
              size={30}
              style={{ marginBottom: -3 }}
              color={color}
            />
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row" }}>
              {school?.website ? (
                <Pressable
                  onPress={() => WebBrowser.openBrowserAsync(school?.website!)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                  })}
                >
                  <MaterialCommunityIcons
                    name="web"
                    size={25}
                    color={Colors[scheme].text}
                    style={{ marginRight: 15 }}
                  />
                </Pressable>
              ) : null}

              <Pressable
                onPress={() => change(scheme === "light" ? "dark" : "light")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <MaterialCommunityIcons
                  name={
                    scheme === "light"
                      ? "moon-waning-crescent"
                      : "weather-sunny"
                  }
                  size={25}
                  color={Colors[scheme].text}
                  style={{ marginRight: 15 }}
                />
              </Pressable>

              <Pressable
                onPress={() => logoutMutation.mutate()}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <MaterialCommunityIcons
                  name="power"
                  size={25}
                  color={Colors[scheme].text}
                  style={{ marginRight: 15 }}
                />
              </Pressable>
            </View>
          ),
        }}
      />
      <BottomTab.Screen
        name="ChatsTab"
        component={ChatsListScreen}
        options={{
          title: `Chats ${socket.isConnected ? "" : "(connecting...)"}`,
          headerTitle: "Chats",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name={socket.isConnected ? "chat" : "chat-remove"}
              size={30}
              style={{ marginBottom: -3 }}
              color={color}
            />
          ),
        }}
      />
      {role === "student" || role === "teacher" ? (
        <BottomTab.Screen
          name="Routine"
          component={RoutineScreen}
          options={{
            title: "Routine",
            headerShown: true,
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="timetable"
                size={30}
                style={{ marginBottom: -3 }}
                color={color}
              />
            ),
          }}
        />
      ) : null}
    </BottomTab.Navigator>
  );
}
