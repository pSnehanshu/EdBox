import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
  BoxProps,
  FlexProps,
  useColorMode,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
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
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Close navbar when navigation happens
  const { pathname, search, state } = useLocation();
  useEffect(onClose, [pathname, search, state]);

  return (
    <Box minH="100vh" position="relative">
      <SidebarContent
        onClose={() => onClose}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <MobileNav display={{ base: "flex", md: "none" }} onOpen={onOpen} />
    </Box>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

export const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  return (
    <Box
      bg={useColorModeValue("gray.100", "gray.900")}
      pt={4}
      px={4}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: "72" }}
      h="full"
      {...rest}
      mt={{ base: 0, md: 16 }}
      pos="fixed"
    >
      <Flex alignItems="end" mx="4" justifyContent="flex-end">
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <Link to={link.abbr} key={link.name}>
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
    <Box
      as="a"
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
    >
      <Flex
        align="center"
        p="4"
        my="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        // "home" => current state
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

interface MobileProps extends FlexProps {
  onOpen: () => void;
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  return (
    <Flex
      position="fixed"
      zIndex={11}
      top="-2"
      right="0"
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      justifyContent="flex-start"
      {...rest}
    >
      <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<HamburgerIcon />}
      />
    </Flex>
  );
};
