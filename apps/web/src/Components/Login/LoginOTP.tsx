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
import { trpc } from "../../utils/trpc";
import { useState } from "react";
import { useAtom } from "jotai";
import { SelectedSchoolIdAtom } from "../../utils/atoms";
import OtpPopup from "./OtpPopup";

export default function LoginOTP() {
  const [phoneNo, setPhoneNo] = useState("");
  const [selectedSchoolId] = useAtom(SelectedSchoolIdAtom);
  const [openOtp, setOpenOtp] = useState(false);

  const requestOtp = trpc.auth.requestPhoneNumberOTP.useMutation({
    onSuccess(data) {
      // setUserId(data.userId)
      console.log(data, "user");
      setOpenOtp(true);
    },
    onError(error) {
      console.error(error);
      console.error("Error", "Phone number isn't registered");
    },
  });

  return (
    <Flex>
      <OtpPopup visible={openOtp} onClose={() => setOpenOtp(false)} />
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
              <Input
                type="tel"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                maxLength={10}
              />
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
                  if (phoneNo && selectedSchoolId)
                    requestOtp.mutate({
                      phoneNumber: phoneNo,
                      schoolId: selectedSchoolId,
                    });
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
