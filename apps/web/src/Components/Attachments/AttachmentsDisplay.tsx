import { Card, Image, Stack } from "@chakra-ui/react";
import { useMemo } from "react";
import { FileUploadTask } from "schooltalk-shared/file-upload";
import { UploadedFile } from "schooltalk-shared/types";
import MIMEType from "whatwg-mimetype";

interface attachmentFileType {
  file: FileUploadTask;
}

export default function AttachmentsDisplay({ file: task }: attachmentFileType) {
  const mime = useMemo(
    () => (task.file.mimeType ? MIMEType.parse(task.file.mimeType) : null),
    [task.file.mimeType],
  );

  return (
    <Stack>
      {mime?.type === "image" ? (
        <Image objectFit="cover" src={task.file.uri} />
      ) : (
        <div>{task.file.name}</div>
      )}
    </Stack>
  );
}
