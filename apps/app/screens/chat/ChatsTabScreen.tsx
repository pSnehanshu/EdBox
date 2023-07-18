import _ from "lodash";
import { useNavigation } from "@react-navigation/native";
import { format, isToday, isYesterday, isThisYear } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, Pressable, Image } from "react-native";
import { getDisplayName } from "schooltalk-shared/misc";
import type { ListRenderItem } from "@shopify/flash-list";
import { List, Text, View } from "../../components/Themed";
import { useGetUserGroups } from "../../utils/groups";
import { useMessages } from "../../utils/messages-repository";

interface GroupItemProps {
  onClick?: () => void;
  group: unknown;
  onMessage?: (date: Date) => void;
}
function GroupItem(props: GroupItemProps) {
  const Messages = useMessages();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.chatGroup,
        { opacity: pressed ? 0.5 : 1 },
      ]}
      onPress={props.onClick}
    >
      <Image
        source={require("../../assets/images/multiple-users-silhouette.png")}
        style={styles.chatGroupIcon}
      />
      <View style={styles.chatGroupMiddle}>
        <Text style={styles.chatGroupName}></Text>
        <Text style={styles.chatGroupLastMessage}>
          {/* {lastMessage
            ? _.truncate(
                `${
                  lastMessage.Sender
                    ? getDisplayName(lastMessage.Sender)
                    : "User"
                }: ${lastMessage.text}`,
                {
                  length: 45,
                },
              )
            : "Tap to chat"} */}
        </Text>
      </View>
      <View style={styles.chatGroupRight}>
        {/* <Text style={styles.chatGroupLastMessage}>{time}</Text> */}
      </View>
    </Pressable>
  );
}

export default function ChatsListScreen() {
  const navigation = useNavigation();
  const { isLoading, groups, refetch } = useGetUserGroups({
    page: 1,
  });
  const [groupTimeMapping, setGroupTimeMapping] = useState<
    Record<string, Date>
  >({});

  const sortedGroups = useMemo(() => {
    if (!groups) return [];

    return _.sortBy(groups, (group) => {
      const t = null;
      return t ?? new Date("1970-01-01T00:00:00Z"); // This is to keep empty chats at the bottom
    }).reverse();
  }, [groupTimeMapping, groups?.length]);

  const renderItem = useCallback<ListRenderItem<unknown>>(
    ({ item: group }) => (
      <GroupItem
        group={group}
        onClick={() => null}
        onMessage={(date) => {
          setGroupTimeMapping((mapping) => ({
            ...mapping,
            // [group.identifier]: date,
          }));
        }}
      />
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <List
        data={sortedGroups}
        estimatedItemSize={styles.chatGroup.height}
        renderItem={renderItem}
        refreshing={isLoading}
        onRefresh={refetch}
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
    height: 80,
    overflow: "hidden",
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
    maxWidth: "80%",
  },
  chatGroupName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chatGroupRight: {
    backgroundColor: undefined,
    paddingRight: 8,
    marginLeft: "auto",
  },
  chatGroupLastMessage: {
    fontSize: 12,
    color: "gray",
  },
});
