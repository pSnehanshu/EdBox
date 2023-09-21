import { SmallCloseIcon } from "@chakra-ui/icons";
import { Card, Flex, Image, Stack } from "@chakra-ui/react";
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
    <Flex position="relative">
      {mime?.type === "image" ? (
        <Image objectFit="cover" src={task.file.uri} />
      ) : (
        <div>{task.file.name}</div>
      )}
      <SmallCloseIcon
        boxSize={"6"}
        color="red.500"
        position="absolute"
        right="0"
        _hover={{
          color: "red.400",
          cursor: "pointer",
        }}
      />
    </Flex>
  );
}
