import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { StaticRole } from "schooltalk-shared/misc";
import { useConfig } from "../utils/atoms";
import { trpc } from "../utils/trpc";
import { ExamItem } from "schooltalk-shared/types";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { MdOutlineAttachFile } from "react-icons/md";
import _ from "lodash";

const pageLimit = 10;

export default function ExamPage() {
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

  const studentQuery = trpc.school.exam.fetchExamsAndTestsForStudent.useQuery(
    {},
    { enabled: isStudent },
  );
  const teacherQuery = trpc.school.exam.fetchExamsAndTestsForTeacher.useQuery(
    {},
    { enabled: isTeacher },
  );

  const query =
    currentUserRole === StaticRole.student
      ? studentQuery
      : isTeacher
      ? teacherQuery
      : null;

  return (
    <Box>
      <Card>
        <CardHeader>
          <Flex dir="row" justifyContent={"space-between"}>
            <Heading size="xl">Exams</Heading>
            {isTeacher && (
              <Button
              // onClick={() => {
              //   onOpen();
              //   setHomeworkEdit(undefined);
              // }}
              >
                Create new
              </Button>
            )}
          </Flex>
        </CardHeader>
        <Divider />
        <CardBody>
          <Stack divider={<StackDivider borderColor="gray.200" />} spacing={4}>
            {query?.data &&
              query?.data.map((item, index) => {
                if (item.type === "exam")
                  return <SingleExam key={index} exam={item.item} />;
                else return <SingleTest key={index} test={item.item} />;
              })}
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
}

interface examProps {
  exam: Extract<ExamItem, { type: "exam" }>["item"];
}

function SingleExam({ exam }: examProps) {
  const Tests = exam.Tests;

  const startDate = useMemo(() => {
    const isoDate = Tests.at(0)?.date_of_exam;
    if (isoDate) {
      return format(parseISO(isoDate), "MMM d, yyyy");
    } else {
      return "N/A";
    }
  }, [Tests.at(0)?.date_of_exam]);

  const endDate = useMemo(() => {
    const isoDate = Tests.at(-1)?.date_of_exam;
    if (isoDate) {
      return format(parseISO(isoDate), "MMM d, yyyy");
    } else {
      return "N/A";
    }
  }, [Tests.at(-1)?.date_of_exam]);
  return (
    <>
      <Flex justifyContent="space-between">
        <Heading size="md" textTransform="uppercase">
          {exam.name} examination
        </Heading>
        <Flex>
          <MdOutlineAttachFile size={24} />
          <Heading size="md" textTransform="uppercase"></Heading>
        </Flex>
      </Flex>
      <Flex justifyContent="space-between" dir="row">
        <Box dir="flex" justifyContent="space-between">
          <Text pt="2" fontSize="lg">
            {startDate} - {endDate}
          </Text>
        </Box>

        <Button mt={8}>edit</Button>
      </Flex>
    </>
  );
}

interface testProps {
  test: Extract<ExamItem, { type: "test" }>["item"];
}

function SingleTest({ test }: testProps) {
  const { Subjects: _subs } = test;
  const Subjects = _.clone(test.Subjects);

  const firstSubject = Subjects.shift();
  const firstSubjectName = firstSubject
    ? firstSubject.Subject.name
    : test.subject_name ?? "N/A";

  const remainingSubjectCount = Subjects.length;

  const date = useMemo(
    () => format(parseISO(test.date_of_exam), "MMM d, yyyy hh:mm bbb"),
    [test.date_of_exam],
  );
  const duration = useMemo(() => {
    if (test.duration_minutes < 60) {
      return `${test.duration_minutes} min`;
    } else {
      const wholeHours = Math.floor(test.duration_minutes / 60);
      const mins = test.duration_minutes % 60;
      return `${wholeHours}h ${mins > 0 ? `${mins}m` : ""}`;
    }
  }, [test.duration_minutes]);
  return (
    <>
      <Flex justifyContent="space-between">
        <Heading size="md" textTransform="uppercase">
          {firstSubjectName}
          {remainingSubjectCount > 0 ? ` & ${remainingSubjectCount} more` : ""}
        </Heading>
        <Flex>
          <MdOutlineAttachFile size={24} />
          <Heading size="md" textTransform="uppercase"></Heading>
        </Flex>
      </Flex>
      <Flex justifyContent="space-between" dir="row">
        <Box dir="flex" justifyContent="space-between">
          <Text pt="2" fontSize="lg">
            {date}-{duration}
          </Text>
        </Box>

        <Button mt={8}>edit</Button>
      </Flex>
    </>
  );
}
