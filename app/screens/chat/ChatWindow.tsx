import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { ListRenderItem, StyleSheet } from "react-native";
import { List, TextInput, View } from "../../components/Themed";
import { ChatsTabParamList } from "../../types";
import { trpc } from "../../utils/trpc";
import ChatMessage from "./ChatMessage";
import { Ionicons } from "@expo/vector-icons";
import { useMessages } from "../../utils/messages-repository";
import { Message } from "../../../shared/types";

const renderItem: ListRenderItem<Message> = ({ item }) => (
  <ChatMessage message={item} />
);

export default function ChatWindowScreen({
  route: { params: groupInfo },
}: NativeStackScreenProps<ChatsTabParamList, "ChatWindow">) {
  const [messageText, setMessageText] = useState("");
  const messages = useMessages();
  const groupMessages = messages.useFetchGroupMessages(groupInfo.id, 30);
  const utils = trpc.useContext();

  return (
    <View style={styles.container}>
      {/* TODO: Add a manual load more button to the top of the chat list.
      this is because sometimes onEndReached is not triggered */}
      <List
        inverted
        style={styles.messages}
        data={groupMessages.messages}
        renderItem={renderItem}
        onEndReached={groupMessages.fetchNextPage}
        onEndReachedThreshold={1}
        initialNumToRender={10}
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
