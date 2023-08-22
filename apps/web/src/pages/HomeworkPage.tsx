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
  Stack,
  StackDivider,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { StaticRole } from "schooltalk-shared/misc";
import { useConfig } from "../utils/atoms";
import { trpc } from "../utils/trpc";
import { Homework } from "schooltalk-shared/types";
import { useMemo } from "react";
import { format, isPast, parseISO } from "date-fns";
import { MdOutlineAttachFile, MdOutlineFileUpload } from "react-icons/md";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import HomeworkForm from "../Components/HomeworkForm";

const pageLimit = 10;

export default function HomeworkPage() {
  const { activeStaticRole: currentUserRole } = useConfig();
  const isStudent = currentUserRole === StaticRole.student;
  const isTeacher = currentUserRole === StaticRole.teacher;

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

  const query = isTeacher ? homeworkTeacherQuery : homeworkSectionQuery;

  const homeworks: Homework[] = [];
  query.data?.pages.forEach((page) => {
    homeworks.push(...page.data);
  });

  console.log(homeworks);

  return (
    <Box>
      <Card>
        <CardHeader>
          <Heading size="xl">Home Works</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <Stack divider={<StackDivider borderColor="gray.200" />} spacing={4}>
            {homeworks &&
              homeworks.map((item, index) => (
                <Box>
                  <SingleHomework key={index} homework={item} />{" "}
                </Box>
              ))}
          </Stack>
        </CardBody>
      </Card>
      <Button onClick={onOpen}>Create new HW</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <HomeworkForm />
      </Modal>
    </Box>
  );
}

interface homeworkProps {
  homework: Homework;
}

function SingleHomework({ homework }: homeworkProps) {
  const dueDate = useMemo(
    () => (homework.due_date ? parseISO(homework.due_date) : null),
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

  return (
    <>
      <Flex justifyContent="space-between">
        <Heading size="md" textTransform="uppercase">
          {homework.Subject.name} — {classAndSection}
        </Heading>
        <Flex>
          <MdOutlineAttachFile size={24} />
          <Heading size="md" textTransform="uppercase">
            {homework.Attachments.length}
          </Heading>
        </Flex>
      </Flex>

      <Text pt="2" fontSize="lg">
        {homework.text ? homework.text : ""}
      </Text>
      <Text pt="2" fontSize="sm" color={isPastDue ? "red" : "gray.400"}>
        Due date: {"\n" + dueDateStr}
      </Text>
    </>
  );
}
