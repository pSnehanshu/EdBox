import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import type { UploadedFile } from "schooltalk-shared/types";
import MIMEType from "whatwg-mimetype";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { trpc } from "../../utils/trpc";
import { Text, View } from "../Themed";
import useColorScheme from "../../utils/useColorScheme";

interface FilePreviewObjectProps {
  file: UploadedFile;
  style?: InnerStyle;
}
function FilePreviewObject({ file, style }: FilePreviewObjectProps) {
  const mime = useMemo(
    () => (file.file_type ? MIMEType.parse(file.file_type) : null),
    [file.file_type],
  );
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";
  const download = useCallback(() => {
    Toast.show({
      type: "error",
      text1: "Download not implemented yet :(",
    });
  }, [file.id]);

  return (
    <View>
      {mime?.type === "image" ? (
        <ImagePreview file={file} style={style?.image} />
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.others,
            style?.others,
            { opacity: pressed ? 0.5 : 1 },
          ]}
          onPress={download}
        >
          <MaterialCommunityIcons
            name="file-outline"
            color={iconColor}
            size={48}
          />
        </Pressable>
      )}

      <View style={styles.control_bar}>
        <View style={styles.control_bar_left}>
          <Text style={styles.file_name}>{file.file_name ?? file.id}</Text>
          {typeof file.size_bytes === "number" && (
            <Text style={styles.file_size}>{file.size_bytes}B</Text>
          )}
        </View>
        <View style={styles.control_bar_right}>
          <Pressable
            style={({ pressed }) => [
              styles.action_btn,
              { opacity: pressed ? 0.5 : 1 },
            ]}
            onPress={download}
          >
            <MaterialIcons name="file-download" size={32} color={iconColor} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

interface ImagePreviewProps {
  file: UploadedFile;
  style?: StyleProp<ImageStyle>;
}
function ImagePreview({ file, style }: ImagePreviewProps) {
  const urlQuery = trpc.school.attachment.getFileURL.useQuery({
    file_id: file.id,
  });

  if (urlQuery.isLoading) return <></>;

  return (
    <Pressable
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <Image
        source={{ uri: urlQuery.data?.url }}
        style={[styles.image, style]}
      />
    </Pressable>
  );
}

interface InnerStyle {
  image?: StyleProp<ImageStyle>;
  others?: StyleProp<ViewStyle>;
}

interface FilePreviewProps {
  fileIdOrObject: string | UploadedFile;
  style?: StyleProp<ViewStyle>;
  innerStyle?: InnerStyle;
}
export function FilePreview({
  fileIdOrObject,
  style,
  innerStyle,
}: FilePreviewProps) {
  const isIdPassed = typeof fileIdOrObject === "string";

  const fileQuery = trpc.school.attachment.fetchFile.useQuery(
    { file: fileIdOrObject },
    { enabled: isIdPassed },
  );

  return (
    <View style={[styles.container, style]}>
      {isIdPassed ? (
        fileQuery.isLoading ? (
          <ActivityIndicator />
        ) : (
          <FilePreviewObject file={fileQuery.data!} style={innerStyle} />
        )
      ) : (
        <FilePreviewObject file={fileIdOrObject} style={innerStyle} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 4,
  },
  image: {
    width: "100%",
    height: 150,
  },
  others: {
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  control_bar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4,
    height: 50,
    borderTopColor: "gray",
    borderTopWidth: 0.5,
  },
  control_bar_left: {
    paddingHorizontal: 8,
  },
  control_bar_right: {},
  file_name: {},
  file_size: {
    fontSize: 10,
  },
  action_btn: {
    height: "100%",
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
