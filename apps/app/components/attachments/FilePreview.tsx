import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
  ImageURISource,
} from "react-native";
import type { UploadedFile } from "schooltalk-shared/types";
import MIMEType from "whatwg-mimetype";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as WebBrowser from "expo-web-browser";
import ImageView from "react-native-image-viewing";
import { parseISO } from "date-fns";
import { trpc } from "../../utils/trpc";
import { Text, View } from "../Themed";
import useColorScheme from "../../utils/useColorScheme";

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
  onPress?: (file: UploadedFile) => void;
}
function FilePreviewObject({ file, style, onPress }: FilePreviewObjectProps) {
  const mime = useMemo(
    () => (file.mime ? MIMEType.parse(file.mime) : null),
    [file.mime],
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
        <ImagePreview file={file} style={style?.image} onPress={onPress} />
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.others,
            style?.others,
            { opacity: pressed ? 0.5 : 1 },
          ]}
          onPress={() => {
            download();
            onPress?.(file);
          }}
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
            <MaterialIcons name="file-download" size={24} color={iconColor} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

interface ImagePreviewProps {
  file: UploadedFile;
  style?: StyleProp<ImageStyle>;
  onPress?: (file: UploadedFile) => void;
}
function ImagePreview({ file, style, onPress }: ImagePreviewProps) {
  const urlQuery = trpc.school.attachment.getFileURL.useQuery(
    {
      file_id: file.id,
      via_imagekit: true,
      imagekit_transformations: [
        {
          format: "jpg",
          quality: "20",
          height: "400",
          width: "500",
          focus: "auto",
          progressive: "true",
        },
      ],
    },
    { staleTime: 5 * 60 * 1000 },
  );

  if (urlQuery.isLoading) return <></>;

  return (
    <Pressable
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
      })}
      onPress={() => onPress?.(file)}
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
  index: number;
  onPress?: (file: UploadedFile, index: number) => void;
}
export function FilePreview({
  fileIdOrObject,
  style,
  innerStyle,
  index,
  onPress,
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
          <FilePreviewObject
            file={fileQuery.data!}
            style={innerStyle}
            onPress={(file) => onPress?.(file, index)}
          />
        )
      ) : (
        <FilePreviewObject
          file={fileIdOrObject}
          style={innerStyle}
          onPress={(file) => onPress?.(file, index)}
        />
      )}
    </View>
  );
}

// FULL-SCREEN Slider

interface FullScreenFilePreviewProps {
  files: Array<string | UploadedFile>;
  visible: boolean;
  onClose?: () => void;
  initialFileId?: string | null;
}
export function FullScreenFilePreview({
  files,
  visible,
  onClose,
  initialFileId,
}: FullScreenFilePreviewProps) {
  const [fileObjects, setFiles] = useState<
    Array<{ file: UploadedFile; src: ImageURISource; rank: number }>
  >([]);

  const handleFileFetched = useCallback(
    (file: UploadedFile, index: number, uri: string, expiry: Date) => {
      setFiles((existingFiles) => {
        // Filter out non-group items
        const groupFiles = existingFiles.filter(
          (f) =>
            files.findIndex((f2) =>
              typeof f2 === "string" ? f2 === f.file.id : f2.id === f.file.id,
            ) >= 0,
        );

        // Check if item already exists
        if (groupFiles.find((f) => f.file.id === file.id)) return groupFiles;

        groupFiles.push({ file, src: { uri }, rank: index });
        return groupFiles;
      });
    },
    [files],
  );

  const sortedFiles = fileObjects.slice().sort((a, b) => a.rank - b.rank);

  const images = sortedFiles.map((file) => file.src);

  const imageIndex = sortedFiles.findIndex(
    (sf) => sf.file.id === initialFileId,
  );

  if (!visible) return null;

  return (
    <>
      {files.map((file, index) => (
        <FileInfoFetcherComp
          fileIdOrObject={file}
          index={index}
          key={typeof file === "string" ? file : file.id}
          onFetched={handleFileFetched}
        />
      ))}

      <ImageView
        images={images}
        imageIndex={imageIndex < 0 ? 0 : imageIndex}
        visible={visible}
        onRequestClose={() => onClose?.()}
        keyExtractor={(src, index) => index.toString()}
      />
    </>
  );
}

interface FileInfoFetcherCompProps {
  fileIdOrObject: string | UploadedFile;
  index: number;
  onFetched: (
    fileObject: UploadedFile,
    index: number,
    uri: string,
    expiry: Date,
  ) => void;
}
function FileInfoFetcherComp({
  fileIdOrObject,
  index,
  onFetched,
}: FileInfoFetcherCompProps) {
  const isIdPassed = typeof fileIdOrObject === "string";
  const fileQuery = trpc.school.attachment.fetchFile.useQuery(
    { file: fileIdOrObject },
    { enabled: isIdPassed },
  );

  const fileObject = isIdPassed ? fileQuery.data : fileIdOrObject;

  const mime = useMemo(
    () => (fileObject?.mime ? MIMEType.parse(fileObject.mime) : null),
    [fileObject],
  );

  const isImage = mime?.type === "image";

  const urlQuery = trpc.school.attachment.getFileURL.useQuery(
    {
      file_id: isIdPassed ? fileIdOrObject : fileIdOrObject.id,
      via_imagekit: isImage,
      imagekit_transformations: [
        {
          format: "jpg",
          quality: "80",
          progressive: "true",
        },
      ],
    },
    { staleTime: 5 * 60 * 1000, enabled: isImage },
  );

  useEffect(() => {
    if (isImage && fileObject && urlQuery.data) {
      onFetched(
        fileObject,
        index,
        urlQuery.data.url,
        parseISO(urlQuery.data.expiry),
      );
    }
  }, [isImage && fileObject && urlQuery.data]);

  return <></>;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 6,
    overflow: "hidden",
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
    overflow: "hidden",
  },
  control_bar_left: {
    paddingHorizontal: 8,
    flex: 85,
  },
  control_bar_right: {
    flex: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  file_name: {
    fontSize: 12,
  },
  file_size: {
    fontSize: 10,
    opacity: 0.8,
  },
  action_btn: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
