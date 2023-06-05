import { Avatar, type AvatarProps } from "@rneui/themed";
import { trpc } from "../utils/trpc";

type UserAvatarProps = Omit<AvatarProps, "source"> & { fileId: string | null };

export function UserAvatar(props: UserAvatarProps) {
  const urlQuery = trpc.school.attachment.getFileURL.useQuery(
    {
      file_id: props.fileId!,
      via_imagekit: true,
      imagekit_transformations: [
        {
          format: "jpg",
          quality: "10",
          focus: "face",
          height: "360",
          width: "360",
          progressive: "true",
        },
      ],
    },
    { staleTime: 5 * 60 * 1000, enabled: !!props.fileId },
  );

  const uri = urlQuery.data?.url;

  return (
    <Avatar
      {...props}
      source={uri ? { uri } : require("../assets/images/default-avatar.jpg")}
    />
  );
}
