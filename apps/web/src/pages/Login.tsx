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
import { useState } from "react";

export default function LoginPage() {
  const schoolId = useAtom(SelectedSchoolIdAtom);

  const [showSchoolSelector, setshowSchoolSelector] = useState(false);

  return (
    <>
      <Flex
        minH="100vh"
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.50", "gray.800")}
        flexDirection={"column"}
      >
        {!schoolId[0] || showSchoolSelector ? (
          <Search setshowSchoolSelector={() => setshowSchoolSelector(false)} />
        ) : (
          <Tabs
            colorScheme="purple"
            isFitted
            size="fit"
            maxH="40vh"
            defaultIndex={schoolId ? 0 : 1}
          >
            <TabList justifyContent="center">
              <Tab>Parents</Tab>
              <Tab>Student</Tab>
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
        )}
      </Flex>
    </>
  );
}
