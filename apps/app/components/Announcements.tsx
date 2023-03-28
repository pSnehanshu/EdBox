import React, { useMemo } from "react";
import { ListRenderItem } from "@shopify/flash-list";
import { Text, View } from "./Themed";
import { Pressable, StyleSheet } from "react-native";
import { Group, Message } from "schooltalk-shared/types";
import { useMessages } from "../utils/messages-repository";
import { useCurrentUser } from "../utils/auth";
import { format, isThisYear, isToday, isYesterday } from "date-fns";
import { getDisplayName } from "schooltalk-shared/misc";
import { useNavigation } from "@react-navigation/native";
import { getSchoolGroupIdentifier } from "schooltalk-shared/group-identifier";
import config from "../config";
import useColorScheme from "../utils/useColorScheme";

interface AnnouncementProps {
  message: Message;
}
function SingleAnnouncement({ message }: AnnouncementProps) {
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
  <SingleAnnouncement message={item} />
);

const group: Group = {
  name: "School Group",
  identifier: getSchoolGroupIdentifier(config.schoolId),
};

export default function Announcements() {
  const messages = useMessages();
  const groupMessages = messages.useFetchGroupMessages(group.identifier, 7);
  const navigation = useNavigation();
  const scheme = useColorScheme();

  return (
    <View>
      <Text style={styles.header_text}>Announcements</Text>
      {groupMessages.messages.map((message) => (
        <SingleAnnouncement message={message} key={message.id} />
      ))}

      {groupMessages.messages.length > 0 && (
        <Pressable
          style={[
            styles.view_more_btn_wrapper,
            { borderColor: scheme === "dark" ? "white" : "black" },
          ]}
          onPress={() => navigation.navigate("ChatWindow", group)}
        >
          <Text style={styles.view_more_btn}>View more</Text>
        </Pressable>
      )}
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
    marginBottom: 8,
    marginLeft: "5%",
    width: "90%",
  },
  header_text: {
    fontSize: 25,
    fontWeight: "500",
    marginLeft: 20,
    marginTop: 16,
    marginBottom: 16,
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
    color: "white",
  },
  view_more_btn: {
    textAlign: "center",
  },
  view_more_btn_wrapper: {
    flex: 1,
    padding: 7,
    borderRadius: 5,
    borderWidth: 2,
    marginVertical: 16,
    marginHorizontal: 24,
    justifyContent: "flex-start",
  },
});
