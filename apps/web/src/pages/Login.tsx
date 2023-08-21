import LoginOTP from "../Components/Login/LoginOTP";
import StudentLogin from "../Components/Login/LoginStudent";
import Search from "../Components/Login/Search";
import {
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { useConfig } from "../utils/atoms";
import { useState } from "react";

export default function LoginPage() {
  const { schoolId } = useConfig();

  const [showSchoolSelector, setshowSchoolSelector] = useState(false);

  return (
    <>
      <Flex
        minH="90vh"
        minW="100vw"
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.50", "gray.800")}
        flexDirection={"column"}
      >
        {!schoolId || showSchoolSelector ? (
          <Search setshowSchoolSelector={() => setshowSchoolSelector(false)} />
        ) : (
          <>
            <Tabs
              colorScheme="purple"
              isFitted
              size="lg"
              maxH="40vh"
              defaultIndex={schoolId ? 0 : 1}
            >
              <TabList justifyContent="center">
                <Tab>Parents, Teachers, and Staff</Tab>
                <Tab>Students</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <LoginOTP
                    setshowSchoolSelector={() => setshowSchoolSelector(true)}
                  />
                </TabPanel>
                <TabPanel>
                  <StudentLogin
                    setshowSchoolSelector={() => setshowSchoolSelector(true)}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </>
        )}
      </Flex>
    </>
  );
}
