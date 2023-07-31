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
} from "@chakra-ui/react";
import { useAtom } from "jotai";
import { SelectedSchoolIdAtom } from "../utils/config";

export default function LoginPage() {
  const schoolId = useAtom(SelectedSchoolIdAtom);

  return (
    <>
      <Flex
        minH="100vh"
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.50", "gray.800")}
        flexDirection={"column"}
      >
        <Tabs
          colorScheme="purple"
          isFitted
          size="fit"
          maxH="40vh"
          defaultIndex={schoolId ? 1 : 0}
        >
          <TabList justifyContent="center">
            <Tab>Pick School</Tab>
            <Tab>Parents</Tab>
            <Tab>Student</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Search />
            </TabPanel>
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
