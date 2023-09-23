import { useCallback, useEffect, useMemo, useState } from "react";
import MIMEType from "whatwg-mimetype";
import { LinearProgress } from "@rneui/themed";
import * as Haptics from "expo-haptics";
import { type FileUploadTask } from "schooltalk-shared/file-upload";
import { Alert, Image, Pressable, StyleSheet } from "react-native";
import useColorScheme from "../../utils/useColorScheme";
import { Text, View } from "../Themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface PendingAttachmentProps {
  uploadTask: FileUploadTask;
}
export function PendingAttachment({
  uploadTask: task,
}: PendingAttachmentProps) {
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
        setProgressPercent(100);
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
      <View key={task.permission.id} style={styles.item}>
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
          <View style={styles.file}>
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
    height: 120,
    flexDirection: "row",
    marginHorizontal: 4,
    backgroundColor: "transparent",
    paddingTop: 2,
  },
  item: {
    width: 200,
    height: 100,
    marginRight: 4,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 16,
    overflow: "hidden",
  },
  file: {
    padding: 8,
    paddingBottom: 16,
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
  },
});
