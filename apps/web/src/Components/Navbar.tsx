import {
  Box,
  Flex,
  Avatar,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Stack,
  Center,
  Select,
} from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import { useAtom } from "jotai";
import { CurrentUserId } from "../utils/atoms";
import DefaultAvatar from "../assets/images/default-avatar.jpg";
import Logo from "../assets/images/splash.png";

export default function Navbar() {
  const [userId] = useAtom(CurrentUserId);

  const profileQuery = trpc.profile.getUserProfile.useQuery({
    userId: userId!,
  });
  const user = profileQuery.data;
  console.log(user, "userdata");

  const urlQuery = trpc.school.attachment.getFileURL.useQuery(
    {
      file_id: user?.avatar_id!,
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
    { staleTime: 5 * 60 * 1000, enabled: !!user?.avatar_id },
  );

  return (
    <>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <Box>
            <Avatar size={"xl"} src={Logo} />
          </Box>

          <Flex alignItems={"center"}>
            <Stack direction={"row"} spacing={7}>
              <Select placeholder="Select option">
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </Select>
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={"full"}
                  variant={"link"}
                  cursor={"pointer"}
                  minW={0}
                >
                  <Avatar
                    size={"sm"}
                    src={urlQuery.data?.url ?? DefaultAvatar}
                  />
                </MenuButton>
                <MenuList alignItems={"center"}>
                  <br />
                  <Center>
                    <Avatar
                      size={"2xl"}
                      src={urlQuery.data?.url ?? DefaultAvatar}
                    />
                  </Center>
                  <br />
                  <Center>
                    <p>
                      <span>{user?.salutation} </span>
                      {user?.name}
                    </p>
                  </Center>
                  <br />
                  <MenuDivider />
                  <MenuItem>Account Settings</MenuItem> {/* edit details */}
                  <MenuItem>Logout</MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}
