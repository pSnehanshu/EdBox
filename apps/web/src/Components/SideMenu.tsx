import React, { ReactNode } from "react";
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Text,
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

interface LinkItemProps {
  name: string;
  abbr: string;
  icon: IconType;
}
const LinkItems: Array<LinkItemProps> = [
  { name: "Home", abbr: "home", icon: FiHome },
  { name: "Homeworks", abbr: "homework", icon: MdOutlineHomeWork },
  { name: "Class tests and Exams", abbr: "exam", icon: PiExam },
  { name: "Members", abbr: "member", icon: MdOutlinePeople },
  { name: "Subjects", abbr: "subject", icon: PiBooksLight },
  { name: "Routine", abbr: "routine", icon: MdOutlineViewTimeline },
  { name: "School Information", abbr: "school_info", icon: MdInfoOutline },
  { name: "Settings", abbr: "setting", icon: FiSettings },
];

export default function SideMenu() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box
      minH="100vh"
      bg={useColorModeValue("gray.100", "gray.900")}
      position="relative"
    >
      <SidebarContent
        onClose={() => onClose}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        isOpen={isOpen}
        placement="right"
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
      <Box ml={{ base: 0, md: 72 }} p="4">
        {/* Content */}
        <h1>apple</h1>
      </Box>
    </Box>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  return (
    <Box
      bg={useColorModeValue("gray.100", "gray.900")}
      pt={4}
      px={4}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: "72" }}
      pos="absolute"
      h="full"
      {...rest}
    >
      <Flex alignItems="end" mx="8" justifyContent="flex-end">
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} abbr={link.abbr}>
          {link.name}
        </NavItem>
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
  console.log(children);
  const { colorMode } = useColorMode();
  return (
    <Box
      as="a"
      href="#"
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        // "home" => current state
        bg={abbr === "home" ? "blue.400" : "transparent"}
        color={
          abbr === "home" ? "black" : colorMode === "dark" ? "white" : "black"
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
      position="absolute"
      top="0"
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
