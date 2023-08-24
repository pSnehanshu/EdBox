import LoginOTP from "../Components/Login/LoginOTP";
import StudentLogin from "../Components/Login/LoginStudent";
import Search from "../Components/Login/Search";
import {
  useToast,
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
  const toast = useToast();

  const handleLogin = () => {
    toast({
      title: "Login succesfull",
      description: "You will be redirected in a moment...",
      status: "success",
    });
  };

  const handleLoginFailure = (reason: string) => {
    toast({
      title: "Something went wrong",
      description: reason,
      status: "error",
      duration: 1500,
    });
  };

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
                  onLogin={handleLogin}
                  onLoginFailed={handleLoginFailure}
                />
              </TabPanel>
              <TabPanel>
                <StudentLogin
                  setshowSchoolSelector={() => setshowSchoolSelector(true)}
                  onLogin={handleLogin}
                  onLoginFailed={handleLoginFailure}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </Flex>
    </>
  );
}
