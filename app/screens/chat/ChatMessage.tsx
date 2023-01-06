import { useMemo } from "react";
import { format, isThisYear, isToday, isYesterday } from "date-fns";
import { useCurrentUser } from "../../utils/auth";
import { Text, View } from "../../components/Themed";
import { StyleSheet } from "react-native";
import type { Message } from "../../../shared/types";

interface ChatMessageProps {
  message: Message;
}
export default function ChatMessage({ message }: ChatMessageProps) {
  const user = useCurrentUser();

  const isSentByMe = user.id === message.sender_id;
  const color = isSentByMe ? "black" : "white";
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

  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: isSentByMe ? "lightblue" : "green",
        width: "75%",
        alignSelf: isSentByMe ? "flex-end" : "flex-start",
      }}
    >
      {isSentByMe ? null : (
        <Text style={{ ...styles.senderName, color }}>
          {message.Sender.name}
        </Text>
      )}
      <Text style={{ ...styles.body, color }}>{message.text}</Text>
      <Text style={{ ...styles.time, color }}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 4,
    paddingLeft: 16,
    margin: 4,
    shadowColor: "gray",
    shadowRadius: 8,
    shadowOffset: {
      height: 8,
      width: 8,
    },
    borderRadius: 8,
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
});
