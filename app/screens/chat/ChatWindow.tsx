import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Button } from "react-native";
import { List, Text, TextInput, View } from "../../components/Themed";
import { useSchool } from "../../hooks/useSchool";
import { ChatsTabParamList } from "../../types";
import { useSocket } from "../../utils/socketio";

export default function ChatWindowScreen({
  route: { params: groupInfo },
}: NativeStackScreenProps<ChatsTabParamList, "ChatWindow">) {
  const socket = useSocket();
  const school = useSchool();
  const [messageText, setMessageText] = useState("");

  return (
    <View>
      <List
        data={["Chat1", "Chat2"]}
        renderItem={({ item: chat }) => {
          return <Text>{chat}</Text>;
        }}
      />

      <TextInput value={messageText} onChangeText={(t) => setMessageText(t)} />
      <Button
        title="Send msg"
        onPress={() => {
          socket.isConnected &&
            socket.client.emit(
              "messageCreate",
              {
                gd: "a",
                ty: "sc",
                sc: school.id,
              },
              messageText
            );

          setMessageText("");
        }}
      />
    </View>
  );
}
