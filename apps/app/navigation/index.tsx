import {
  Entypo,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  useNavigation,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ColorSchemeName, Modal, Pressable } from "react-native";
import { useContext, useState } from "react";
import Colors from "../constants/Colors";
import { ColorSchemeContext } from "../utils/useColorScheme";
import { useSchool } from "../utils/useSchool";
import LoginScreen from "../screens/auth/Login";
import { RootStackParamList } from "../utils/types/common";
import { useCurrentUser } from "../utils/auth";
import LinkingConfiguration from "./LinkingConfiguration";
import { SocketProvider } from "../utils/socketio";
import { MessagesProvider } from "../utils/messages-repository";
import ChatWindowScreen from "../screens/chat/ChatWindow";
import { navigationRef } from "./navRef";
import AttendanceTakerScreen from "../screens/attendance/AttendanceTakerScreen";
import { StaticRole } from "schooltalk-shared/misc";
import SchoolSettingsScreen from "../screens/settings/school/SchoolSettingsScreen";
import SubjectsSettingsScreen from "../screens/settings/school/SubjectsSettingsScreen";
import ClassSectionSettingsScreen from "../screens/settings/school/ClassSectionSettingsScreen";
import { RoutineSettingsScreen } from "../screens/settings/school/RoutineSettingsScreen";
import { PeopleSettingsScreen } from "../screens/settings/school/PeopleSettingsScreen";
import TestDetailsScreen from "../screens/exam/TestDetails";
import ExamDetailsScreen from "../screens/exam/ExamDetails";
import AboutAppScreen from "../screens/settings/AboutAppScreen";
import { BottomTabNavigator } from "./BottomTabNav";
import ExamListScreen from "../screens/exam/ExamList";
import HomeWorkScreen from "../screens/homework/HomeWorkScreen";
import SchoolSelector from "../components/SchoolSelector";
import {
  hasPreloadedSchool,
  useConfig,
  useSelectDefaultRole,
} from "../utils/config";
import { Text, View } from "../components/Themed";
import CreateHomeworkScreen from "../screens/homework/CreateHomeworkScreen";
import DisplayHomeworkScreen from "../screens/homework/DisplayHomeworkScreen";
import UpdateHomeworkScreen from "../screens/homework/UpdateHomeworkScreen";
import CreateExamScreen from "../screens/exam/CreateExamScreen";
import CreateTestScreen from "../screens/exam/CreateTestScreen";
import ProfileScreen from "../screens/settings/ProfileScreen";
import { StaticRoleSelector } from "../components/StaticRoleSelector";
import ProfileEditScreen from "../screens/settings/ProfileEditScreen";
import PhoneNoEditScreen from "../screens/settings/PhoneNoEditScreen";
import ChatGroupDetails from "../screens/chat/ChatGroupDetails";

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

