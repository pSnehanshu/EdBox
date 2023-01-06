/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { Ionicons } from "@expo/vector-icons";
import { createNavigationContainerRef } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ColorSchemeName, Pressable } from "react-native";
import Colors from "../constants/Colors";
import useColorScheme from "../utils/useColorScheme";
import { useSchool } from "../utils/useSchool";
import LoginScreen from "../screens/auth/Login";
import PreLoginScreen from "../screens/auth/PreLogin";
import HomeTabScreen from "../screens/HomeTabScreen";
import ChatsTabScreen from "../screens/ChatsTabScreen";
import {
  RootStackParamList,
  RootTabParamList,
  RootTabScreenProps,
} from "../types";
import { useFetchCurrentUser } from "../utils/auth";
import LinkingConfiguration from "./LinkingConfiguration";
import { SocketProvider, useSocket } from "../utils/socketio";
import { MessagesProvider } from "../utils/messages-repository";
import ChatWindowScreen from "../screens/chat/ChatWindow";

/** This can be used to navigate from outside any component or hook */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

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
  const { isLoggedIn } = useFetchCurrentUser();

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
  const colorScheme = useColorScheme();
  const socket = useSocket();

  return (
    <BottomTab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}
    >
      <BottomTab.Screen
        name="HomeTab"
        component={HomeTabScreen}
        options={({ navigation }: RootTabScreenProps<"HomeTab">) => ({
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="home-sharp"
              size={30}
              style={{ marginBottom: -3 }}
              color={color}
            />
          ),
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate("Modal")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <Ionicons
                name="information-circle"
                size={25}
                color={Colors[colorScheme].text}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        })}
      />
      <BottomTab.Screen
        name="ChatsTab"
        component={ChatsTabScreen}
        options={{
          title: `Chats ${socket.isConnected ? "" : "(reconnecting...)"}`,
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="md-chatbubbles"
              size={30}
              style={{ marginBottom: -3 }}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
    </BottomTab.Navigator>
  );
}
