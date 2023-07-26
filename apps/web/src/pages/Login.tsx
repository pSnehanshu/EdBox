import LoginEmail from "../Components/Login/Login/LoginEmail";
import LoginOTP from "../Components/Login/Login/LoginOTP";
import StudentLogin from "../Components/Login/Login/LoginStudetn";
import Search from "../Components/Login/Login/Search";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  useColorModeValue,
  Stack,
  Box,
  FormControl,
  Input,
  FormLabel,
  Heading,
  Button,
  Link,
} from "@chakra-ui/react";

import {} from "@chakra-ui/react";

export default function LoginPage() {
  return (
    <>
      <Search />
      <Flex
        minH="100vh"
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.50", "gray.800")}
        flexDirection={"column"}
      >
        <Tabs colorScheme="purple" isFitted maxH="40vh">
          <TabList justifyContent="center">
            <Tab>Parents</Tab>
            <Tab>Student</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <LoginOTP />
            </TabPanel>
            <TabPanel>
              <StudentLogin />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </>
  );
}
