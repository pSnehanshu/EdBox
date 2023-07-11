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
      <Flex
        minH={"100vh"}
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
          <Stack align={"center"}>
            <Heading fontSize={"4xl"}>Sign in to your account</Heading>
            {/* <Text fontSize={"lg"} color={"gray.600"}>
            to enjoy all of our cool <Link color={"blue.400"}>features</Link> ✌️
          </Text> */}
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            <Stack spacing={4}>
              <FormControl id="email">
                <FormLabel>Email address</FormLabel>
                <Input type="email" />
              </FormControl>
              <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <Input type="password" />
              </FormControl>
              <Stack spacing={10}>
                <Button
                  bg={"purple.600"}
                  color={"white"}
                  _hover={{
                    bg: "purple.700",
                  }}
                >
                  Sign in
                </Button>
                <Stack>
                  <Link color={"purple.900"}>Login with Email</Link>
                  <Link color={"purple.900"}>Login with Password</Link>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Flex>
    </>

    // <>
    //   <Flex
    //     minH={"100vh"}
    //     align={"center"}
    //     justify={"center"}
    //     bg={useColorModeValue("gray.50", "gray.800")}
    //   >
    //     <Search />

    //     <Tabs variant="soft-rounded" colorScheme="green">
    //       <TabList>
    //         <Tab>Parents</Tab>
    //         <Tab>Student</Tab>
    //       </TabList>
    //       <TabPanels>
    //         <TabPanel>
    //           <LoginOTP />
    //         </TabPanel>
    //         <TabPanel>
    //           <StudentLogin />
    //         </TabPanel>
    //       </TabPanels>
    //     </Tabs>

    //     <LoginEmail />
    //   </Flex>
    // </>
  );
}
