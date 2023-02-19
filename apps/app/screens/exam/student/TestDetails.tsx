import { useEffect, useMemo } from "react";
import { ScrollView } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { Text, Card, Button } from "@rneui/themed";
import { RootStackScreenProps } from "../../../utils/types/common";
import { trpc } from "../../../utils/trpc";
import { View } from "../../../components/Themed";
import { addMinutes, format, parseISO } from "date-fns";

const TestDetailsStudentScreen: React.FC<
  RootStackScreenProps<"TestDetailsStudent">
> = ({
  route: {
    params: { testId },
  },
  navigation,
}) => {
  const testQuery = trpc.school.exam.getTestInfo.useQuery({ testId });

  // Set screen title
  useEffect(() => {
    if (testQuery.isFetched && testQuery.data) {
      const subjectsCount = testQuery.data.Subjects.length;

      const firstSubject = testQuery.data.Subjects.at(0)!;
      const firstSubjectName = firstSubject
        ? firstSubject.Subject.name
        : testQuery.data?.subject_name ?? "N/A";

      const remainingSubjectCount = subjectsCount > 0 ? subjectsCount - 1 : 0;

      navigation.setOptions({
        title: `${firstSubjectName}${
          remainingSubjectCount > 0 ? ` and ${remainingSubjectCount} more` : ""
        }`,
      });
    }
  }, [testQuery.isFetching]);

  // Preparing timing data
  const [date, startTime, endTime, duration] = useMemo(() => {
    const { data: test } = testQuery;

    if (test) {
      const dateOfExam = parseISO(test.date_of_exam);
      const dateFormatted = format(dateOfExam, "MMMM d, yyyy");
      const startTimeFormatted = format(dateOfExam, "hh:mm bb");
      const endTime = addMinutes(dateOfExam, test.duration_minutes);
      const endTimeFormatted = format(endTime, "hh:mm bb");

      const duration = (() => {
        if (test.duration_minutes < 60) {
          return `${test.duration_minutes} min`;
        } else {
          const wholeHours = Math.floor(test.duration_minutes / 60);
          const mins = test.duration_minutes % 60;
          return `${wholeHours}h ${mins > 0 ? `${mins}m` : ""}`;
        }
      })();

      return [dateFormatted, startTimeFormatted, endTimeFormatted, duration];
    }

    return ["", "", "", ""];
  }, [testQuery.data?.date_of_exam]);

  if (testQuery.isLoading || !testQuery.data) return <Spinner visible />;

  const { data: test } = testQuery;

  return (
    <ScrollView>
      <Card>
        <Card.Title>Subject{test.Subjects.length > 1 ? "s" : ""}</Card.Title>
        <Card.Divider />
        {test.Subjects.map(({ Subject }) => (
          <View key={Subject.id}>
            <Text>{Subject.name}</Text>
          </View>
        ))}

        {test.subject_name && (
          <View>
            <Text>{test.subject_name}</Text>
          </View>
        )}
      </Card>

      <Card>
        <Card.Title>Date and time</Card.Title>
        <Card.Divider />
        <Text>{date}</Text>
        <Text>
          {startTime} - {endTime} ({duration})
        </Text>
      </Card>

      {test.Exam && (
        <Card>
          <Card.Title>Exam: {test.Exam.name}</Card.Title>
          <Card.Divider />
          <Button
            onPress={() =>
              navigation.navigate("ExamDetailsStudent", {
                examId: test.Exam?.id!,
              })
            }
          >
            View full schedule
          </Button>
        </Card>
      )}
    </ScrollView>
  );
};

export default TestDetailsStudentScreen;
