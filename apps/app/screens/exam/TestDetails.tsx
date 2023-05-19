import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { Text, Card, Button, SpeedDial, Dialog } from "@rneui/themed";
import _ from "lodash";
import { RootStackScreenProps } from "../../utils/types/common";
import { trpc } from "../../utils/trpc";
import { View } from "../../components/Themed";
import { addMinutes, format, parseISO } from "date-fns";
import { ArrayElement } from "schooltalk-shared/types";
import { StaticRole } from "schooltalk-shared/misc";
import { useConfig } from "../../utils/config";
import TestModal from "./TestModal";

const TestDetailsScreen: React.FC<RootStackScreenProps<"TestDetails">> = ({
  route: {
    params: { testId },
  },
  navigation,
}) => {
  const config = useConfig();
  const [isActionOpen, setActionOpen] = useState(false);
  const [isTestCreateModal, setIsTestCreateModal] = useState(false);

  // Fetch the class and section the user belongs to
  const classAndSectionQuery = trpc.school.people.getStudentClass.useQuery(
    undefined,
    {
      retry(failureCount, error) {
        const statusCode = error.data?.httpStatus ?? 0;
        if (statusCode >= 500 && failureCount <= 3) {
          // If server error, retry at most 3 times
          return true;
        }
        return false;
      },
    },
  );

  const testQuery = trpc.school.exam.getTestInfo.useQuery(
    {
      testId,
      periodsFilter:
        config.activeStaticRole === StaticRole.student &&
        classAndSectionQuery.data?.Class
          ? {
              // Filter out periods (and teachers) if the user is a student
              class_id: classAndSectionQuery.data.Class.numeric_id,
              section_id:
                classAndSectionQuery.data?.Section?.numeric_id ?? undefined,
            }
          : undefined,
    },
    { enabled: classAndSectionQuery.isFetched },
  );

  const updateTest = trpc.school.exam.updateTest.useMutation({
    onSuccess() {
      navigation.replace("ExamsScreen");
    },
    onError(error) {
      alert(error.message);
    },
  });

  const deleteTest = trpc.school.exam.deleteTest.useMutation({
    onSuccess(data) {
      navigation.replace("ExamsScreen");
    },
    onError(error, variables, context) {
      alert(error.message);
    },
  });

  // Set screen title
  useEffect(() => {
    if (testQuery.isFetched && testQuery.data) {
      const subjectsCount = testQuery.data.Subjects.length;

      const firstSubject = testQuery.data.Subjects.at(0);
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

  /** Get a list of teachers that teach the given subject */
  const getSubjectTeachers = useCallback(
    (subject: ArrayElement<(typeof test)["Subjects"]>["Subject"]) => {
      const teachers = subject.Periods.map((period) => period.Teacher);
      const uniqueTeachers = _.uniqBy(teachers, (t) => t?.id);
      const nonNullTeachers: NonNullable<ArrayElement<typeof teachers>>[] = [];
      uniqueTeachers.forEach((t) => {
        if (t) nonNullTeachers.push(t);
      });
      return nonNullTeachers;
    },
    [],
  );

  if (classAndSectionQuery.isLoading || testQuery.isLoading || !testQuery.data)
    return <Spinner visible />;

  const { data: test } = testQuery;

  const isTeacher = config.activeStaticRole === StaticRole.teacher;

  return (
    <View style={styles.container}>
      <Spinner visible={updateTest.isLoading || deleteTest.isLoading} />
      <ScrollView>
        <Card>
          <Card.Title>Subject{test.Subjects.length > 1 ? "s" : ""}</Card.Title>
          <Card.Divider />
          {test.Subjects.map(({ Subject }) => {
            const teachers = getSubjectTeachers(Subject);
            return (
              <View key={Subject.id} style={styles.singleSubject}>
                <Text>{Subject.name}</Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.subjectTeacher,
                    { opacity: pressed ? 0.5 : 1 },
                  ]}
                  onPress={() => {
                    Alert.alert(
                      "List of teachers",
                      `${teachers
                        .map((t, i) => `${i + 1}. ${t.User?.name}`)
                        .join("\n")}`,
                    );
                  }}
                >
                  <Text>({teachers.length} teachers)</Text>
                </Pressable>
              </View>
            );
          })}

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

        {test.Exam ? (
          <Card>
            <Card.Title>Exam: {test.Exam.name}</Card.Title>
            <Card.Divider />
            <Button
              onPress={() => {
                if (test.Exam) {
                  navigation.navigate("ExamDetails", {
                    examId: test.Exam.id,
                  });
                }
              }}
            >
              View full schedule
            </Button>
          </Card>
        ) : null}
        {/* update test */}
        <View style={{ width: "100%" }}>
          <Dialog
            isVisible={isTestCreateModal}
            onBackdropPress={() => setIsTestCreateModal(false)}
            animationType="fade"
            overlayStyle={{ width: "95%" }}
          >
            <Dialog.Title title={"Update Test"} />
            <View style={{ borderBottomWidth: 2 }}></View>
            <TestModal
              onClose={() => setIsTestCreateModal(false)}
              onSubmit={(test) => {
                updateTest.mutate({
                  id: testQuery.data.id,
                  data: test,
                });
              }}
              testData={testQuery.data ?? null}
            />
          </Dialog>
        </View>

        <View style={styles.gap} />
      </ScrollView>
      <SpeedDial
        isOpen={isActionOpen}
        icon={{ name: "menu", color: "white" }}
        openIcon={{ name: "close", color: "white" }}
        onOpen={() => setActionOpen(true)}
        onClose={() => setActionOpen(false)}
        buttonStyle={{ backgroundColor: "#4E48B2" }}
      >
        {[
          <SpeedDial.Action
            icon={{ name: "edit", color: "white" }}
            title="Edit"
            onPress={() => {
              setIsTestCreateModal(true);
            }}
            buttonStyle={{ backgroundColor: "#4E48B2" }}
            key={1}
          />,
          <SpeedDial.Action
            icon={{ name: "delete", color: "white" }}
            title="Delete"
            onPress={() => {
              Alert.alert("Delete", "Do you want to delete this homework?", [
                {
                  text: "Delete",
                  style: "destructive",
                  onPress(value) {
                    deleteTest.mutate({ id: testId });
                  },
                },
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress(value) {
                    setActionOpen(false);
                  },
                },
              ]);
            }}
            buttonStyle={{ backgroundColor: "#4E48B2" }}
            key={2}
          />,
        ]}
      </SpeedDial>
    </View>
  );
};

export default TestDetailsScreen;

const styles = StyleSheet.create({
  singleSubject: {
    flexDirection: "row",
  },
  subjectTeacher: {
    marginLeft: 8,
  },
  container: {
    height: "100%",
  },
  gap: {
    height: 100,
  },
});
