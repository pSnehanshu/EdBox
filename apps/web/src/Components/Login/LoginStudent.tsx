import {
  Flex,
  Box,
  FormControl,
  Input,
  Stack,
  Button,
  Text,
  useColorModeValue,
  Select,
} from "@chakra-ui/react";
import { trpc } from "../../utils/trpc";
import { useAtom } from "jotai";
import { useConfig, SessionExpiryAtom } from "../../utils/atoms";
import { useCallback, useState } from "react";
import { ClassWithSections } from "schooltalk-shared/types";
import OtpPopup from "./OtpPopup";
import { parseISO } from "date-fns";
import type { LoginOtpProps } from "./LoginOTP";

export default function StudentLogin({
  onLogin,
  onLoginFailed,
}: LoginOtpProps) {
  const { schoolId: selectedSchoolId } = useConfig();
  const [, setTokenExpiry] = useAtom(SessionExpiryAtom);

  const [selectedClass, setSelectedClass] = useState<ClassWithSections[]>();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [rollno, setRollNo] = useState<string>("");
  const [openOtp, setOpenOtp] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const requestRollNumberOTP = trpc.auth.rollNumberLoginRequestOTP.useMutation({
    onSuccess(data) {
      setCurrentUserId(data.userId);
      console.log(data, "user");
      setOpenOtp(true);
    },
    onError(error) {
      console.error(error);
      onLoginFailed?.("Student not found");
    },
  });

  const classesAndSectionsData =
    trpc.school.class.fetchClassesAndSections.useQuery(
      { schoolId: selectedSchoolId! },
      { cacheTime: 0 },
    );

  const handleClassSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (classesAndSectionsData) {
      const selectedNumericId = Number(e.target.value);

      const filteredData = classesAndSectionsData?.data?.filter((ele) => {
        return ele.numeric_id === selectedNumericId;
      });

      setSelectedClass(filteredData);
      setSelectedSectionId(null);
    }
  };
  const handleSectionSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedSectionId(e.target.value);
  };

  const trpcUtils = trpc.useContext();

  const submitOTPMutation = trpc.auth.submitLoginOTP.useMutation({
    async onSuccess({ token, expiry_date }) {
      onLogin?.();
      localStorage.setItem("token", token);
      trpcUtils.profile.me.invalidate();
      setTokenExpiry(parseISO(expiry_date));
    },
    onError(error) {
      console.error(error);
      onLoginFailed?.("Incorrect OTP");
    },
  });

  const onSubmit = useCallback(
    async (otp: any) => {
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
        onSubmit={(otp: any) => onSubmit(otp)}
      />
      <Stack>
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
              <Stack>
                <Text>Class</Text>
                <Select
                  placeholder="Select class"
                  onChange={handleClassSelectChange}
                >
                  {classesAndSectionsData &&
                    classesAndSectionsData.data?.map((item) => (
                      <option value={item.numeric_id} key={item.name}>
                        Class {item.name ?? item.numeric_id}
                      </option>
                    ))}
                </Select>
              </Stack>

              <Stack>
                <Text>Section</Text>
                <Select
                  placeholder="Select section"
                  onChange={handleSectionSelectChange}
                  disabled={!selectedClass}
                >
                  {selectedClass &&
                    selectedClass[0].Sections.map((item) => (
                      <option value={item.numeric_id} key={item.name}>
                        Section {item.name ?? item.numeric_id}
                      </option>
                    ))}
                </Select>
              </Stack>
            </Stack>
            <FormControl id="email">
              <Text mb={2}>Roll-No</Text>
              <Input
                type="number"
                value={rollno}
                onChange={(e) => setRollNo(e.target.value)}
              />
            </FormControl>
            <Stack spacing={8}>
              <Button
                onClick={() => {
                  if (
                    selectedClass &&
                    selectedSectionId &&
                    rollno &&
                    selectedSchoolId
                  )
                    requestRollNumberOTP.mutate({
                      school_id: selectedSchoolId,
                      class_id: selectedClass[0].numeric_id,
                      section_id: Number(selectedSectionId),
                      rollnum: Number(rollno),
                    });
                }}
                bg={"purple.600"}
                color={"white"}
                _hover={{
                  bg: "purple.700",
                }}
                isLoading={
                  requestRollNumberOTP.isLoading || submitOTPMutation.isLoading
                }
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
