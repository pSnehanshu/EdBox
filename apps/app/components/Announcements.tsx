import React, { useCallback, useMemo } from "react";
import { Text, View } from "./Themed";
import { Alert, Pressable, StyleSheet } from "react-native";
import { Group, Message } from "schooltalk-shared/types";
import { useMessages } from "../utils/messages-repository";
import { useCurrentUser } from "../utils/auth";
import { format, isThisYear, isToday, isYesterday } from "date-fns";
import { getDisplayName } from "schooltalk-shared/misc";
import { useNavigation } from "@react-navigation/native";
import { getSchoolGroupIdentifier } from "schooltalk-shared/group-identifier";
import { useConfig } from "../utils/config";
import useColorScheme from "../utils/useColorScheme";

interface AnnouncementProps {
  message: Message;
}
function SingleAnnouncement({ message }: AnnouncementProps) {
  const config = useConfig();
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

  const sender = message.Sender;
  const shouldCollapse = message.text.length > config.previewMessageLength;
  const trimmedMessage = useMemo(
    () =>
      shouldCollapse
        ? message.text.slice(0, config.previewMessageLength).trimEnd()
        : message.text,
    [message.text],
  );
  const senderDisplayName = useMemo(() => getDisplayName(sender), [sender]);
  const viewFullMessage = useCallback(() => {
    if (shouldCollapse) {
      Alert.alert(senderDisplayName, message.text);
    }
  }, [senderDisplayName, message.text, shouldCollapse]);

  if (!user) return null;

  const isSentByMe = user.id === sender.id;

  return (
    <View style={styles.container}>
      <View style={styles.announcement_header}>
        <Text style={styles.name_text}>
          {isSentByMe ? "You" : senderDisplayName}
        </Text>

        <Text style={styles.time}>{time}</Text>
      </View>

      <Pressable
        style={({ pressed }) => ({
          opacity: pressed ? 0.4 : 1,
        })}
        onPress={viewFullMessage}
      >
        <Text style={styles.message_text}>
          {trimmedMessage}
          {shouldCollapse ? "..." : ""}
        </Text>
      </Pressable>

      {shouldCollapse && (
        <Pressable onPress={viewFullMessage}>
          <Text style={styles.read_more_btn}>Read more</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function Announcements() {
  const messages = useMessages();

  const config = useConfig();
  const group: Group = useMemo(
    () => ({
      name: "School Group",
      identifier: getSchoolGroupIdentifier(config.schoolId),
    }),
    [config.schoolId],
  );

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
    paddingVertical: 8,
    paddingLeft: 16,
    shadowColor: "gray",
    shadowRadius: 8,
    shadowOffset: {
      height: 8,
      width: 8,
    },
    borderRadius: 8,
    justifyContent: "flex-start",
    backgroundColor: "#4E58B2",
    marginBottom: 8,
    marginHorizontal: 24,
  },
  header_text: {
    fontSize: 25,
    fontWeight: "500",
    marginLeft: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  announcement_header: {
    backgroundColor: "transparent",
    paddingVertical: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time: {
    fontSize: 12,
    textAlign: "right",
    paddingRight: 6,
    opacity: 0.6,
    color: "white",
  },
  name_text: {
    fontSize: 12,
    opacity: 0.6,
    textDecorationLine: "underline",
    color: "white",
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
  read_more_btn: {
    textDecorationLine: "underline",
    color: "#50b4c1",
    fontSize: 10,
  },
});
