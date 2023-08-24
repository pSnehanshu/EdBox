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
  useToast,
  Center,
  Select,
  useColorMode,
  Image,
  Stack,
  ToastId,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { trpc } from "../utils/trpc";
import { useAtom } from "jotai";
import {
  useConfig,
  useConfigUpdate,
  useCurrentUser,
  SessionExpiryAtom,
} from "../utils/atoms";
import DefaultAvatar from "../assets/images/default-avatar.jpg";
import Logo from "../assets/images/edbox-logo.png";
import { useMemo, useRef } from "react";
import { StaticRole, getUserStaticRoles } from "schooltalk-shared/misc";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

export default function Navbar() {
  const { isLoggedIn, user } = useCurrentUser();
  const [, setTokenExpire] = useAtom(SessionExpiryAtom);
  const { colorMode, toggleColorMode } = useColorMode();

  const { activeStaticRole: currentUserRole } = useConfig();
  const setConfig = useConfigUpdate();
  const setCurrentUserRole = (role: StaticRole) =>
    setConfig({ activeStaticRole: role });

  const toast = useToast();
  const toastIdRef = useRef<ToastId>();

  const trpcUtils = trpc.useContext();

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

  const logoutMutation = trpc.auth.logout.useMutation({
    onMutate() {
      toastIdRef.current = toast({
        title: "Logging out...",
        status: "loading",
        duration: null,
      });
    },
    onError(error) {
      console.error(error);
    },
    onSettled() {
      localStorage.setItem("token", "");
      setTokenExpire(new Date(0));
      setCurrentUserRole(StaticRole.none);

      trpcUtils.profile.me.refetch().finally(() => {
        if (typeof toastIdRef.current !== "undefined")
          toast.update(toastIdRef.current, { duration: 0 });
      });
    },
  });

  const availableRoles = useMemo<StaticRole[]>(
    () => (isLoggedIn ? getUserStaticRoles(user) : []),
    [user, isLoggedIn],
  );

  const { pathname } = useLocation();

  return (
    <Flex
      h={16}
      alignItems={"center"}
      justifyContent={"space-between"}
      bg={useColorModeValue("gray.100", "gray.800")}
      px={8}
      borderBottom="1px"
      borderColor="gray.200"
    >
      <Box h="full" p="2">
        <Link to="/">
          <Image src={Logo} maxH="full" />
        </Link>
      </Box>

      <Stack direction={"row"} gap="4">
        <Button onClick={toggleColorMode}>
          {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        </Button>

        {isLoggedIn ? (
          <>
            <Select
              placeholder="Select your role"
              onChange={(e) => setCurrentUserRole(parseInt(e.target.value, 10))}
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
                <Avatar size={"sm"} src={urlQuery.data?.url ?? DefaultAvatar} />
              </MenuButton>

              <MenuList alignItems={"center"}>
                <Center>
                  <Avatar
                    size={"2xl"}
                    src={urlQuery.data?.url ?? DefaultAvatar}
                  />
                </Center>
                <Center my="2">
                  {user?.salutation && user.salutation !== "None"
                    ? user.salutation
                    : ""}{" "}
                  {user?.name}
                </Center>
                <MenuDivider />
                <MenuItem>Account Settings</MenuItem> {/* edit details */}
                <MenuItem onClick={() => logoutMutation.mutate({})}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </>
        ) : (
          pathname !== "/login" && (
            <Button as={Link} to="/login">
              Login to EdBox
            </Button>
          )
        )}
      </Stack>
    </Flex>
  );
}
