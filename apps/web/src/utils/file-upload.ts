import { GenerateFileUploadHook } from "schooltalk-shared/file-upload";
import { trpc } from "./trpc";

export const useFileUpload = GenerateFileUploadHook({
  trpc,
  upload: (s3url, file, onProgress) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", s3url);
    xhr.upload.addEventListener("progress", function (e) {
      const loaded = e.loaded;
      const total = e.total;

      // Update the progress bar
      onProgress({
        totalBytesExpectedToSend: total,
        totalBytesSent: loaded,
      });
    });

    return {
      async uploadAsync() {
        // First, fetch the blob from memory
        const blobRes = await fetch(file.uri);
        if (!blobRes.ok) {
          throw new Error("Failed to retrieve file from blob URL");
        }

        const blob = await blobRes.blob();
        xhr.send(blob);

        return new Promise((resolve, reject) => {
          xhr.onreadystatechange = function () {
            try {
              if (xhr.readyState === this.DONE) {
                // Get the raw header string
                const headers = xhr.getAllResponseHeaders();

                // Convert the header string into an array
                // of individual headers
                const arr = headers.trim().split(/[\r\n]+/);

                // Create a map of header names to values
                const headerMap: Record<string, string> = {};
                arr.forEach((line) => {
                  const parts = line.split(": ");
                  const header = parts.shift();
                  const value = parts.join(": ");

                  if (header) headerMap[header] = value;
                });

                resolve({
                  headers: headerMap,
                  status: xhr.status,
                  mimeType: file.mimeType ?? null,
                  body: xhr.responseText,
                });

                URL.revokeObjectURL(file.uri);
              }
            } catch (error) {
              reject(error);
            }
          };
        });
      },
      async cancelAsync() {
        xhr.abort();
        URL.revokeObjectURL(file.uri);
      },
    };
  },
  pickFile: () => {
    return new Promise((resolve) => {
      // Create an input element programmatically (not added to the DOM)
      const fileInput = document.createElement("input");
      fileInput.type = "file";

      // Add an event listener for the file selection
      fileInput.addEventListener("change", function () {
        const selectedFile = this.files?.[0];

        if (selectedFile) {
          resolve({
            type: "success",
            name: selectedFile.name,
            uri: URL.createObjectURL(selectedFile),
            mimeType: selectedFile.type,
            size: selectedFile.size,
          });
        } else {
          resolve({ type: "cancel" });
        }
      });

      // Simulate a click event to trigger the file selection dialog
      fileInput.click();
    });
  },
  displayError(text) {
    alert(text);
  },
});
