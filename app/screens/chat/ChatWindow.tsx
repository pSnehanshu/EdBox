import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { List, TextInput, View } from "../../components/Themed";
import { ChatsTabParamList } from "../../types";
import { trpc } from "../../utils/trpc";
import ChatMessage from "./ChatMessage";
import { Ionicons } from "@expo/vector-icons";
import { useMessages } from "../../utils/messages-repository";

export default function ChatWindowScreen({
  route: { params: groupInfo },
}: NativeStackScreenProps<ChatsTabParamList, "ChatWindow">) {
  const messages = useMessages();
  const [messageText, setMessageText] = useState("");
  const messagesQuery = trpc.school.messaging.fetchGroupMessages.useQuery({
    groupIdentifier: groupInfo.id,
  });
  const utils = trpc.useContext();

  messages.useGroupMessageReceived(groupInfo.id, (message) => {
    utils.school.messaging.fetchGroupMessages.invalidate();
  });

  return (
    <View style={styles.container}>
      <List
        inverted
        style={styles.messages}
        data={messagesQuery.data ?? []}
        renderItem={({ item }) => <ChatMessage message={item} />}
      />

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
            if (!messageText.trim()) return;
            messages.sendMessage(groupInfo.id, messageText.trim());
            utils.school.messaging.fetchGroupMessages.invalidate();
            setMessageText("");
          }}
        >
          Send
        </Ionicons.Button>
      </View>
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
