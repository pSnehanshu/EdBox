import { useCallback, useMemo, useState } from "react";
import { Subject } from "rxjs";
import type { TrpcReactType } from "../../apps/app/utils/trpc";
import type { UploadPermission } from "./types";
import type { ImagePickerAsset } from "expo-image-picker";

type ImagePickerType = typeof import("expo-image-picker");

type FileSystemUploadResult = {
  /**
   * An object containing all the HTTP response header fields and their values for the download network request.
   * The keys and values of the object are the header names and values respectively.
   */
  headers: Record<string, string>;
  /**
   * The HTTP response status code for the download network request.
   */
  status: number;
  // @docsMissing
  mimeType: string | null;

  /**
   * The body of the server response.
   */
  body: string;
};

interface File {
  name?: string;
  size?: number;
  mimeType?: string;
  uri: string;
}

export interface FileUploadTask {
  progress: Subject<number>;
  start: () => Promise<FileSystemUploadResult | undefined>;
  cancel: () => Promise<void>;
  permission: UploadPermission;
  file: File;
  uploadResult?: FileSystemUploadResult;
  started: boolean;
}

type FilePickerResponse =
  | { type: "cancel" }
  | {
      type: "success";
      name: string;
      /** Size in bytes */
      size?: number;
      mimeType?: string;
      uri: string;
    };

type Uploader = {
  uploadAsync: () => Promise<FileSystemUploadResult | undefined>;
  cancelAsync: () => Promise<void>;
};

type UploadProgressData = {
  totalBytesSent: number;
  totalBytesExpectedToSend: number;
};

type ProgressHandler = (progress: UploadProgressData) => void;

type FileUploadHookParams = {
  trpc: TrpcReactType;
  upload: (url: string, file: File, onProgress: ProgressHandler) => Uploader;
  pickFile: () => Promise<FilePickerResponse>;
  /** The expo-image-picker module, only for expo */
  ImagePicker?: ImagePickerType;
  displayError?: (text: string) => void;
};

export function GenerateFileUploadHook({
  trpc,
  pickFile,
  upload,
  ImagePicker,
  displayError,
}: FileUploadHookParams) {
  /**
   * Upload a given file to S3
   * @param fileURI File path
   * @param s3url The s3 URL
   */
  const uploadFileToS3 = (file: File, s3url: string) => {
    const uploadProgress$ = new Subject<number>();

    const task = upload(s3url, file, (progress) => {
      // Calculate the percentage
      const percentage = Math.ceil(
        (progress.totalBytesSent / progress.totalBytesExpectedToSend) * 100,
      );

      // Notify the observer about the value
      uploadProgress$.next(percentage);

      // When 100% done, end the subject
      if (percentage >= 100) {
        uploadProgress$.complete();
      }
    });

    return {
      progress: uploadProgress$,
      start: () =>
        task.uploadAsync().catch((error) => {
          uploadProgress$.error(error);
          return undefined;
        }),
      cancel: () => task.cancelAsync(),
    };
  };

  return () => {
    const uploadPermissionMutation =
      trpc.school.attachment.requestPermission.useMutation();
    const cancelPermission =
      trpc.school.attachment.cancelPermission.useMutation();

    // Permissions
    const [cameraPermissionStatus] =
      ImagePicker?.useCameraPermissions({
        get: true,
        request: false,
      }) ?? [];

    const [mediaPermissionStatus] =
      ImagePicker?.useMediaLibraryPermissions({
        get: true,
        request: false,
      }) ?? [];

    /** Keeps track of ongoing uploads */
    const [uploadTasksMap, setUploadTasksMap] = useState<
      Record<string, FileUploadTask | undefined>
    >({});

    /** Tracks count of uploads complete */
    const [totalDone, setTotalDone] = useState(0);

    /** The tasks in array form */
    const uploadTasks = useMemo(
      // Remove the empty tasks, they have been removed
      () =>
        Object.values(uploadTasksMap).filter((t) => !!t) as FileUploadTask[],
      [uploadTasksMap],
    );

    const consumeTask = useCallback(
      (task: FileUploadTask, autoStart: boolean) => {
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
      },
      [],
    );

    /**
     * Pick and upload the file
     */
    const pickAndUploadFile = useCallback(async (autoStart = true) => {
      // Pick the file
      const fileInfo = await pickFile();

      // Make sure user picked a file
      if (fileInfo.type === "cancel") return;

      // Get permission from backend
      const { signedURL, permission } =
        await uploadPermissionMutation.mutateAsync({
          file_name: fileInfo.name,
          size_in_bytes: fileInfo.size,
          mime: fileInfo.mimeType,
        });

      // Upload it!
      const res = uploadFileToS3(fileInfo, signedURL);

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

      consumeTask(task, autoStart);
    }, []);

    const uploadMediaAssets = useCallback(
      async (assets: ImagePickerAsset[], autoStart: boolean) => {
        await Promise.allSettled(
          assets.map(async (asset) => {
            // Get permission from backend
            const { signedURL, permission } =
              await uploadPermissionMutation.mutateAsync({
                file_name: asset.fileName ?? undefined,
                size_in_bytes: asset.fileSize,
              });

            const file: File = {
              name: asset.fileName ?? `media-${Date.now()}.jpg`,
              size: asset.fileSize,
              mimeType: `${asset.type}/*`,
              uri: asset.uri,
            };

            // Upload it!
            const res = uploadFileToS3(file, signedURL);

            const task: FileUploadTask = {
              ...res,
              file,
              permission,
              started: false,
            };

            consumeTask(task, autoStart);
          }),
        );
      },
      [],
    );

    const pickAndUploadMediaLib = useCallback(async (autoStart = true) => {
      if (!ImagePicker)
        throw new Error("This environment does not support ImagePicker");

      const { granted } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (granted) {
        // Do stuff
        const { canceled, assets } =
          await ImagePicker.launchImageLibraryAsync();
        if (canceled) return;

        await uploadMediaAssets(assets, autoStart);
      } else {
        displayError?.("Media library permission denied!");
      }
    }, []);

    const pickAndUploadCamera = useCallback(async (autoStart = true) => {
      if (!ImagePicker)
        throw new Error("This environment does not support ImagePicker");

      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (granted) {
        // Do stuff
        const { canceled, assets } = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          exif: false,
        });
        if (canceled) return;

        await uploadMediaAssets(assets, autoStart);
      } else {
        displayError?.("Camera permission denied!");
      }
    }, []);

    const removeAll = useCallback(() => {
      setUploadTasksMap({});
    }, []);

    return {
      pickAndUploadFile,
      pickAndUploadMediaLib,
      pickAndUploadCamera,
      uploadTasks,
      allDone: totalDone >= uploadTasks.length,
      cameraPermissionStatus,
      mediaPermissionStatus,
      removeAll,
    };
  };
}
