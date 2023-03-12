import * as Updates from "expo-updates";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export function useUpdates(autoCheck = true) {
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [manifest, setManifest] = useState<Updates.Manifest>();
  const [logs, setLogs] = useState<Updates.UpdatesLogEntry[]>([]);

  const check = useCallback(async () => {
    setIsChecking(true);

    try {
      const logs = await Updates.readLogEntriesAsync();
      setLogs(logs);

      const result = await Updates.checkForUpdateAsync();
      setIsUpdateAvailable(result.isAvailable);
      setManifest(result.manifest);
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Failed to check for updates",
        text2: typeof error?.message === "string" ? error.message : "",
      });

      alert(error?.message);
    }
    setIsChecking(false);
  }, []);

  const update = useCallback(async () => {
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Failed to fetch update",
        text2: typeof error?.message === "string" ? error.message : "",
      });
      alert(error?.message);
    }
  }, []);

  const reload = useCallback(() => Updates.reloadAsync(), []);

  useEffect(() => {
    if (autoCheck) {
      check();
    }
  }, [autoCheck]);

  return {
    Updates,
    isChecking,
    isUpdateAvailable,
    manifest,
    check,
    reload,
    update,
    logs,
  };
}
