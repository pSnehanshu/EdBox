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
  IndicatorsContainerProps,
  Select as MultiSelect,
} from "chakra-react-select";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
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
  Switch,
  Text,
} from "@chakra-ui/react";
import { format, parseISO } from "date-fns";
import { MdOutlineFileUpload } from "react-icons/md";
import { CheckIcon } from "@chakra-ui/icons";

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

  useEffect(() => {
    let tempSubjectArray: string[] = [];
    if (testData && "Subjects" in testData) {
      tempSubjectArray = testData?.Subjects.map((e) => {
        return e.Subject.id;
      });
    } else {
      tempSubjectArray = testData?.subjectIds ?? [];
    }
    if (tempSubjectArray && tempSubjectArray?.length > 1) {
      setMultiselectSub(true);
    }
    if (subjectsQuery.data)
      setSelectedSubjects(
        subjectsQuery?.data.filter((obj) => tempSubjectArray?.includes(obj.id)),
      );
  }, [subjectsQuery.data]);

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
  console.log(selectedSubjects, "subjects");

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
              value={
                typeof selectedSection == "string"
                  ? 0
                  : selectedSection?.numeric_id
              }
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

          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="multi-subjects" mb="0">
              Select Multiple Subjects
            </FormLabel>
            <Switch
              id="multi-subjects"
              isChecked={multiselectSub}
              onChange={() => setMultiselectSub((prev) => !prev)}
            />
          </FormControl>

          <MultiSelect
            isMulti={multiselectSub}
            name="Subject"
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
            options={subjectsQuery.data}
            placeholder="Subject"
            closeMenuOnSelect={!multiselectSub}
            size="lg"
            value={selectedSubjects}
            onChange={(value) => {
              // type
              if (multiselectSub) value && setSelectedSubjects(value);
              else value && setSelectedSubjects([value]);
            }}
            chakraStyles={{
              placeholder: (provided) => ({
                ...provided,
                color: "white",
              }),
              dropdownIndicator: (provided, state) => ({
                ...provided,
                backgroundColor: "transparent",
                p: 0,
                w: "40px",
              }),
            }}
            components={{
              IndicatorSeparator: () => null,
            }}
          />

          {/* <Select
              placeholder="Subject"
              size="lg"
              onChange={handleSubjectSelectChange}
              value={selectedSubjects?.id ?? undefined}
            >
              {subjectsQuery.data &&
                subjectsQuery?.data.map((item) => (
                  <option value={item.id} key={item.name}>
                    {item.name}
                  </option>
                ))}
            </Select> */}

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
            zIndex="0"
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
            zIndex="0"
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
        </Stack>
        <ModalFooter>
          <Flex justifyContent="center">
            <Button
              onClick={() => {
                if (
                  selectedClass &&
                  selectedSection &&
                  selectedSubjects &&
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
