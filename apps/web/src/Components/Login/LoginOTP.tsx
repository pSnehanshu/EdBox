import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { trpc } from "../../utils/trpc";
import { useState, useCallback } from "react";
import { useAtom } from "jotai";
import { useConfig, SessionExpiryAtom } from "../../utils/atoms";
import OtpPopup from "./OtpPopup";

export interface LoginOtpProps {
  onLogin?: () => void;
  onLoginFailed?: (reason: string) => void;
}

export default function LoginOTP({ onLogin, onLoginFailed }: LoginOtpProps) {
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
      onLoginFailed?.("Phone number isn't registered");
    },
  });

  const submitOTPMutation = trpc.auth.submitLoginOTP.useMutation({
    async onSuccess({ token, expiry_date }) {
      onLogin?.();
      localStorage.setItem("token", token);
      trpcUtils.profile.me.invalidate();
      setTokenExpiry(expiry_date);
    },
    onError(error) {
      console.error(error);
      onLoginFailed?.("Incorrect OTP");
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
    <>
      <OtpPopup
        visible={openOtp}
        onClose={() => setOpenOtp(false)}
        onSubmit={(otp) => onSubmit(otp)}
      />
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (phoneNo && selectedSchoolId)
              requestOtp.mutate({
                phoneNumber: phoneNo,
                schoolId: selectedSchoolId,
              });
          }}
        >
          <FormControl id="email">
            <FormLabel>Phone Number</FormLabel>
            <Input
              type="tel"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              maxLength={10}
              autoComplete="off"
            />
          </FormControl>
          <Button
            type="submit"
            mt="2"
            w="full"
            bg={"purple.600"}
            color={"white"}
            _hover={{
              bg: "purple.700",
            }}
            isLoading={requestOtp.isLoading || submitOTPMutation.isLoading}
          >
            Request OTP
          </Button>
        </form>
      </Box>
    </>
  );
}
