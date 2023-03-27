import React, { useMemo } from "react";
import { autoScroll, ListRenderItem } from "@shopify/flash-list";
import { List, Text, View } from "./Themed";
import { Dimensions, Pressable, ScrollView, StyleSheet } from "react-native";
import { Message } from "schooltalk-shared/types";
import { useMessages } from "../utils/messages-repository";
import { useCurrentUser } from "../utils/auth";
import { format, isThisYear, isToday, isYesterday } from "date-fns";

import { getDisplayName } from "schooltalk-shared/misc";
import navigation from "../navigation";
import { useNavigation } from "@react-navigation/native";

interface AnnouncementProps {
  message: Message;
}
function Announcement({ message }: AnnouncementProps) {
  const { user } = useCurrentUser();
  const time = useMemo(() => {
    const date = new Date(message.created_at);
    const time = format(date, "hh:mm aaa");

    if (isToday(date)) {
      return time;
    }
    if (isYesterday(date)) {
      return `Yesterday ${time}`;
    }
    if (isThisYear(date)) {
      return `${format(date, "d MMM")} ${time}`;
    }
    return `${format(date, "dd/MM/yy")} ${time}`;
  }, [message.created_at]);

  if (!user) return null;

  const sender = message.Sender;
  const isSentByMe = user.id === sender.id;

  return (
    <View style={styles.container}>
      {isSentByMe ? (
        <Text style={styles.name_text}>You</Text>
      ) : (
        <Text style={styles.name_text}>{getDisplayName(sender)}</Text>
      )}
      <Text style={styles.message_text}>{message.text}</Text>
    </View>
  );
}

const renderItem: ListRenderItem<Message> = ({ item }) => (
  <Announcement message={item} />
);

function Announcements() {
  const group = {
    name: "Don Bosco Guwahati",
    identifier: "gd=a&sc=clcpuzcxf00001yvt5ppcenso&ty=sc",
  };
  const messages = useMessages();
  const groupMessages = messages.useFetchGroupMessages(group.identifier, 7);
  const navigation = useNavigation();
  return (
    <View style={{ height: "55%" }}>
      {/* how to mannage the height */}
      <Text style={styles.header_text}>Announcements</Text>
      <List
        data={groupMessages.messages}
        renderItem={renderItem}
        onEndReachedThreshold={1}
        estimatedItemSize={80}
        ListHeaderComponent={<View style={{ height: 15 }} />}
      />
      <Pressable
        style={styles.header_text}
        onPress={() => navigation.navigate("ChatWindow", group)}
      >
        <Text>load more</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 4,
    paddingLeft: 16,
    shadowColor: "gray",
    shadowRadius: 8,
    shadowOffset: {
      height: 8,
      width: 8,
    },
    borderRadius: 8,
    minHeight: 80,
    justifyContent: "flex-start",
    backgroundColor: "#4E58B2",
    marginBottom: 3,
    marginLeft: "5%",
    width: "90%",
  },
  header_text: {
    fontSize: 25,
    fontWeight: "500",
    marginLeft: 20,
    marginTop: 15,
  },
  time: {
    fontSize: 10,
    textAlign: "right",
    paddingRight: 6,
    paddingBottom: 4,
    opacity: 0.6,
  },
  name_text: {
    fontSize: 18,
    color: "gray",
    marginTop: 8,
  },
  message_text: {
    fontSize: 20,
    color: "white",
  },
});

export default Announcements;
