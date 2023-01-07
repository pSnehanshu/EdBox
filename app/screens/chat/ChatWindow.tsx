import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ListRenderItem,
  StyleSheet,
} from "react-native";
import { List, Text, TextInput, View } from "../../components/Themed";
import { RootStackParamList } from "../../types";
import ChatMessage from "./ChatMessage";
import { Ionicons } from "@expo/vector-icons";
import { useMessages } from "../../utils/messages-repository";
import { Message } from "../../../shared/types";
import { useGroupInfo } from "../../utils/groups";

const renderItem: ListRenderItem<Message> = ({ item }) => (
  <ChatMessage message={item} />
);

export default function ChatWindowScreen({
  route: { params: groupInfo },
  navigation,
}: NativeStackScreenProps<RootStackParamList, "ChatWindow">) {
  const [messageText, setMessageText] = useState("");
  const messages = useMessages();
  const groupMessages = messages.useFetchGroupMessages(groupInfo.id, 30);
  const groupInfoQuery = useGroupInfo(groupInfo.id);

  /** The Element that should appear at the end of the chat */
  const chatEndElement = useMemo(() => {
    if (groupMessages.isLoading) {
      return <ActivityIndicator style={styles.chatLoading} size="large" />;
    }

    if (groupMessages.hasMore) {
      return (
        <View style={styles.loadMoreBtn}>
          <Button
            title="Load older messages"
            onPress={groupMessages.fetchNextPage}
          />
        </View>
      );
    }

    if (groupMessages.messages.length > 0) {
      return <Text style={styles.endOfChat}>End of chat</Text>;
    }

    return <></>;
  }, [
    groupMessages.hasMore,
    groupMessages.isLoading,
    groupMessages.fetchNextPage,
    groupMessages.messages.length,
  ]);

  useEffect(() => {
    if (
      !groupInfoQuery.isLoading &&
      !groupInfoQuery.isError &&
      groupInfoQuery.data?.name
    ) {
      navigation.setOptions({
        title: groupInfoQuery.data?.name,
      });
    }
  }, [groupInfoQuery.data?.name, groupInfo.id]);

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
        ListFooterComponent={chatEndElement}
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
  chatLoading: {
    padding: 16,
  },
  loadMoreBtn: {
    marginBottom: 16,
  },
  endOfChat: {
    textAlign: "center",
    padding: 16,
    opacity: 0.7,
  },
});
