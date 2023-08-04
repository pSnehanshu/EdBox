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
import { trpc } from "../../utils/trpc";
import { useAtom } from "jotai";
import { SelectedSchoolIdAtom } from "../../utils/atoms";
import { useCallback, useState } from "react";
import { ClassWithSections, Section } from "schooltalk-shared/types";
import OtpPopup from "./OtpPopup";

interface props {
  setshowSchoolSelector: () => void;
}

export default function StudentLogin({ setshowSchoolSelector }: props) {
  const [selectedSchoolId] = useAtom(SelectedSchoolIdAtom);

  const [selectedClass, setSelectedClass] = useState<ClassWithSections[]>();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [rollno, setRollNo] = useState<string>();
  const [openOtp, setOpenOtp] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const requestRollNumberOTP = trpc.auth.rollNumberLoginRequestOTP.useMutation({
    onSuccess(data) {
      setUserId(data.userId);
      console.log(data, "user");
      setOpenOtp(true);
    },
    onError(error) {
      console.error(error);
      console.error("Error", "wrong data");
    },
  });

  const classesAndSectionsData =
    trpc.school.class.fetchClassesAndSections.useQuery(
      { schoolId: selectedSchoolId },
      // type error
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

  const submitOTPMutation = trpc.auth.submitLoginOTP.useMutation({
    async onSuccess(data) {
      console.log(data, "otp");
    },
    onError(error) {
      console.error(error);
    },
  });

  const onSubmit = useCallback(
    async (otp: any) => {
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
        onSubmit={(otp: any) => onSubmit(otp)}
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
              <Button onClick={setshowSchoolSelector}>Change School</Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
