import { useCallback, useState } from "react";
import { CheckIcon } from "@chakra-ui/icons";
import {
  Flex,
  Heading,
  Input,
  Select,
  Stack,
  Textarea,
  Text,
  Button,
  Box,
} from "@chakra-ui/react";
import { MdOutlineFileUpload } from "react-icons/md";
import { trpc } from "../utils/trpc";
import { useConfig } from "../utils/atoms";
import { Section, Homework, RouterInput } from "schooltalk-shared/types";
import { format, parseISO } from "date-fns";
import { useFileUpload } from "../../src/utils/file-upload";
import AttachmentsDisplay from "./Attachments/AttachmentsDisplay";
import { useDropzone } from "react-dropzone";

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
    homework?.due_date ? homework.due_date : new Date(),
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

  const fileUploadHandler = useFileUpload();

  const onDrop = useCallback((acceptedFiles: any) => {
    console.log(acceptedFiles, "succes");
    fileUploadHandler.UploadFileDrag(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const { ref, ...rootProps } = getRootProps();
  console.log(fileUploadHandler.uploadTasks.length, "fire");

  return (
    <>
      <Stack spacing={3}>
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
            value={selectedSection?.numeric_id ?? undefined}
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
          value={selectedSubject?.id ?? undefined}
        >
          {subjectsQuery.data &&
            subjectsQuery?.data.map((item) => (
              <option value={item.id} key={item.name}>
                {item.name}
              </option>
            ))}
        </Select>
        <Input
          placeholder="Due date (optional)"
          size="md"
          type="datetime-local"
          onChange={(e) => setDueDate(parseISO(e.target.value))}
          value={format(dueDate!, "yyyy-MM-dd'T'HH:mm")}
        />
        <Textarea
          placeholder="Description (optional)"
          size="md"
          onChange={(e) => setTextContent(e.target.value)}
          value={textContent ?? null}
        />
        <Flex
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap={4}
          {...getRootProps({
            onClick: (event) => event.stopPropagation(),
          })}
        >
          <Button
            onClick={() => fileUploadHandler.pickAndUploadFile()}
            width="100%"
            paddingY={4}
          >
            <Flex justifyContent="center" gap={2}>
              <MdOutlineFileUpload size={24} />
              <Text fontSize="lg" fontWeight="semibold">
                Upload File or Drag it Here
              </Text>
            </Flex>
          </Button>

          <input {...getInputProps()} />
          {isDragActive && (
            <Box
              border="1px dashed white"
              borderRadius="md"
              p={4}
              textAlign="center"
              width="100%"
            >
              Drag it Here !
            </Box>
          )}
        </Flex>

        <Flex>
          <Flex flexDir="column" gap={2} py={4}>
            <Heading size="lg">Attachments</Heading>
            {fileUploadHandler.uploadTasks.map((file, index) => (
              <AttachmentsDisplay key={index} file={file} />
            ))}
            {fileUploadHandler.uploadTasks.length <= 0 && (
              <Text fontSize="xl" color="gray.500">
                Nothing to display
              </Text>
            )}
          </Flex>
        </Flex>
      </Stack>
      <Flex justifyContent="end" pb={4}>
        <Button
          onClick={() => {
            if (selectedSection && selectedClass && selectedSubject) {
              onSubmit({
                class_id: selectedClass.numeric_id,
                section_id: selectedSection.numeric_id,
                subject_id: selectedSubject.id,
                due_date: dueDate,
                text: textContent,
                new_file_permissions: fileUploadHandler.uploadTasks.map(
                  (file) => ({
                    permission_id: file.permission.id,
                    file_name: file.file.name,
                  }),
                ),
              });
            }
          }}
          isLoading={isSubmitting}
        >
          <CheckIcon boxSize={"6"} />
        </Button>
      </Flex>
    </>
  );
}
