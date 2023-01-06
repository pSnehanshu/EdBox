import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { format, isToday, isYesterday, isThisYear } from "date-fns";
import { useMemo } from "react";
import { SafeAreaView, StyleSheet, Pressable, Image } from "react-native";
import { GroupBasicInfo } from "../../backend/utils/group-identifier";
import { Message } from "../../shared/types";
import { List, Text, View } from "../components/Themed";
import { ChatsTabParamList } from "../types";
import { useMessages } from "../utils/messages-repository";
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

interface GroupItemProps {
  onClick?: () => void;
  group: GroupBasicInfo;
}
function GroupItem(props: GroupItemProps) {
  const Messages = useMessages();
  const { messages } = Messages.useFetchGroupMessages(props.group.id, 1);
  const lastMessage = messages[0] as Message | undefined;
  const time = useMemo(() => {
    if (!lastMessage?.created_at) return "";

    const date = new Date(lastMessage.created_at);

    if (isToday(date)) {
      return format(date, "h:mm aaa");
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    if (isThisYear(date)) {
      return format(date, "d MMM");
    }

    return format(date, "dd/LL/yy");
  }, [lastMessage?.created_at]);

  return (
    <Pressable
      style={({ pressed }) => {
        return {
          ...styles.chatGroup,
          backgroundColor: pressed ? "rgb(210, 230, 255)" : undefined,
        };
      }}
      onPress={props.onClick}
    >
      <Image
        source={require("../assets/images/multiple-users-silhouette.png")}
        style={styles.chatGroupIcon}
      />
      <View style={styles.chatGroupMiddle}>
        <Text style={styles.chatGroupName}>{props.group.name}</Text>
        <Text style={styles.chatGroupLastMessage}>
          {lastMessage?.Sender?.name}: {lastMessage?.text}
        </Text>
      </View>
      <View style={styles.chatGroupRight}>
        <Text style={styles.chatGroupLastMessage}>{time}</Text>
      </View>
    </Pressable>
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
        renderItem={({ item: group }) => (
          <GroupItem
            group={group}
            onClick={() => navigation.navigate("ChatWindow", group)}
          />
        )}
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
