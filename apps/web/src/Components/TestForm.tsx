import { ExamTestSchema } from "schooltalk-shared/misc";
import {
  ClassWithSections,
  ExamTest,
  Section,
  Subject,
} from "schooltalk-shared/types";
import { useConfig } from "../utils/atoms";
import { useEffect, useState } from "react";
import { trpc } from "../utils/trpc";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { format, parseISO } from "date-fns";
import { MdOutlineFileUpload } from "react-icons/md";
import { CheckIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";

interface TestModalProps {
  onSubmit?: (test: ExamTestSchema) => void;
  testData?: ExamTest | ExamTestSchema | null;
}

export function TestForm({ onSubmit, testData }: TestModalProps) {
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
    let section: string | Section | undefined = "All sections";

    if (e.target.value === "0") {
      section = "All sections";
    } else {
      section =
        sectionsOptions &&
        sectionsOptions.find((section) => {
          if (typeof section !== "string")
            return section.numeric_id === Number(e.target.value);
        });
    }

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
                  <option
                    value={typeof item == "string" ? 0 : item.numeric_id}
                    key={index}
                  >
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
          <Input
            placeholder="Exam date"
            size="md"
            type="datetime-local"
            onChange={(e) => setDueDate(parseISO(e.target.value))}
            value={dueDate ? format(dueDate!, "yyyy-MM-dd'T'HH:mm") : undefined}
          />

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
            <Button
              onClick={() => {
                console.log(selectedSection, "data");
                if (
                  selectedClass &&
                  selectedSection &&
                  selectedSubjects.length > 0 &&
                  mark &&
                  dueDate &&
                  duration
                ) {
                  let subjectIds = selectedSubjects.map((s) => s.id);
                  if (!multiselectSub && subjectIds.length > 1) {
                    subjectIds = [subjectIds[0]];
                  }

                  onSubmit &&
                    onSubmit({
                      class_id: selectedClass?.numeric_id,
                      section_id:
                        typeof selectedSection === "string"
                          ? undefined
                          : selectedSection?.numeric_id,
                      date_of_exam: dueDate,
                      duration_minutes: duration,
                      subjectIds,
                      total_marks: mark,
                    });
                } else {
                  console.log("insufficient data");
                }
              }}
            >
              <CheckIcon boxSize={"6"} />
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </>
  );
}

interface TestItemInterface {
  test: ExamTestSchema;
  onDelete: () => void;
  onEdit: () => void;
}

function TestComponent({ test, onEdit, onDelete }: TestItemInterface) {
  const subjectsQuery = trpc.school.subject.fetchSubjects.useQuery({});
  const selectedSubjects = subjectsQuery.data
    ?.filter((obj) => test.subjectIds.includes(obj.id))
    .map((obj) => obj.name);

  return (
    <Box w="100%" borderBottomWidth="1px" borderColor="gray">
      <Flex justifyContent="space-between">
        <Flex alignItems="center" flex="1">
          <Text fontSize="lg" fontWeight="bold" mr="2">
            {selectedSubjects?.[0]}
            {selectedSubjects && selectedSubjects.length > 1
              ? ` & ${selectedSubjects.length - 1} more`
              : ""}
          </Text>

          <Text>
            {format(new Date(test.date_of_exam), "MMM dd, yyyy hh:mm aaa")}
          </Text>
        </Flex>
        <Flex alignItems="center">
          <Text mr="2">{test.duration_minutes} minutes</Text>
          <Text>{test.total_marks} marks</Text>
        </Flex>
      </Flex>
      <Flex justifyContent="space-between" p="2" mt="2">
        <Button
          size="sm"
          colorScheme="blue"
          leftIcon={<EditIcon />}
          onClick={onEdit}
        >
          Edit
        </Button>
        <Button
          size="sm"
          colorScheme="red"
          borderColor="red"
          leftIcon={<DeleteIcon />}
          onClick={onDelete}
        >
          Delete
        </Button>
      </Flex>
    </Box>
  );
}
