import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  ImageBackground,
  Pressable,
} from "react-native";
import type { ListRenderItem } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { List, Text, TextInput, View } from "../../components/Themed";
import { RootStackParamList } from "../../utils/types/common";
import ChatMessage from "../../components/ChatMessage";
import { useMessages } from "../../utils/messages-repository";
import { Message } from "schooltalk-shared/types";
import { useGroupInfo } from "../../utils/groups";
import { useFileUpload } from "../../utils/file-upload";
import useColorScheme from "../../utils/useColorScheme";

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

  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";

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
            multiline
            onChangeText={setMessageText}
            style={styles.composerText}
          />

          <View style={styles.composer_actions}>
            <Pressable
              onPress={() => fileUpload.pickAndUploadFile()}
              style={({ pressed }) => [
                styles.attach_btn,
                { opacity: pressed ? 0.5 : 1 },
              ]}
            >
              <Ionicons name="attach" color={iconColor} size={32} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.composerSendBtn,
                { opacity: pressed ? 0.5 : 1 },
              ]}
              onPress={() => {
                if (!messageText.trim()) return;
                messages.sendMessage(groupInfo.identifier, messageText.trim());
                setMessageText("");
              }}
            >
              <Ionicons name="send" color={iconColor} size={32} />
            </Pressable>
          </View>
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
    borderTopColor: "gray",
    borderTopWidth: 0.5,
    alignItems: "center",
    justifyContent: "space-between",
    maxHeight: 100,
    margin: 4,
    borderRadius: 16,
    overflow: "hidden",
    opacity: 0.9,
  },
  composerText: {
    flexGrow: 1,
    padding: 2,
    paddingLeft: 16,
    backgroundColor: "transparent",
    maxWidth: "70%",
  },
  composer_actions: {
    flexDirection: "row",
    padding: 8,
    maxHeight: 50,
    backgroundColor: "transparent",
  },
  composerSendBtn: {
    marginLeft: 8,
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
  attach_btn: {},
});
