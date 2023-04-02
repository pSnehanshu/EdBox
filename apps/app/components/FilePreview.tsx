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
import * as WebBrowser from "expo-web-browser";
import { trpc } from "../utils/trpc";
import { Text, View } from "./Themed";
import useColorScheme from "../utils/useColorScheme";

/**
 * Format bytes as human-readable text. Taken from https://stackoverflow.com/a/14919494/9990365
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

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
  const humanFriendlySize = useMemo(
    () =>
      typeof file.size_bytes === "number"
        ? humanFileSize(file.size_bytes, true)
        : "N/A",
    [file.size_bytes],
  );

  const utils = trpc.useContext();

  const download = useCallback(async () => {
    try {
      const { url } = await utils.school.attachment.getFileURL.fetch({
        file_id: file.id,
      });

      // Pass the URL to browser to download it
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Download failed",
        text2: (error as any)?.message,
      });
    }
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
          <Text style={styles.file_size}>{humanFriendlySize}</Text>
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
