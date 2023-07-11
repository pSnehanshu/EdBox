import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Link,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Select,
} from "@chakra-ui/react";

export default function StudentLogin() {
  return (
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
            <Stack
              direction={{ base: "column", sm: "row" }}
              align={"start"}
              justify={"space-between"}
            >
              <Stack spacing={4}>
                <Text>Class</Text>
                <Select placeholder="Select class">
                  <option value="option1">Class I</option>
                  <option value="option2">Class II</option>
                  <option value="option3">Class III</option>
                </Select>
              </Stack>

              <Stack spacing={4}>
                <Text>Section</Text>
                <Select placeholder="Select section">
                  <option value="option1">Section A</option>
                  <option value="option2">Section B</option>
                  <option value="option3">Section C</option>
                </Select>
              </Stack>
            </Stack>
            <FormControl id="email">
              <FormLabel>Roll-No</FormLabel>
              <Input type="text" />
            </FormControl>
            {/* <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <Input type="password" />
              </FormControl> */}
            <Stack spacing={10}>
              {/* <Stack
                    direction={{ base: "column", sm: "row" }}
                    align={"start"}
                    justify={"space-between"}
                  >
                    <Checkbox>Remember me</Checkbox>
                    <Link color={"purple.700"}>Forgot password?</Link>
                  </Stack> */}
              <Button
                bg={"purple.600"}
                color={"white"}
                _hover={{
                  bg: "purple.700",
                }}
              >
                Request OTP
              </Button>

              <Stack>
                <Link color={"purple.900"}>Login with Password</Link>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
