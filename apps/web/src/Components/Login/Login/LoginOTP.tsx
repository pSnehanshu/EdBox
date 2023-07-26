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
} from "@chakra-ui/react";

// import { trpc } from "../../../utils/trpc";

// Mutations
// const requestOtp = trpc.auth.requestPhoneNumberOTP.useMutation({
//   onSuccess(data) {
//     // setUserId(data.userId);
//   },
//   onError(error) {
//     console.error(error);
//     console.error("Error", "Phone number isn't registered");
//   },
// });

export default function LoginOTP() {
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
            <FormControl id="email">
              <FormLabel>Phone Number</FormLabel>
              <Input type="tel" />
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
                  console.log("otp");
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
