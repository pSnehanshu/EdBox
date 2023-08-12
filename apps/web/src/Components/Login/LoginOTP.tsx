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
  Spinner,
} from "@chakra-ui/react";
import { parseISO } from "date-fns";
import { trpc } from "../../utils/trpc";
import { useState, useCallback } from "react";
import { useAtom } from "jotai";
import { useConfig, SessionExpiryAtom } from "../../utils/atoms";
import OtpPopup from "./OtpPopup";

interface LoginOtpProps {
  setshowSchoolSelector: () => void;
}

export default function LoginOTP({ setshowSchoolSelector }: LoginOtpProps) {
  const config = useConfig();
  const selectedSchoolId = config.schoolId;

  const [, setTokenExpiry] = useAtom(SessionExpiryAtom);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [phoneNo, setPhoneNo] = useState("");
  const [openOtp, setOpenOtp] = useState(false);

  const trpcUtils = trpc.useContext();

  const requestOtp = trpc.auth.requestPhoneNumberOTP.useMutation({
    onSuccess(data) {
      setCurrentUserId(data.userId);
      setOpenOtp(true);
    },
    onError(error) {
      console.error(error);
      console.error("Error", "Phone number isn't registered");
    },
  });

  const submitOTPMutation = trpc.auth.submitLoginOTP.useMutation({
    async onSuccess({ token, expiry_date }) {
      localStorage.setItem("token", token);
      trpcUtils.profile.me.invalidate();
      setTokenExpiry(parseISO(expiry_date));
    },
    onError(error) {
      console.error(error);
    },
  });

  const onSubmit = useCallback(
    async (otp: string) => {
      if (currentUserId && otp && selectedSchoolId) {
        submitOTPMutation.mutate({
          userId: currentUserId,
          otp,
          schoolId: selectedSchoolId,
        });
      }
    },
    [currentUserId, selectedSchoolId],
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
                {requestOtp.isLoading || submitOTPMutation.isLoading ? (
                  <Spinner />
                ) : (
                  "Request OTP"
                )}
              </Button>
              <Button onClick={setshowSchoolSelector}>Change School</Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
