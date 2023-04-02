import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useMemo, useState } from "react";
import { Subject } from "rxjs";
import { trpc } from "./trpc";

type DocumentResultSuccess = Extract<
  DocumentPicker.DocumentResult,
  { type: "success" }
>;

type RequestPermissionMutation = ReturnType<
  typeof trpc.school.attachment.requestPermission.useMutation
>;

/**
 * Upload a given file to S3
 * @param fileInfo File result given by Document-Picker
 * @param s3url The s3 URL
 */
function uploadFileToS3(fileInfo: DocumentResultSuccess, s3url: string) {
  const uploadProgressSubject = new Subject<number>();

  const task = FileSystem.createUploadTask(
    s3url,
    fileInfo.uri,
    {
      httpMethod: "PUT",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    },
    (progress) => {
      // Calculate the percentage
      const percentage = Math.ceil(
        (progress.totalByteSent / progress.totalBytesExpectedToSend) * 100,
      );

      // Notify the observer about the value
      uploadProgressSubject.next(percentage);

      // When 100% done, end the subject
      if (percentage >= 100) {
        uploadProgressSubject.complete();
      }
    },
  );

  return {
    progress: uploadProgressSubject,
    start: () =>
      task.uploadAsync().catch((error) => uploadProgressSubject.error(error)),
    cancel: () => task.cancelAsync(),
  };
}

/**
 * Picks a file, fetches permission, and uploads to S3.
 * You must pass in the "Request permission" mutation for it to work.
 * @param requestPermission The Request permission mutation
 */
async function _PickAndUploadFileWithoutTRPC(
  requestPermission: RequestPermissionMutation,
) {
  // Pick the file
  const fileInfo = await DocumentPicker.getDocumentAsync();

  // Make sure user picked a file
  if (fileInfo.type === "cancel") return null;

  // Get permission from backend
  const { signedURL, permission } = await requestPermission.mutateAsync({
    file_name: fileInfo.name,
    size_in_bytes: fileInfo.size,
  });

  // Upload it!
  const res = uploadFileToS3(fileInfo, signedURL);

  // Return the data
  return { ...res, permission, file: fileInfo };
}

type _FileUploadTask = NonNullable<
  Awaited<ReturnType<typeof _PickAndUploadFileWithoutTRPC>>
>;

export type FileUploadTask = _FileUploadTask & {
  uploadResult: Awaited<ReturnType<_FileUploadTask["start"]>>;
  started: boolean;
};

/**
 * This hook provides a useful interface for uploading files
 */
export function useFileUpload() {
  const uploadPermissionMutation =
    trpc.school.attachment.requestPermission.useMutation();

  /** Keeps track of ongoing uploads */
  const [uploadTasksMap, setUploadTasksMap] = useState<
    Record<string, FileUploadTask | undefined>
  >({});

  /** The tasks in array form */
  const uploadTasks = useMemo(
    // Remove the empty tasks, they have been removed
    () => Object.values(uploadTasksMap).filter((t) => !!t) as FileUploadTask[],
    [uploadTasksMap],
  );

  /**
   * Pick and upload the file
   */
  const pickAndUploadFile = useCallback(async (autoStart = true) => {
    // Create a task
    const task = await _PickAndUploadFileWithoutTRPC(uploadPermissionMutation);

    // User cancelled, return
    if (!task) return null;

    // Each task will have its own permission, hence the permission id is effectively the task id
    const taskId = task.permission.id;

    // Record this task
    setUploadTasksMap((t) => ({
      ...t,
      [taskId]: {
        ...task,
        // Because we know the task haven't started yet
        uploadResult: undefined,
        started: false,
      },
    }));

    // Overwrite the `start` method of a task to perform additional tasks
    const start = async () => {
      // Start it
      const res = await task.start();

      // Mark this task as started
      setUploadTasksMap((tasks) => {
        const thisTask = tasks[taskId];
        if (!thisTask) return tasks;

        return {
          ...tasks,
          [taskId]: {
            ...thisTask,
            uploadResult: res,
            started: true,
          },
        };
      });

      return res;
    };

    // Overwrite the `cancel` method of a task to perform additional tasks
    const cancel = async () => {
      // Cancel it
      await task.cancel();

      // Remove it from record
      setUploadTasksMap((tasks) => ({
        ...tasks,
        [taskId]: undefined,
      }));
    };

    // Check if upload should start automatically
    if (autoStart) {
      start();
    }

    // Return the task with overwritten methods
    return { ...task, start, cancel };
  }, []);

  return { pickAndUploadFile, uploadTasks };
}
