import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { StaticRole } from "schooltalk-shared/misc";
import { useConfig } from "../utils/atoms";
import { trpc } from "../utils/trpc";
import { Homework } from "schooltalk-shared/types";
import { useMemo } from "react";
import { format, isPast, parseISO } from "date-fns";
import { MdOutlineAttachFile } from "react-icons/md";

const pageLimit = 10;

export default function HomeworkPage() {
  const { activeStaticRole: currentUserRole } = useConfig();
  const isStudent = currentUserRole === StaticRole.student;
  const isTeacher = currentUserRole === StaticRole.teacher;

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
          <Heading size="md">Home Works</Heading>
        </CardHeader>
        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            <Box>
              {homeworks &&
                homeworks.map((item, index) => (
                  <SingleHomework key={index} homework={item} />
                ))}
            </Box>
          </Stack>
        </CardBody>
      </Card>
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
      <Heading size="xs" textTransform="uppercase">
        {homework.Subject.name} — {classAndSection}
      </Heading>
      <Text pt="2" fontSize="sm">
        {homework.text ? homework.text : ""}
        <MdOutlineAttachFile />
        {homework.Attachments.length}
      </Text>
      <Text pt="2" fontSize="sm">
        Due date: {"\n" + dueDateStr}
      </Text>
    </>
  );
}
