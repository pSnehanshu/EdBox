import { Card, Image, Stack } from "@chakra-ui/react";
import { UploadedFile } from "schooltalk-shared/types";
import { trpc } from "../../utils/trpc";

interface attachmentFileType {
  file: UploadedFile;
}

export default function FilePreview({ file }: attachmentFileType) {
  const urlQuery = trpc.school.attachment.getFileURL.useQuery(
    {
      file_id: file.id,
      via_imagekit: true,
      imagekit_transformations: [
        {
          format: "jpg",
          quality: "20",
          height: "400",
          width: "500",
          focus: "auto",
          progressive: "true",
        },
      ],
    },
    { staleTime: 5 * 60 * 1000 },
  );

  if (urlQuery.isLoading) return <></>;

  return (
    <Stack>
      <Image
        boxSize="150px"
        objectFit="cover"
        src={urlQuery.data?.url}
        style={{ width: "100%", minHeight: "100%" }}
      />
    </Stack>
  );
}
