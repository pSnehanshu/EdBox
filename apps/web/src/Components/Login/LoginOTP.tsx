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
  useColorModeValue,
} from "@chakra-ui/react";
import { parseISO } from "date-fns";
import { trpc } from "../../utils/trpc";
import { useState, useCallback } from "react";
import { useAtom } from "jotai";
import {
  SelectedSchoolIdAtom,
  SessionExpiryAtom,
  SessionTokenAtom,
} from "../../utils/atoms";
import OtpPopup from "./OtpPopup";

interface LoginOtpProps {
  setshowSchoolSelector: () => void;
}

export default function LoginOTP({ setshowSchoolSelector }: LoginOtpProps) {
  const [selectedSchoolId] = useAtom(SelectedSchoolIdAtom);
  const [, setToken] = useAtom(SessionTokenAtom);
  const [, setTokenExpiry] = useAtom(SessionExpiryAtom);

  const [phoneNo, setPhoneNo] = useState("");
  const [openOtp, setOpenOtp] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const requestOtp = trpc.auth.requestPhoneNumberOTP.useMutation({
    onSuccess(data) {
      setUserId(data.userId);
      setOpenOtp(true);
    },
    onError(error) {
      console.error(error);
      console.error("Error", "Phone number isn't registered");
    },
  });

  const submitOTPMutation = trpc.auth.submitLoginOTP.useMutation({
    async onSuccess({ token, expiry_date }) {
      setToken(token);
      setTokenExpiry(parseISO(expiry_date));
    },
    onError(error) {
      console.error(error);
    },
  });

  const onSubmit = useCallback(
    async (otp: string) => {
      if (userId && otp && selectedSchoolId) {
        submitOTPMutation.mutate({
          userId,
          otp,
          schoolId: selectedSchoolId,
        });
      }
    },
    [userId, selectedSchoolId],
  );

  return (
    <Flex>
      <OtpPopup
        visible={openOtp}
        onClose={() => setOpenOtp(false)}
        onSubmit={(otp) => onSubmit(otp)}
      />
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
            <Stack spacing={8}>
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
              <Button onClick={setshowSchoolSelector}>Change School</Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
