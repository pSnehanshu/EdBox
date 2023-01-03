import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { SafeAreaView, StyleSheet, Pressable, Image } from "react-native";
import { List, Text, View } from "../components/Themed";
import { ChatsTabParamList } from "../types";
import { trpc } from "../utils/trpc";
import ChatWindowScreen from "./chat/ChatWindow";

const ChatStack = createNativeStackNavigator<ChatsTabParamList>();

export default function ChatsTabScreen() {
  return (
    <ChatStack.Navigator initialRouteName="ChatList">
      <ChatStack.Screen
        name="ChatList"
        component={ChatsListScreen}
        options={{
          title: "Chat",
        }}
      />
      <ChatStack.Screen
        name="ChatWindow"
        component={ChatWindowScreen}
        options={{
          title: "Messages",
        }}
      />
    </ChatStack.Navigator>
  );
}

function ChatsListScreen({
  navigation,
}: NativeStackScreenProps<ChatsTabParamList, "ChatList">) {
  const {
    isLoading,
    isError,
    data: chats,
  } = trpc.school.messaging.fetchGroups.useQuery({
    sort: "recent_message",
    page: 1,
  });

  return (
    <SafeAreaView style={styles.container}>
      <List
        data={chats ?? []}
        renderItem={({ item: chatGroup }) => {
          return (
            <Pressable
              style={({ pressed }) => {
                return {
                  ...styles.chatGroup,
                  backgroundColor: pressed ? "rgb(210, 230, 255)" : undefined,
                };
              }}
              onPress={() => navigation.navigate("ChatWindow", chatGroup)}
            >
              <Image
                source={require("../assets/images/multiple-users-silhouette.png")}
                style={styles.chatGroupIcon}
              />
              <View style={styles.chatGroupMiddle}>
                <Text style={styles.chatGroupName}>{chatGroup.name}</Text>
                <Text style={styles.chatGroupLastMessage}>
                  User 1: How are you everyone?
                </Text>
              </View>
              <View style={styles.chatGroupRight}>
                <Text style={styles.chatGroupLastMessage}>10:23 pm</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  chatGroup: {
    paddingVertical: 16,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    flex: 1,
    flexDirection: "row",
  },
  chatGroupIcon: {
    width: 48,
    aspectRatio: 1,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 50,
    marginLeft: 8,
    backgroundColor: "white",
  },
  chatGroupMiddle: {
    backgroundColor: undefined,
    flexGrow: 1,
    paddingLeft: 16,
  },
  chatGroupName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chatGroupRight: {
    backgroundColor: undefined,
    paddingRight: 8,
  },
  chatGroupLastMessage: {
    fontSize: 12,
    color: "gray",
  },
});
