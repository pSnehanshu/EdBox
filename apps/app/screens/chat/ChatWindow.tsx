import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState, useCallback, memo } from "react";
import {
  Alert,
  ActivityIndicator,
  Button,
  StyleSheet,
  ImageBackground,
  Pressable,
  Image,
} from "react-native";
import type { ListRenderItem } from "@shopify/flash-list";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import MIMEType from "whatwg-mimetype";
import { LinearProgress } from "@rneui/themed";
import {
  List,
  ScrollView,
  Text,
  TextInput,
  View,
} from "../../components/Themed";
import { RootStackParamList } from "../../utils/types/common";
import ChatMessage from "../../components/ChatMessage";
import { useMessages } from "../../utils/messages-repository";
import { Message } from "schooltalk-shared/types";
import { useGroupInfo } from "../../utils/groups";
import { FileUploadTask, useFileUpload } from "../../utils/file-upload";
import useColorScheme from "../../utils/useColorScheme";

const renderItem: ListRenderItem<Message> = ({ item }) => (
  <ChatMessage message={item} />
);

export default function ChatWindowScreen({
  route: { params: groupInfo },
  navigation,
}: NativeStackScreenProps<RootStackParamList, "ChatWindow">) {
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

  const handleMsgSend = useCallback(
    (msg: string) => messages.sendMessage(groupInfo.identifier, msg),
    [groupInfo.identifier, messages.sendMessage],
  );

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

        <MsgComposer onSend={handleMsgSend} />
      </ImageBackground>
    </View>
  );
}

interface MsgComposerProps {
  onSend: (msg: string) => void;
}
const _MsgComposer = ({ onSend }: MsgComposerProps) => {
  const [messageText, setMessageText] = useState("");
  const fileUpload = useFileUpload();
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";

  return (
    <>
      {fileUpload.uploadTasks.length > 0 && (
        <View style={styles.pending_attachments_container}>
          <ScrollView horizontal style={{ backgroundColor: "transparent" }}>
            {fileUpload.uploadTasks.map((task) => (
              <PendingAttachment uploadTask={task} key={task.permission.id} />
            ))}
          </ScrollView>
        </View>
      )}

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
              if (!fileUpload.allDone) {
                return alert("Please wait for all uploads to complete");
              }

              if (!messageText.trim()) return;

              onSend(messageText.trim());
              setMessageText("");

              // Vibrate!
              Haptics.impactAsync();
            }}
          >
            <Ionicons name="send" color={iconColor} size={32} />
          </Pressable>
        </View>
      </View>
    </>
  );
};
const MsgComposer = memo(_MsgComposer);

interface PendingAttachmentProps {
  uploadTask: FileUploadTask;
}
function PendingAttachment({ uploadTask: task }: PendingAttachmentProps) {
  const taskId = task.permission.id;
  const [progressPercent, setProgressPercent] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const subscription = task.progress.subscribe({
      next(value) {
        setProgressPercent(value);
      },
      error(err) {
        console.error(err);
        setIsError(true);
      },
      complete() {
        setIsComplete(true);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [taskId]);

  const cancelFile = useCallback(async () => {
    await Haptics.selectionAsync();

    Alert.alert("Remove this file", "Do you want to remove this file?", [
      {
        text: "Remove",
        style: "destructive",
        onPress() {
          task.cancel();
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  }, [taskId]);

  const mime = useMemo(
    () => (task.file.mimeType ? MIMEType.parse(task.file.mimeType) : null),
    [task.file.mimeType],
  );
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";

  return (
    <Pressable onLongPress={cancelFile}>
      <View key={task.permission.id} style={styles.pending_attachment_item}>
        <LinearProgress
          animation={false}
          value={progressPercent / 100}
          variant="determinate"
          color={isError ? "red" : isComplete ? "green" : "blue"}
          trackColor={isError ? "red" : "white"}
        />

        {mime?.type === "image" ? (
          <Image
            source={{ uri: task.file.uri }}
            style={{ width: "100%", minHeight: "100%" }}
          />
        ) : (
          <View style={styles.pending_attachments_file}>
            <MaterialCommunityIcons
              name="file-outline"
              color={iconColor}
              size={48}
            />
            <Text style={{ fontSize: 10 }}>{task.file.name}</Text>
          </View>
        )}
      </View>
    </Pressable>
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
  pending_attachments_container: {
    height: 120,
    flexDirection: "row",
    marginHorizontal: 4,
    backgroundColor: "transparent",
    paddingTop: 2,
  },
  pending_attachment_item: {
    width: 200,
    height: 100,
    marginRight: 4,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 16,
    opacity: 0.8,
    overflow: "hidden",
  },
  pending_attachments_file: {
    padding: 8,
    paddingBottom: 16,
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
  },
});
