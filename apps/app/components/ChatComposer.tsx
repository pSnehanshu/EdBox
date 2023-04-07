import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import MIMEType from "whatwg-mimetype";
import { FileUploadTask, useFileUpload } from "../utils/file-upload";
import useColorScheme from "../utils/useColorScheme";
import { List, Text, TextInput, View } from "./Themed";
import { LinearProgress } from "@rneui/themed";

interface MsgComposerProps {
  onSend: (msg: string) => void;
}
const _MsgComposer = ({ onSend }: MsgComposerProps) => {
  const [messageText, setMessageText] = useState("");
  const fileUpload = useFileUpload();
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";

  return (
    <View style={styles.container}>
      {fileUpload.uploadTasks.length > 0 && (
        <List
          horizontal
          estimatedItemSize={200}
          data={fileUpload.uploadTasks}
          contentContainerStyle={styles.pending_attachments_list}
          renderItem={({ item }) => <PendingAttachment uploadTask={item} />}
        />
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
    </View>
  );
};

export const MsgComposer = memo(_MsgComposer);

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
  container: {
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
  attach_btn: {},
  pending_attachments_list: {
    backgroundColor: "transparent",
  },
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
