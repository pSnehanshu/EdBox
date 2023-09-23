import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { trpc } from "./trpc";
import { GenerateFileUploadHook } from "schooltalk-shared/file-upload";

/**
 * This hook provides a useful interface for uploading files
 */
export const useFileUpload = GenerateFileUploadHook({
  trpc,
  upload: (s3url, file, onProgress) =>
    FileSystem.createUploadTask(
      s3url,
      file.uri,
      {
        httpMethod: "PUT",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          "Content-Type": file.mimeType ?? "application/octet-stream",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(
            file.name ?? "",
          )}"`,
        },
      },
      onProgress,
    ),
  pickFile: DocumentPicker.getDocumentAsync,
  ImagePicker,
  displayError(text) {
    Toast.show({
      type: "error",
      text1: text,
    });
  },
});
