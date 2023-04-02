import * as DocumentPicker from "expo-document-picker";
import { useCallback } from "react";

export function useFileUpload() {
  const pickFile = useCallback(() => {
    return DocumentPicker.getDocumentAsync();
  }, []);

  return { pickFile };
}
