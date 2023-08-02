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
    <Flex>
      <Stack>
        <Stack>
          <Heading fontSize={"4xl"}>Sign in to your account</Heading>
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
            <Stack spacing={10}>
              <Stack
                direction={{ base: "column", sm: "row" }}
                align={"start"}
                justify={"space-between"}
              >
                <Checkbox>Remember me</Checkbox>
                <Link color={"purple.700"}>Forgot password?</Link>
              </Stack>
              <Button
                onClick={() => {
                  console.log("student");
                }}
                bg={"purple.600"}
                color={"white"}
                _hover={{
                  bg: "purple.700",
                }}
              >
                Request OTP
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
