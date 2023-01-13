import { useNavigation } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { format, isToday, isYesterday, isThisYear } from "date-fns";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, Pressable, Image } from "react-native";
import { Group } from "schooltalk-shared/types";
import { Message } from "schooltalk-shared/types";
import { List, Text, View } from "../../components/Themed";
import { ChatsTabParamList } from "../../types";
import { useMessages } from "../../utils/messages-repository";
import { trpc } from "../../utils/trpc";

const ChatStack = createNativeStackNavigator<ChatsTabParamList>();

export default function ChatsTabScreen() {
  return (
    <ChatStack.Navigator initialRouteName="ChatList">
      <ChatStack.Screen
        name="ChatList"
        component={ChatsListScreen}
        options={{
          headerShown: false,
        }}
      />
    </ChatStack.Navigator>
  );
}

interface GroupItemProps {
  onClick?: () => void;
  group: Group;
  onMessage?: (date: Date) => void;
}
function GroupItem(props: GroupItemProps) {
  const Messages = useMessages();
  const { messages } = Messages.useFetchGroupMessages(
    props.group.identifier,
    1
  );
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

  useEffect(() => {
    if (lastMessage?.created_at) {
      props.onMessage?.(new Date(lastMessage.created_at));
    }
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
        source={require("../../assets/images/multiple-users-silhouette.png")}
        style={styles.chatGroupIcon}
      />
      <View style={styles.chatGroupMiddle}>
        <Text style={styles.chatGroupName}>{props.group.name}</Text>
        <Text style={styles.chatGroupLastMessage}>
          {lastMessage
            ? _.truncate(`${lastMessage.Sender?.name}: ${lastMessage.text}`, {
                length: 45,
              })
            : "Tap to chat"}
        </Text>
      </View>
      <View style={styles.chatGroupRight}>
        <Text style={styles.chatGroupLastMessage}>{time}</Text>
      </View>
    </Pressable>
  );
}

function ChatsListScreen({}: NativeStackScreenProps<
  ChatsTabParamList,
  "ChatList"
>) {
  const navigation = useNavigation();
  const {
    isLoading,
    isError,
    data: groups,
  } = trpc.school.messaging.fetchGroups.useQuery({
    page: 1,
  });
  const [groupTimeMapping, setGroupTimeMapping] = useState<
    Record<string, Date>
  >({});

  const sortedGroups = useMemo(() => {
    if (!groups) return [];

    return _.sortBy(groups, (group) => {
      const t = groupTimeMapping[group.identifier];
      return t ?? new Date();
    }).reverse();
  }, [groupTimeMapping, groups?.length]);

  return (
    <SafeAreaView style={styles.container}>
      <List
        data={sortedGroups}
        renderItem={({ item: group }) => (
          <GroupItem
            group={group}
            onClick={() => navigation.navigate("ChatWindow", group)}
            onMessage={(date) => {
              setGroupTimeMapping((mapping) => ({
                ...mapping,
                [group.identifier]: date,
              }));
            }}
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