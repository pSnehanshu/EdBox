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
  useColorMode,
} from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import { useAtom, useAtomValue } from "jotai";
import { CurrentRole, CurrentUserId, IsLoggedInAtom } from "../utils/atoms";
import DefaultAvatar from "../assets/images/default-avatar.jpg";
import Logo from "../assets/images/splash.png";
import { useMemo } from "react";
import { StaticRole } from "schooltalk-shared/misc";

export default function Navbar() {
  const [userId] = useAtom(CurrentUserId);

  const profileQuery = trpc.profile.getUserProfile.useQuery({
    userId: userId!,
  });
  const user = profileQuery.data;
  const isLoggedIn = useAtomValue(IsLoggedInAtom);
  const [currentUserRole, setCurrentUserRole] = useAtom(CurrentRole);

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

  const availableRoles = useMemo<StaticRole[]>(() => {
    if (!isLoggedIn) return [];
    const roles: StaticRole[] = [];
    if (user?.Teacher?.id) roles.push(StaticRole.teacher);
    if (user?.Student?.id) roles.push(StaticRole.student);
    if (user?.Parent?.id) roles.push(StaticRole.parent);
    if (user?.Staff?.role === "principal") roles.push(StaticRole.principal);
    if (user?.Staff?.role === "vice_principal")
      roles.push(StaticRole.vice_principal);
    if (user?.Staff?.role === "others") roles.push(StaticRole.staff);

    return roles;
  }, [user]);

  const handleChangeRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    setCurrentUserRole(StaticRole[role as keyof typeof StaticRole]);
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
              <Select
                placeholder="Select your role"
                onChange={handleChangeRole}
              >
                {availableRoles &&
                  availableRoles?.map((item) => (
                    <option value={StaticRole[item]} key={item}>
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
