import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { List, TextInput, View } from "../../components/Themed";
import { ChatsTabParamList } from "../../types";
import { useSocket } from "../../utils/socketio";
import { trpc } from "../../utils/trpc";
import ChatMessage from "./ChatMessage";
import { Ionicons } from "@expo/vector-icons";

export default function ChatWindowScreen({
  route: { params: groupInfo },
}: NativeStackScreenProps<ChatsTabParamList, "ChatWindow">) {
  const socket = useSocket();
  const [messageText, setMessageText] = useState("");
  const messagesQuery = trpc.school.messaging.fetchGroupMessages.useQuery({
    groupIdentifier: groupInfo.id,
  });
  const utils = trpc.useContext();

  return (
    <View style={styles.container}>
      <List
        inverted
        style={styles.messages}
        data={messagesQuery.data ?? []}
        renderItem={({ item }) => <ChatMessage message={item} />}
      />

      {
        socket.isConnected ? (
          <View style={styles.composer}>
            <TextInput
              value={messageText}
              placeholder="Message"
              onChangeText={(t) => setMessageText(t)}
              style={styles.composerText}
            />

            <Ionicons.Button
              name="send"
              style={styles.composerSendBtn}
              onPress={() => {
                // Don't submit empty message
                if (!messageText.trim()) return;

                socket.isConnected &&
                  socket.client.emit(
                    "messageCreate",
                    groupInfo.id,
                    messageText.trim()
                  );
                utils.school.messaging.fetchGroupMessages.invalidate();

                setMessageText("");
              }}
            >
              Send
            </Ionicons.Button>
          </View>
        ) : null /* TODO: Allow sending messages when offline */
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messages: {
    flexGrow: 1,
  },
  composer: {
    flex: 0,
    flexDirection: "row",
    width: "100%",
    padding: 8,
  },
  composerText: {
    width: "80%",
    padding: 2,
  },
  composerSendBtn: {
    padding: 8,
  },
});
