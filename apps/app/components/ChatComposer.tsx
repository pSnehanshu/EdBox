import { memo, useState } from "react";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import type { FilePermissionsInput } from "schooltalk-shared/misc";
import { useFileUpload } from "../utils/file-upload";
import useColorScheme from "../utils/useColorScheme";
import { List, TextInput, View } from "./Themed";
import { PendingAttachment } from "./attachments/PendingAttachment";

interface MsgComposerProps {
  onSend: (msg: string, files?: FilePermissionsInput[]) => void;
  fileUploadHandler: ReturnType<typeof useFileUpload>;
}
const _MsgComposer = ({ onSend, fileUploadHandler }: MsgComposerProps) => {
  const [messageText, setMessageText] = useState("");
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";

  return (
    <View style={styles.container}>
      {fileUploadHandler.uploadTasks.length > 0 && (
        <List
          horizontal
          estimatedItemSize={200}
          data={fileUploadHandler.uploadTasks}
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
            onPress={() => fileUploadHandler.pickAndUploadFile()}
            style={({ pressed }) => [
              styles.attach_btn,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <MaterialIcons name="attach-file" color={iconColor} size={24} />
          </Pressable>

          <Pressable
            onPress={() => fileUploadHandler.pickAndUploadMediaLib()}
            style={({ pressed }) => [
              styles.attach_btn,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <MaterialIcons
              name={
                fileUploadHandler.mediaPermissionStatus?.status === "denied"
                  ? "image-not-supported"
                  : "image"
              }
              color={iconColor}
              size={24}
            />
          </Pressable>

          <Pressable
            onPress={() => fileUploadHandler.pickAndUploadCamera()}
            style={({ pressed }) => [
              styles.attach_btn,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <MaterialCommunityIcons
              name={
                fileUploadHandler.cameraPermissionStatus?.status === "denied"
                  ? "camera-off-outline"
                  : "camera-outline"
              }
              color={iconColor}
              size={24}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.composerSendBtn,
              { opacity: pressed ? 0.5 : 1 },
            ]}
            onPress={() => {
              if (!fileUploadHandler.allDone) {
                return alert("Please wait for all uploads to complete");
              }

              if (
                !messageText.trim() &&
                fileUploadHandler.uploadTasks.length < 1
              )
                return;

              onSend(
                messageText.trim(),
                fileUploadHandler.uploadTasks.map((t) => ({
                  permission_id: t.permission.id,
                  file_name: t.file.name,
                })),
              );
              fileUploadHandler.removeAll();

              setMessageText("");

              // Vibrate!
              Haptics.impactAsync();
            }}
          >
            <MaterialIcons name="send" color={iconColor} size={32} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export const MsgComposer = memo(_MsgComposer);

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
    maxWidth: "60%",
  },
  composer_actions: {
    flexDirection: "row",
    padding: 8,
    maxHeight: 50,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  composerSendBtn: {
    marginLeft: 8,
  },
  attach_btn: {
    marginRight: 4,
  },
  pending_attachments_list: {
    backgroundColor: "transparent",
  },
});
