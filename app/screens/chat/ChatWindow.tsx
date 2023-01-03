import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Button } from "react-native";
import { List, TextInput, View } from "../../components/Themed";
import { ChatsTabParamList } from "../../types";
import { useSocket } from "../../utils/socketio";
import { trpc } from "../../utils/trpc";
import ChatMessage from "./ChatMessage";

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
    <View>
      <List
        data={(messagesQuery.data ?? []).slice().reverse()}
        renderItem={({ item }) => <ChatMessage message={item} />}
      />

      {
        socket.isConnected ? (
          <>
            <TextInput
              value={messageText}
              placeholder="Message"
              onChangeText={(t) => setMessageText(t)}
            />
            <Button
              title="Send msg"
              onPress={() => {
                socket.isConnected &&
                  socket.client.emit(
                    "messageCreate",
                    groupInfo.id,
                    messageText
                  );
                utils.school.messaging.fetchGroupMessages.invalidate();

                setMessageText("");
              }}
            />
          </>
        ) : null /* TODO: Allow sending messages when offline */
      }
    </View>
  );
}
