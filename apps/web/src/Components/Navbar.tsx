import {
  Box,
  Flex,
  Avatar,
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
  useColorMode,
} from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import { useAtom, useAtomValue } from "jotai";
import {
  CurrentRoleAtom,
  CurrentUserIdAtom,
  IsLoggedInAtom,
  SessionExpiryAtom,
  SessionTokenAtom,
} from "../utils/atoms";
import DefaultAvatar from "../assets/images/default-avatar.jpg";
import Logo from "../assets/images/splash.png";
import { useMemo } from "react";
import { StaticRole, getUserStaticRoles } from "schooltalk-shared/misc";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

export default function Navbar() {
  const [userId, setUserId] = useAtom(CurrentUserIdAtom);
  const [, setToken] = useAtom(SessionTokenAtom);
  const [, setTokenExpire] = useAtom(SessionExpiryAtom);
  const { colorMode, toggleColorMode } = useColorMode();

  const profileQuery = trpc.profile.getUserProfile.useQuery({
    userId: userId!,
  });
  const user = profileQuery.data;
  const isLoggedIn = useAtomValue(IsLoggedInAtom);
  const [currentUserRole, setCurrentUserRole] = useAtom(CurrentRoleAtom);

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

  const availableRoles = useMemo<StaticRole[]>(
    () => (isLoggedIn ? getUserStaticRoles(user) : []),
    [user, isLoggedIn],
  );

  const handleLogout = () => {
    setToken("");
    setTokenExpire(new Date());
    setCurrentUserRole(StaticRole.none);
    setUserId(null);
  };

  return (
    <>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <Box>
            <Avatar size={"xl"} src={Logo} />
          </Box>

          <Flex alignItems={"center"}>
            <Stack direction={"row"} spacing={7}>
              <Button onClick={toggleColorMode}>
                {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              </Button>
              <Select
                placeholder="Select your role"
                onChange={(e) =>
                  setCurrentUserRole(parseInt(e.target.value, 10))
                }
                value={currentUserRole}
              >
                {availableRoles.map((item) => (
                  <option value={item} key={item}>
                    {StaticRole[item].split("_").join(" ").toUpperCase()}
                  </option>
                ))}
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
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}
