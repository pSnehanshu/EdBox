import LoginOTP from "../Components/Login/LoginOTP";
import StudentLogin from "../Components/Login/LoginStudent";
import Search from "../Components/Login/Search";
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
import { SelectedSchoolIdAtom } from "../utils/atoms";

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
