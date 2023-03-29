import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ColorSchemeName } from "react-native";
import { useSchool } from "../utils/useSchool";
import LoginScreen from "../screens/auth/Login";
import PreLoginScreen from "../screens/auth/PreLogin";
import { RootStackParamList } from "../utils/types/common";
import { useCurrentUser } from "../utils/auth";
import LinkingConfiguration from "./LinkingConfiguration";
import { SocketProvider } from "../utils/socketio";
import { MessagesProvider } from "../utils/messages-repository";
import ChatWindowScreen from "../screens/chat/ChatWindow";
import { navigationRef } from "./navRef";
import AttendanceTakerScreen from "../screens/attendance/AttendanceTakerScreen";
import { hasUserStaticRoles, StaticRole } from "schooltalk-shared/misc";
import SchoolSettingsScreen from "../screens/settings/school/SchoolSettingsScreen";
import SubjectsSettingsScreen from "../screens/settings/school/SubjectsSettingsScreen";
import ClassSectionSettingsScreen from "../screens/settings/school/ClassSectionSettingsScreen";
import { RoutineSettingsScreen } from "../screens/settings/school/RoutineSettingsScreen";
import { PeopleSettingsScreen } from "../screens/settings/school/PeopleSettingsScreen";
import TestDetailsScreen from "../screens/exam/TestDetails";
import ExamDetailsScreen from "../screens/exam/ExamDetails";
import AboutAppScreen from "../screens/settings/AboutAppScreen";
import { BottomTabNavigator } from "./BottomTabNav";

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
  const { isLoggedIn, user } = useCurrentUser();

  if (!school) return null;

  return isLoggedIn ? (
    <SocketProvider>
      <MessagesProvider>
        <Stack.Navigator
          screenOptions={{
            animation: "fade_from_bottom",
          }}
        >
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
          {hasUserStaticRoles(user, [StaticRole.teacher], "all") ? (
            <Stack.Screen
              name="AttendanceTaker"
              component={AttendanceTakerScreen}
              options={{
                headerShown: true,
                title: "Take Attendance",
              }}
            />
          ) : null}
          {hasUserStaticRoles(
            user,
            [StaticRole.principal, StaticRole.vice_principal],
            "some",
          ) ? (
            <>
              <Stack.Screen
                name="SchoolSettings"
                component={SchoolSettingsScreen}
                options={{
                  headerShown: true,
                  title: "School settings",
                }}
              />
              <Stack.Screen
                name="SubjectsSettings"
                component={SubjectsSettingsScreen}
                options={{
                  headerShown: true,
                  title: "Subjects",
                }}
              />
              <Stack.Screen
                name="ClassSectionSettings"
                component={ClassSectionSettingsScreen}
                options={{
                  headerShown: true,
                  title: "Classes & Sections",
                }}
              />
              <Stack.Screen
                name="RoutineSettingsScreen"
                component={RoutineSettingsScreen}
                options={{
                  headerShown: true,
                  title: "Routine (Timetable)",
                }}
              />
              <Stack.Screen
                name="PeopleSettings"
                component={PeopleSettingsScreen}
                options={{
                  headerShown: true,
                  title: "People",
                }}
              />
            </>
          ) : null}
          {hasUserStaticRoles(
            user,
            [StaticRole.teacher, StaticRole.student],
            "some",
          ) ? (
            <>
              <Stack.Screen
                name="TestDetails"
                component={TestDetailsScreen}
                options={{
                  headerShown: true,
                  title: "Test information",
                }}
              />
              <Stack.Screen
                name="ExamDetails"
                component={ExamDetailsScreen}
                options={{
                  headerShown: true,
                  title: "Exam information",
                }}
              />
            </>
          ) : null}

          <Stack.Screen
            name="AboutApp"
            component={AboutAppScreen}
            options={{
              headerShown: true,
              title: "About this app",
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
