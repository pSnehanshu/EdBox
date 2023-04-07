import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useMemo, useState } from "react";
import { Subject } from "rxjs";
import type { UploadPermission } from "schooltalk-shared/types";
import { trpc } from "./trpc";

/**
 * Upload a given file to S3
 * @param fileURI File path
 * @param s3url The s3 URL
 */
function uploadFileToS3(fileURI: string, s3url: string) {
  const uploadProgressSubject = new Subject<number>();

  const task = FileSystem.createUploadTask(
    s3url,
    fileURI,
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
      task.uploadAsync().catch((error) => {
        uploadProgressSubject.error(error);
        return undefined;
      }),
    cancel: () => task.cancelAsync(),
  };
}

interface File {
  name: string;
  size?: number;
  mimeType?: string;
  uri: string;
}

export interface FileUploadTask {
  progress: Subject<number>;
  start: () => Promise<FileSystem.FileSystemUploadResult | undefined>;
  cancel: () => Promise<void>;
  permission: UploadPermission;
  file: File;
  uploadResult?: FileSystem.FileSystemUploadResult;
  started: boolean;
}

/**
 * This hook provides a useful interface for uploading files
 */
export function useFileUpload() {
  const uploadPermissionMutation =
    trpc.school.attachment.requestPermission.useMutation();
  const cancelPermission =
    trpc.school.attachment.cancelPermission.useMutation();

  /** Keeps track of ongoing uploads */
  const [uploadTasksMap, setUploadTasksMap] = useState<
    Record<string, FileUploadTask | undefined>
  >({});

  /** Tracks count of uploads complete */
  const [totalDone, setTotalDone] = useState(0);

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
    // Pick the file
    const fileInfo = await DocumentPicker.getDocumentAsync();

    // Make sure user picked a file
    if (fileInfo.type === "cancel") return;

    // Get permission from backend
    const { signedURL, permission } =
      await uploadPermissionMutation.mutateAsync({
        file_name: fileInfo.name,
        size_in_bytes: fileInfo.size,
      });

    // Upload it!
    const res = uploadFileToS3(fileInfo.uri, signedURL);

    const task: FileUploadTask = {
      ...res,
      permission,
      file: {
        name: fileInfo.name,
        size: fileInfo.size,
        mimeType: fileInfo.mimeType,
        uri: fileInfo.uri,
      },
      started: false,
    };

    task.progress.subscribe({
      complete() {
        setTotalDone((v) => v + 1);
      },
      error(err) {
        console.error(err);

        // Remove after a while
        setTimeout(() => {
          cancel();
        }, 2000);
      },
    });

    // Each task will have its own permission, hence the permission id is effectively the task id
    const taskId = task.permission.id;

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

      // Cancel the permission
      await cancelPermission
        .mutateAsync({ permission_id: task.permission.id })
        .catch((err) => {
          // We will ignore this error
          console.warn(err);
        });

      // Remove it from record
      setUploadTasksMap((tasks) => ({
        ...tasks,
        [taskId]: undefined,
      }));
    };

    // Record this task
    setUploadTasksMap((t) => ({
      ...t,
      [taskId]: {
        ...task,
        start,
        cancel,
        // Because we know the task haven't started yet
        uploadResult: undefined,
        started: false,
      },
    }));

    // Check if upload should start automatically
    if (autoStart) {
      start();
    }
  }, []);

  return {
    pickAndUploadFile,
    uploadTasks,
    allDone: totalDone >= uploadTasks.length,
  };
}
