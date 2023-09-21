import { SmallCloseIcon } from "@chakra-ui/icons";
import { Box, Card, Flex, Image, Stack } from "@chakra-ui/react";
import { useMemo, useEffect, useState } from "react";
import { FileUploadTask } from "schooltalk-shared/file-upload";
import { UploadedFile } from "schooltalk-shared/types";
import MIMEType from "whatwg-mimetype";
import { Progress } from "@chakra-ui/react";

interface attachmentFileType {
  file: FileUploadTask;
}

export default function AttachmentsDisplay({ file: task }: attachmentFileType) {
  const [progressPercent, setProgressPercent] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const taskId = task.permission.id;

  const mime = useMemo(
    () => (task.file.mimeType ? MIMEType.parse(task.file.mimeType) : null),
    [task.file.mimeType],
  );

  useEffect(() => {
    const subscription = task.progress.subscribe({
      next(value) {
        setProgressPercent(value);
      },
      error(err) {
        console.error(err);
        setIsError(true);
      },
      complete() {
        setProgressPercent(100);
        setIsComplete(true);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [taskId]);

  return (
    <Flex flexDir="column">
      <Progress
        value={progressPercent}
        colorScheme={isError ? "red.500" : isComplete ? "green" : "blue"}
      />
      <Flex position="relative" flexDir="column">
        {mime?.type === "image" ? (
          <Image objectFit="cover" src={task.file.uri} width="100%" />
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
    </Flex>
  );
}
