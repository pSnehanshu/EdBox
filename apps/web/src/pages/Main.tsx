import { Box, useColorModeValue } from "@chakra-ui/react";
import SideMenu from "../Components/SideMenu";

export default function MainPage() {
  //
  return (
    <>
      <Box
        minH="100vh"
        bg={useColorModeValue("gray.100", "gray.900")}
        position="relative"
      >
        <SideMenu />
        <Box ml={{ base: 0, md: 72 }} p="4">
          <h1>home</h1>
        </Box>
      </Box>
    </>
  );
}
