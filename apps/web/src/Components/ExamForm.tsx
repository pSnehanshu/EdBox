import { useEffect, useState } from "react";
import { CheckIcon } from "@chakra-ui/icons";
import {
  Flex,
  Heading,
  Input,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  Stack,
  Textarea,
  Text,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  useDisclosure,
  Modal,
} from "@chakra-ui/react";
import { MdOutlineFileUpload } from "react-icons/md";
import { trpc } from "../utils/trpc";
import { useConfig } from "../utils/atoms";
import {
  Section,
  Homework,
  RouterInput,
  ExamTest,
  ClassWithSections,
  Subject,
} from "schooltalk-shared/types";
import { format } from "date-fns";
import { ExamTestSchema } from "schooltalk-shared/misc";

export default function ExamForm() {
  const { schoolId: selectedSchoolId } = useConfig();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [textContent, setTextContent] = useState("");

  return (
    <>
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Create new Exam</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <Stack spacing={3} mx={8}>
          <Textarea
            placeholder="Description (optional)"
            size="md"
            onChange={(e) => setTextContent(e.target.value)}
            value={textContent ?? null}
          />
        </Stack>
        <Flex justifyContent="center" my={8}>
          <Button
            onClick={() => {
              onOpen();
            }}
          >
            Add New Tests
          </Button>
        </Flex>
        {/* list of tests */}
        <Heading size="sm" mx={8}>
          Tests
        </Heading>
        {/* create tests popup */}
        <ModalFooter>
          <Flex justifyContent="center">
            <Button isLoading={false}>
              <CheckIcon boxSize={"6"} />
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>

      <Modal isOpen={isOpen} onClose={onClose}>
        <TestForm />
      </Modal>
    </>
  );
}

interface TestModalProps {
  testData?: ExamTest | ExamTestSchema | null;
}

export function TestForm({ testData }: TestModalProps) {
  const { schoolId: selectedSchoolId } = useConfig();

  const [multiselectSub, setMultiselectSub] = useState(false);

  const [mark, setMark] = useState(testData?.total_marks ?? 25);
  const [duration, setDuration] = useState(testData?.duration_minutes ?? 30);
  const [selectedClass, setSelectedClass] = useState<ClassWithSections>();
  const [selectedSection, setSelectedSection] = useState<
    Section | string | undefined
  >("All sections");
  const [dueDate, setDueDate] = useState(
    testData?.date_of_exam ? testData.date_of_exam : undefined,
  );
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);

  const subjectsQuery = trpc.school.subject.fetchSubjects.useQuery({}, {});

  useEffect(() => {
    if (testData?.section_id)
      setSelectedSection(
        selectedClass?.Sections.find(
          (d) => d.numeric_id === testData?.section_id,
        ),
      );
  }, [selectedClass, testData?.section_id]);

  const classesAndSectionsData =
    trpc.school.class.fetchClassesAndSections.useQuery(
      { schoolId: selectedSchoolId },
      {
        cacheTime: 0,
        onSuccess(data) {
          setSelectedClass((c) => {
            if (c) return c;
            return data.find((d) => d.numeric_id === testData?.class_id);
          });
        },
      },
    );

  const handleClassSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (classesAndSectionsData) {
      const selectedNumericId = Number(e.target.value);

      const filteredData = classesAndSectionsData?.data?.find((ele) => {
        return ele.numeric_id === selectedNumericId;
      });

      setSelectedClass(filteredData);
      setSelectedSection(undefined);
    }
  };

  const handleSectionSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const section =
      sectionsOptions &&
      sectionsOptions.find((section) => {
        if (typeof section === "string") return section;

        return section.numeric_id === Number(e.target.value);
      });
    setSelectedSection(section);
  };

  const sectionsOptions = ["All sections", ...(selectedClass?.Sections ?? [])];

  return (
    <>
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Create new Test</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <Stack spacing={3} mx={8}>
          <Flex gap={8}>
            <Select
              placeholder="Class"
              size="lg"
              onChange={handleClassSelectChange}
              value={selectedClass?.numeric_id ?? undefined}
            >
              {classesAndSectionsData &&
                classesAndSectionsData.data?.map((item) => (
                  <option value={item.numeric_id} key={item.name}>
                    Class {item.name ?? item.numeric_id}
                  </option>
                ))}
            </Select>
            <Select
              placeholder="Section"
              size="lg"
              onChange={handleSectionSelectChange}
            >
              {sectionsOptions &&
                sectionsOptions.map((item, index) => (
                  <option value={index} key={index}>
                    {typeof item == "string" ? item : "Section " + item.name}
                  </option>
                ))}
            </Select>
          </Flex>

          <Select placeholder="Subject" size="lg">
            {subjectsQuery.data &&
              subjectsQuery?.data.map((item) => (
                <option value={item.id} key={item.name}>
                  {item.name}
                </option>
              ))}
          </Select>
          <Input placeholder="Exam date" size="md" type="datetime-local" />

          {/* total mark + duraiton */}
          <Text>Marks</Text>
          <Slider
            aria-label="slider-ex-1"
            defaultValue={mark}
            onChange={(val) => setMark(val)}
            max={180}
            step={5}
          >
            <SliderMark
              value={mark}
              textAlign="center"
              bg="blue.500"
              color="white"
              mt="-10"
              ml="-4"
              w="8"
            >
              {mark}
            </SliderMark>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Text>Duration</Text>
          <Slider
            aria-label="slider-ex-6"
            defaultValue={duration}
            onChange={(val) => setDuration(val)}
            max={180}
            step={5}
          >
            <SliderMark
              value={duration}
              textAlign="center"
              bg="blue.500"
              color="white"
              mt="-10"
              ml="-4"
              w="8"
            >
              {duration}
            </SliderMark>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>

          <Flex justifyContent="center" gap={2}>
            <MdOutlineFileUpload size={28} />
            <Text fontSize="lg" fontWeight="semibold">
              Upload File
            </Text>
          </Flex>
        </Stack>
        <ModalFooter>
          <Flex justifyContent="center">
            <Button>
              <CheckIcon boxSize={"6"} />
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </>
  );
}
