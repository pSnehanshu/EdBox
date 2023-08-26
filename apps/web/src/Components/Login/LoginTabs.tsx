import {
  Button,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import LoginOTP, { LoginOtpProps } from "./LoginOTP";
import StudentLogin from "./LoginStudent";
import { useConfigUpdate } from "../../utils/atoms";

export default function LoginTabs({ onLogin, onLoginFailed }: LoginOtpProps) {
  const setConfig = useConfigUpdate();

  return (
    <Flex direction="column" minH={400} minW="400">
      <Tabs isFitted>
        <TabList>
          <Tab>For Parents, Teachers, and Staff</Tab>
          <Tab>For Students</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <LoginOTP onLogin={onLogin} onLoginFailed={onLoginFailed} />
          </TabPanel>
          <TabPanel>
            <StudentLogin onLogin={onLogin} onLoginFailed={onLoginFailed} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Button
        variant="outline"
        my="2"
        onClick={() => setConfig({ schoolId: "" })}
      >
        Change school
      </Button>
    </Flex>
  );
}
