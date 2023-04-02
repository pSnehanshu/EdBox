import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  ImageBackground,
} from "react-native";
import type { ListRenderItem } from "@shopify/flash-list";
import { List, Text, TextInput, View } from "../../components/Themed";
import { RootStackParamList } from "../../utils/types/common";
import ChatMessage from "../../components/ChatMessage";
import { Ionicons } from "@expo/vector-icons";
import { useMessages } from "../../utils/messages-repository";
import { Message } from "schooltalk-shared/types";
import { useGroupInfo } from "../../utils/groups";
import { useFileUpload } from "../../utils/file-upload";

const renderItem: ListRenderItem<Message> = ({ item }) => (
  <ChatMessage message={item} />
);

export default function ChatWindowScreen({
  route: { params: groupInfo },
  navigation,
}: NativeStackScreenProps<RootStackParamList, "ChatWindow">) {
  const [messageText, setMessageText] = useState("");
  const messages = useMessages();
  const groupMessages = messages.useFetchGroupMessages(
    groupInfo.identifier,
    30,
  );
  const groupInfoQuery = useGroupInfo(groupInfo.identifier);

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
  }, [groupInfoQuery.data?.name, groupInfo.identifier]);

  const fileUpload = useFileUpload();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/chat-bg.jpg")}
        style={styles.image}
      >
        {/* TODO: Add a manual load more button to the top of the chat list. this is because sometimes onEndReached is not triggered */}
        <List
          inverted
          data={groupMessages.messages}
          renderItem={renderItem}
          onEndReached={groupMessages.fetchNextPage}
          onEndReachedThreshold={1}
          estimatedItemSize={170}
          ListFooterComponent={chatEndElement}
          ListHeaderComponent={<View style={styles.messagesHeadElement} />}
          contentContainerStyle={{ backgroundColor: "transparent" }}
        />

        <View style={styles.composer}>
          <TextInput
            value={messageText}
            placeholder="Message"
            onChangeText={setMessageText}
            style={styles.composerText}
          />

          <Ionicons.Button
            name="attach"
            style={styles.composerSendBtn}
            onPress={async () => {
              const res = await fileUpload.pickFile();
              console.log(res);
            }}
          />

          <Ionicons.Button
            name="send"
            style={styles.composerSendBtn}
            onPress={() => {
              if (!messageText.trim()) return;
              messages.sendMessage(groupInfo.identifier, messageText.trim());
              setMessageText("");
            }}
          >
            Send
          </Ionicons.Button>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
  },
  messagesHeadElement: {
    height: 24,
    backgroundColor: "transparent",
  },
  composer: {
    flex: 0,
    flexDirection: "row",
    width: "100%",
    padding: 8,
    borderTopColor: "gray",
    borderTopWidth: 0.5,
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
    padding: 8,
    marginBottom: 32,
    marginHorizontal: 48,
    marginTop: 8,
    borderRadius: 8,
    fontSize: 16,
    color: "white",
    backgroundColor: "#1f2c34aa",
  },
});
