import {
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  BoxProps,
  FlexProps,
  useColorMode,
} from "@chakra-ui/react";
import { FiHome, FiSettings } from "react-icons/fi";
import {
  MdOutlineHomeWork,
  MdOutlinePeople,
  MdInfoOutline,
  MdOutlineViewTimeline,
} from "react-icons/md";
import { PiExam, PiBooksLight } from "react-icons/pi";
import { IconType } from "react-icons";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { SideMenuOpenAtom } from "../utils/atoms";

interface LinkItemProps {
  name: string;
  abbr: string;
  icon: IconType;
}
const LinkItems: Array<LinkItemProps> = [
  { name: "Home", abbr: "/", icon: FiHome },
  { name: "Homeworks", abbr: "/homework", icon: MdOutlineHomeWork },
  { name: "Class tests and Exams", abbr: "/exam", icon: PiExam },
  { name: "Members", abbr: "/member", icon: MdOutlinePeople },
  { name: "Subjects", abbr: "/subject", icon: PiBooksLight },
  { name: "Routine", abbr: "/routine", icon: MdOutlineViewTimeline },
  { name: "School Information", abbr: "/school_info", icon: MdInfoOutline },
  { name: "Settings", abbr: "/setting", icon: FiSettings },
];

export default function SideMenu() {
  const [isSideMenuOpen, setSideMenuOpen] = useAtom(SideMenuOpenAtom);
  const onClose = () => {
    setSideMenuOpen(false);
  };

  // Close navbar when navigation happens
  const { pathname, search, state } = useLocation();
  useEffect(onClose, [pathname, search, state]);

  return (
    <Box h="full">
      <SidebarContent
        onClose={onClose}
        display={{ base: "none", lg: "block" }}
      />

      <Drawer
        isOpen={isSideMenuOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} overflow={"auto"} />
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

interface SidebarProps extends BoxProps {
  onClose?: () => void;
}

export const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  return (
    <Box
      {...rest}
      h="full"
      bg={useColorModeValue("gray.100", "gray.900")}
      py={4}
      px={4}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
    >
      <Flex
        alignItems="end"
        mx="4"
        justifyContent="flex-end"
        display={{ base: "flex", lg: "none" }}
      >
        <CloseButton onClick={onClose} />
      </Flex>

      {LinkItems.map((link) => (
        <Link to={link.abbr} key={link.abbr}>
          <NavItem icon={link.icon} abbr={link.abbr}>
            {link.name}
          </NavItem>
        </Link>
      ))}
    </Box>
  );
};

interface NavItemProps extends FlexProps {
  children: string;
  icon: IconType;
  abbr: string;
}
const NavItem = ({ children, icon, abbr, ...rest }: NavItemProps) => {
  const { colorMode } = useColorMode();
  let { pathname } = useLocation();

  return (
    <Box style={{ textDecoration: "none" }} _focus={{ boxShadow: "none" }}>
      <Flex
        align="center"
        p="4"
        my="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={abbr == pathname ? "blue.400" : "transparent"}
        color={
          abbr == pathname ? "black" : colorMode === "dark" ? "white" : "black"
        }
        _hover={{
          bg: "blue.400",
          color: "black",
        }}
        {...rest}
      >
        <Icon
          mr="4"
          fontSize="16"
          _groupHover={{
            color: "black",
          }}
          as={icon}
        />

        {children}
      </Flex>
    </Box>
  );
};
