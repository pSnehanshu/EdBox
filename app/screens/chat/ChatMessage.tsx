import { useCurrentUser } from "../../utils/auth";
import type { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "../../../backend/trpc";
import { format } from "date-fns";
import { Text, View } from "../../components/Themed";
import { StyleSheet } from "react-native";

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type Message = ArrayElement<
  inferRouterOutputs<AppRouter>["school"]["messaging"]["fetchGroupMessages"]
>;

interface ChatMessageProps {
  message: Message;
}
export default function ChatMessage({ message }: ChatMessageProps) {
  const user = useCurrentUser();

  const isSentByMe = user.id === message.sender_id;
  const time = format(new Date(message.created_at), "h:mm aaa");
  const color = isSentByMe ? "black" : "white";

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
  },
  body: {
    paddingVertical: 4,
  },
  time: {
    fontSize: 10,
    textAlign: "right",
    paddingRight: 6,
    paddingBottom: 4,
  },
});