interface SchoolSelectorModalProps {
  isOpen: boolean;
  onClose?: () => void;
}
function SchoolSelectorModal({ isOpen, onClose }: SchoolSelectorModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <SchoolSelector onSelect={onClose} showCancelButton onClose={onClose} />
    </Modal>
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
  const { scheme } = useContext(ColorSchemeContext);
  const [isSchoolSelectorOpen, setIsSchoolSelectorOpen] = useState(false);
  const config = useConfig();

  // DO NOT EVER REMOVE THIS HOOK
  useSelectDefaultRole();

  if (!school) return null;
  const { navigate } = useNavigation();

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
              headerRight: (props) => (
                <Ionicons
                  name="information"
                  size={24}
                  color="black"
                  onPress={() => {
                    navigate("ChatGroupDetails", {
                      params: route.params,
                    });
                  }}
                />
              ),
              headerTitle: (props) => (
                <Pressable
                  onPress={() => {
                    navigate("ChatGroupDetails", {
                      params: route.params,
                    });
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                  })}
                >
                  <Text style={{ fontSize: 20, fontWeight: "500" }}>
                    {route.params.name ?? "Messages"}
                  </Text>
                </Pressable>
              ),
            })}
          />

          {config.activeStaticRole === StaticRole.teacher ? (
            <>
              <Stack.Screen
                name="AttendanceTaker"
                component={AttendanceTakerScreen}
                options={{
                  headerShown: true,
                  title: "Take Attendance",
                }}
              />
              <Stack.Screen
                name="CreateHomeworkScreen"
                component={CreateHomeworkScreen}
                options={{
                  headerShown: true,
                  title: "Create Homework",
                }}
              />
              <Stack.Screen
                name="UpdateHomeworkScreen"
                component={UpdateHomeworkScreen}
                options={{
                  headerShown: true,
                  title: "Update Homework",
                }}
              />
              <Stack.Screen
                name="CreateExamScreen"
                component={CreateExamScreen}
                options={{
                  headerShown: true,
                  title: "Create New Exam",
                }}
              />
              <Stack.Screen
                name="CreateTestScreen"
                component={CreateTestScreen}
                options={{
                  headerShown: true,
                  title: "Create New Test",
                }}
              />
            </>
          ) : null}

          {[StaticRole.principal, StaticRole.vice_principal].includes(
            config.activeStaticRole,
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

          {[StaticRole.teacher, StaticRole.student].includes(
            config.activeStaticRole,
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
              <Stack.Screen
                name="ExamsScreen"
                component={ExamListScreen}
                options={{
                  headerShown: true,
                  title: "Class tests and Exams",
                }}
              />
              <Stack.Screen
                name="HomeWorkScreen"
                component={HomeWorkScreen}
                options={{
                  headerShown: true,
                  title: "Homeworks",
                }}
              />
            </>
          ) : null}

          <Stack.Screen
            name="DisplayHomeworkScreen"
            component={DisplayHomeworkScreen}
            options={{
              headerShown: true,
              title: "Homework",
            }}
          />

          <Stack.Screen
            name="AboutApp"
            component={AboutAppScreen}
            options={{
              headerShown: true,
              title: "About this app",
            }}
          />

          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={({
              route: {
                params: { userId },
              },
            }) => ({
              headerShown: true,
              title: "Profile",
              headerRight() {
                if (userId !== user.id) return null;

                return (
                  <StaticRoleSelector>
                    {({ onPress, selectedString }) => (
                      <View style={{ backgroundColor: "transparent" }}>
                        {hasPreloadedSchool ? null : (
                          <Pressable
                            onPress={onPress}
                            style={({ pressed }) => ({
                              opacity: pressed ? 0.5 : 1,
                              padding: 8,
                              flexDirection: "row",
                              alignItems: "center",
                              borderColor: "gray",
                              borderWidth: 1,
                              borderRadius: 5,
                            })}
                          >
                            <FontAwesome5
                              name="user-tag"
                              size={16}
                              color={Colors[scheme].text}
                              style={{ marginRight: 2 }}
                            />
                            <Text>{selectedString}</Text>

                            <Entypo
                              name="chevron-down"
                              size={24}
                              color={Colors[scheme].text}
                              style={{ marginLeft: 4 }}
                            />
                          </Pressable>
                        )}
                      </View>
                    )}
                  </StaticRoleSelector>
                );
              },
            })}
          />

          <Stack.Screen
            name="ProfileEditScreen"
            component={ProfileEditScreen}
            options={{
              headerShown: true,
              title: "Edit profile",
            }}
          />
          <Stack.Screen
            name="ChatGroupDetails"
            component={ChatGroupDetails}
            options={{
              headerShown: true,
              title: "Chat Details",
            }}
          />
          <Stack.Screen
            name="PhoneNoEditScreen"
            component={PhoneNoEditScreen}
            options={{
              headerShown: true,
              title: "Edit Phone No",
            }}
          />
        </Stack.Navigator>
      </MessagesProvider>
    </SocketProvider>
  ) : (
    <>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: `Login to ${school.name}`,
            headerShown: true,
            headerRight: () => {
              return (
                <View style={{ flexDirection: "row" }}>
                  {hasPreloadedSchool ? null : (
                    <Pressable
                      onPress={() => setIsSchoolSelectorOpen(true)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.5 : 1,
                      })}
                    >
                      <MaterialCommunityIcons
                        name="arrow-down-drop-circle-outline"
                        size={25}
                        color={Colors[scheme].text}
                        style={{ marginRight: 15 }}
                      />
                    </Pressable>
                  )}
                </View>
              );
            },
          }}
        />
      </Stack.Navigator>

      <SchoolSelectorModal
        isOpen={isSchoolSelectorOpen}
        onClose={() => setIsSchoolSelectorOpen(false)}
      />
    </>
  );
}
