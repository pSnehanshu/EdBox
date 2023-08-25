import { useState } from "react";
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
} from "@chakra-ui/react";
import { MdOutlineFileUpload } from "react-icons/md";
import { trpc } from "../utils/trpc";
import { useConfig } from "../utils/atoms";
import { Section, Homework, RouterInput } from "schooltalk-shared/types";
import { parseISO } from "date-fns";

interface HomeworkFormData {
  class_id: number;
  section_id: number;
  subject_id: string;
  text?: string;
  due_date?: Date;
  remove_attachments?: RouterInput["school"]["homework"]["update"]["remove_attachments"];
  new_file_permissions?: RouterInput["school"]["homework"]["update"]["new_file_permissions"];
}
interface HomeworkFormData {
  class_id: number;
  section_id: number;
  subject_id: string;
  text?: string;
  due_date?: Date;
  remove_attachments?: RouterInput["school"]["homework"]["update"]["remove_attachments"];
  new_file_permissions?: RouterInput["school"]["homework"]["update"]["new_file_permissions"];
}
interface HomeworkFormProps {
  homework?: Homework;
  onSubmit: (data: HomeworkFormData) => void;
  isSubmitting: boolean;
}

export default function HomeworkForm({
  homework,
  onSubmit,
  isSubmitting,
}: HomeworkFormProps) {
  const { schoolId: selectedSchoolId } = useConfig();

  const [selectedClass, setSelectedClass] = useState(homework?.Class);
  const [selectedSection, setSelectedSection] = useState(homework?.Section);
  const [selectedSubject, setSelectedSubject] = useState(homework?.Subject);
  const [textContent, setTextContent] = useState(homework?.text ?? "");
  const [dueDate, setDueDate] = useState(
    homework?.due_date ? parseISO(homework.due_date) : undefined,
  );

  const classesAndSectionsData =
    trpc.school.class.fetchClassesAndSections.useQuery({
      schoolId: selectedSchoolId!,
    });

  const availableSections = classesAndSectionsData.data?.find(
    (Class) => Class.numeric_id === selectedClass?.numeric_id,
  )?.Sections;

  const subjectsQuery = trpc.school.subject.fetchSubjects.useQuery({});

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
      availableSections &&
      availableSections.find((section) => {
        return section.numeric_id === Number(e.target.value);
      });
    setSelectedSection(section);
  };

  const handleSubjectSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const subject =
      subjectsQuery.data &&
      subjectsQuery.data.find((subject) => {
        return subject.id === e.target.value;
      });
    setSelectedSubject(subject);
  };

  return (
    <>
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Create new Home Works</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <Stack spacing={3} mx={8}>
          <Flex gap={8}>
            <Select
              placeholder="Class"
              size="lg"
              onChange={handleClassSelectChange}
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
              {availableSections &&
                availableSections.map((item) => (
                  <option value={item.numeric_id} key={item.name}>
                    Section {item.name ?? item.numeric_id}
                  </option>
                ))}
            </Select>
          </Flex>
          <Select
            placeholder="Subject"
            size="lg"
            onChange={handleSubjectSelectChange}
          >
            {subjectsQuery.data &&
              subjectsQuery?.data.map((item) => (
                <option value={item.id} key={item.name}>
                  {" "}
                  {item.name}
                </option>
              ))}
          </Select>
          <Input
            placeholder="Due date (optional)"
            size="md"
            type="datetime-local"
            onChange={(e) => setDueDate(parseISO(e.target.value))}
          />
          <Textarea
            placeholder="Description (optional)"
            size="md"
            onChange={(e) => setTextContent(e.target.value)}
          />
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
                if (selectedSection && selectedClass && selectedSubject) {
                  onSubmit({
                    class_id: selectedClass.numeric_id,
                    section_id: selectedSection.numeric_id,
                    subject_id: selectedSubject.id,
                    due_date: dueDate,
                    text: textContent,
                  });
                }
              }}
              isLoading={isSubmitting}
            >
              <CheckIcon boxSize={"6"} />
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </>
  );
}
