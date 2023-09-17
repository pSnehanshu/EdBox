import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  StackDivider,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { StaticRole } from "schooltalk-shared/misc";
import { useConfig } from "../utils/atoms";
import { trpc } from "../utils/trpc";
import { Homework } from "schooltalk-shared/types";
import { useMemo, useState } from "react";
import { format, isPast } from "date-fns";
import { MdOutlineAttachFile, MdOutlineFileUpload } from "react-icons/md";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import HomeworkForm from "../Components/HomeworkForm";
import AttachmentsDisplay from "../Components/Attachments/AttachmentsDisplay";
import FilePreview from "../Components/Attachments/FilePreview";

const pageLimit = 10;

export default function HomeworkPage() {
  const { activeStaticRole: currentUserRole } = useConfig();
  const isStudent = currentUserRole === StaticRole.student;
  const isTeacher = currentUserRole === StaticRole.teacher;

  const [homeworkEdit, setHomeworkEdit] = useState<Homework | undefined>(
    undefined,
  );

  const { isOpen, onOpen, onClose } = useDisclosure();

  const homeworkTeacherQuery =
    trpc.school.homework.fetchForTeacher.useInfiniteQuery(
      { limit: pageLimit },
      { enabled: isTeacher, getNextPageParam: (item) => item.nextCursor },
    );

  const classAndSectionQuery = trpc.school.people.getStudentClass.useQuery(
    undefined,
    { enabled: isStudent },
  );
  const canFetchSectionHW =
    isStudent &&
    classAndSectionQuery.isFetched &&
    typeof classAndSectionQuery.data?.Class.numeric_id === "number" &&
    typeof classAndSectionQuery.data?.Section?.numeric_id === "number";

  const homeworkSectionQuery =
    trpc.school.homework.fetchForSection.useInfiniteQuery(
      {
        limit: pageLimit,
        class_id: classAndSectionQuery.data?.Class.numeric_id!,
        section_id: classAndSectionQuery.data?.Section?.numeric_id!,
      },
      {
        enabled: canFetchSectionHW,
        getNextPageParam: (item) => item.nextCursor,
      },
    );

  const createHomework = trpc.school.homework.create.useMutation({
    onSuccess(data) {
      if (isTeacher) homeworkTeacherQuery.refetch();
      if (canFetchSectionHW) homeworkSectionQuery.refetch();
      onClose();
    },
    onError(error) {
      alert(error);
    },
  });
  const updateHomework = trpc.school.homework.update.useMutation({
    onSuccess() {
      if (isTeacher) homeworkTeacherQuery.refetch();
      if (canFetchSectionHW) homeworkSectionQuery.refetch();
      onClose();
    },
    onError(error) {
      alert(error.message);
    },
  });

  const query = isTeacher ? homeworkTeacherQuery : homeworkSectionQuery;

  const homeworks: Homework[] = [];
  query.data?.pages.forEach((page) => {
    homeworks.push(...page.data);
  });

  return (
    <Box>
      <Card>
        <CardHeader>
          <Flex dir="row" justifyContent={"space-between"}>
            <Heading size="xl">Home Works</Heading>
            {isTeacher && (
              <Button
                onClick={() => {
                  onOpen();
                  setHomeworkEdit(undefined);
                }}
              >
                Create new
              </Button>
            )}
          </Flex>
        </CardHeader>
        <Divider />
        <CardBody>
          <Stack divider={<StackDivider borderColor="gray.200" />} spacing={4}>
            {homeworks &&
              homeworks.map((item, index) => (
                <Box>
                  <SingleHomework
                    key={index}
                    homework={item}
                    onClick={onOpen}
                    setHomework={(hw) => setHomeworkEdit(hw)}
                  />
                </Box>
              ))}
          </Stack>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior={"inside"}>
        <ModalOverlay />
        <ModalContent>
          <Heading size="lg" px={8} py={4}>
            Create new Home Works
          </Heading>
          <ModalCloseButton />
          <ModalBody>
            <HomeworkForm
              homework={homeworkEdit}
              onSubmit={(hw) => {
                if (homeworkEdit) {
                  updateHomework.mutate({
                    ...hw,
                    homework_id: homeworkEdit?.id,
                    due_date: hw.due_date,
                  });
                } else {
                  createHomework.mutate({
                    ...hw,
                    due_date: hw.due_date,
                    file_permissions: hw.new_file_permissions,
                  });
                }
              }}
              isSubmitting={createHomework.isLoading}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

interface homeworkProps {
  homework: Homework;
  onClick: () => void;
  setHomework: (hw: Homework) => void;
}

function SingleHomework({ homework, onClick, setHomework }: homeworkProps) {
  const dueDate = useMemo(
    () => (homework.due_date ? homework.due_date : null),
    [homework.due_date],
  );

  const dueDateStr = useMemo(() => {
    if (!dueDate) return null;

    return `${format(dueDate, "MMM dd, yyyy")}\n${format(
      dueDate,
      "hh:mm aaa",
    )}`;
  }, [dueDate]);

  const isPastDue = useMemo(
    () => (dueDate ? isPast(dueDate) : false),
    [dueDate],
  );
  const classAndSection = useMemo(
    () =>
      `Class ${homework.Class.name ?? homework.Class.numeric_id} (${
        homework.Section.name ?? homework.Section.numeric_id
      })`,
    [homework.Class.name, homework.Section.name],
  );

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box>
      <Flex justifyContent="space-between">
        <Heading size="md" textTransform="uppercase">
          {homework.Subject.name} — {classAndSection}
        </Heading>
        <Flex>
          <Button variant="outline" onClick={() => onOpen()}>
            <MdOutlineAttachFile size={24} />
            <Heading size="md" textTransform="uppercase">
              {homework.Attachments.length}
            </Heading>
          </Button>
        </Flex>
      </Flex>
      <Flex justifyContent="space-between" dir="row">
        <Box dir="flex" justifyContent="space-between">
          <Text pt="2" fontSize="lg">
            {homework.text ? homework.text : ""}
          </Text>
          <Text pt="2" fontSize="sm" color={isPastDue ? "red" : "gray.400"}>
            Due date: {"\n" + dueDateStr}
          </Text>
        </Box>

        <Button
          mt={8}
          onClick={() => {
            setHomework(homework);
            onClick();
          }}
        >
          edit
        </Button>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Attachments</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex>
              {homework.Attachments.length > 0 && (
                <Flex flexDir="column">
                  <Heading size="lg">Attachments</Heading>
                  {homework.Attachments.map((file, index) => (
                    <FilePreview file={file.File} />
                  ))}
                </Flex>
              )}
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
