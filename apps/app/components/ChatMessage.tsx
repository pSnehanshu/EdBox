import { memo, useCallback, useMemo } from "react";
import { format, isThisYear, isToday, isYesterday } from "date-fns";
import { useCurrentUser } from "../utils/auth";
import { Text, View } from "./Themed";
import { Alert, Pressable, StyleSheet } from "react-native";
import type { Message } from "schooltalk-shared/types";
import {
  getDisplayName,
  getTextColorForGivenBG,
  getUserColor,
} from "schooltalk-shared/misc";
import { useConfig } from "../utils/config";

interface ChatMessageProps {
  message: Message;
}
function ChatMessage({ message }: ChatMessageProps) {
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

  if (!user) return null;

  const sender = message.Sender;
  const isSentByMe = user.id === sender.id;

  const bgColor = useMemo(
    () => (isSentByMe ? "#005d4b" : "#1f2c34"),
    [isSentByMe],
  );
  const color = useMemo(() => getTextColorForGivenBG(bgColor), [bgColor]);
  const senderDisplayName = useMemo(() => getDisplayName(sender), [sender]);
  const senderColor = useMemo(
    () => getUserColor(message.sender_id),
    [message.sender_id],
  );

  const shouldCollapse = message.text.length > config.previewMessageLength;
  const trimmedMessage = useMemo(
    () =>
      shouldCollapse
        ? message.text.slice(0, config.previewMessageLength).trimEnd()
        : message.text,
    [message.text, config.previewMessageLength],
  );

  const viewFullMessage = useCallback(() => {
    if (shouldCollapse) {
      Alert.alert(senderDisplayName, message.text);
    }
  }, [senderDisplayName, message.text, shouldCollapse]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          alignSelf: isSentByMe ? "flex-end" : "flex-start",
        },
      ]}
    >
      {isSentByMe ? null : (
        <Pressable
          onPress={() => {
            // TODO: Show basic user info as modal, with link to full profile
            alert(`User: ${sender.name}\nID: ${sender.id}`);
          }}
        >
          <Text style={[styles.senderName, { color: senderColor }]}>
            {senderDisplayName}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={viewFullMessage}
        style={({ pressed }) => ({
          opacity: pressed ? 0.4 : 1,
        })}
      >
        <Text style={[styles.body, { color }]}>
          {trimmedMessage}
          {shouldCollapse ? "..." : ""}
        </Text>
      </Pressable>

      {shouldCollapse && (
        <Pressable onPress={viewFullMessage}>
          <Text style={styles.viewMoreBtn}>Read more</Text>
        </Pressable>
      )}

      <Text style={[styles.time, { color }]}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 4,
    paddingLeft: 16,
    paddingRight: 8,
    margin: 4,
    shadowColor: "gray",
    shadowRadius: 8,
    shadowOffset: {
      height: 8,
      width: 8,
    },
    borderRadius: 8,
    width: "75%",
    marginHorizontal: 16,
  },
  senderName: {
    fontSize: 12,
    textDecorationLine: "underline",
    opacity: 0.7,
  },
  body: {
    paddingVertical: 4,
  },
  time: {
    fontSize: 10,
    textAlign: "right",
    paddingRight: 6,
    paddingBottom: 4,
    opacity: 0.6,
  },
  viewMoreBtn: {
    textDecorationLine: "underline",
    color: "#50b4c1",
    fontSize: 10,
  },
});

export default memo(ChatMessage);
