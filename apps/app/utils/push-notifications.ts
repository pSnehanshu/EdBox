import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function getPushToken() {
  if (Device.isDevice) {
    throw new Error("Must use physical device for Push Notifications");
  }

  // Check notif permission
  const status = await (async () => {
    // Check if permission already granted
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      return status;
    }

    return existingStatus;
  })();

  // Permission was denied
  if (status !== "granted") {
    throw new Error("Notification permission denied");
  }

  // Permission was granted
  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Setup channel for Android
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // Return token
  return token;
}
