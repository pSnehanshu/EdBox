import { memo, useCallback, useMemo } from "react";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { atom, useAtom } from "jotai";
import { useFileUpload } from "../utils/file-upload";
import useColorScheme from "../utils/useColorScheme";
import { List, TextInput, View } from "./Themed";
import { PendingAttachment } from "./attachments/PendingAttachment";
import { IComposerContent } from "../utils/types/common";

const _demoAtom = atom<IComposerContent>({
  groupId: "",
  body: "",
});
const ComposerStateAtoms = new Map<string, typeof _demoAtom>();

function useComposerState(groupId: string) {
  // The Atom
  const stateAtom = useMemo(() => {
    let a = ComposerStateAtoms.get(groupId);
    if (!a) {
      a = atom<IComposerContent>({
        groupId,
        body: "",
      });
      ComposerStateAtoms.set(groupId, a);
    }

    return a;
  }, [groupId]);

  // Body
  const [state, setState] = useAtom(stateAtom);
  const setBody = useCallback<
    (body: string | ((oldBody: string) => string)) => void
  >(
    (arg) =>
      setState((old) => ({
        ...old,
        body: typeof arg === "string" ? arg : arg(old.body),
      })),
    [setState],
  );

  // Files
  const fileUploadHandler = useFileUpload(); // TODO: Prefill uploaded files

  // Reset
  const reset = useCallback(() => {
    setBody("");
    fileUploadHandler.removeAll();
  }, [setBody, fileUploadHandler.removeAll]);

  // Return the stuff
  return { body: [state.body, setBody] as const, fileUploadHandler, reset };
}

interface MsgComposerProps {
  groupId: string;
}
const _MsgComposer = ({ groupId }: MsgComposerProps) => {
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";

  // The state
  const {
    body: [messageText, setMessageText],
    fileUploadHandler,
    reset,
  } = useComposerState(groupId);

  const handleSend = useCallback(() => {
    if (!fileUploadHandler.allDone) {
      return alert("Please wait for all uploads to complete");
    }

    if (!messageText.trim() && fileUploadHandler.uploadTasks.length < 1) return;

    // TODO: Send to Composer$
    // onSend(
    //   messageText.trim(),
    //   fileUploadHandler.uploadTasks.map((t) => ({
    //     permission_id: t.permission.id,
    //     file_name: t.file.name,
    //   })),
    // );

    reset();

    // Vibrate!
    Haptics.impactAsync();
  }, []);

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
            onPress={handleSend}
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
