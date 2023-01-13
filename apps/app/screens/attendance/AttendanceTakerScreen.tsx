import { memo, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ListRenderItem,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Spinner from "react-native-loading-spinner-overlay";
import type { AttendanceStatus } from "@prisma/client";
import { Student } from "schooltalk-shared/types";
import { List, Text, TextInput, View } from "../../components/Themed";
import { RootStackScreenProps } from "../../types";
import { trpc } from "../../utils/trpc";
import useColorScheme from "../../utils/useColorScheme";

interface StudentItemProps {
  student: Student;
  status?: AttendanceStatus;
  remarks?: string;
  onStatusSelected: (status: AttendanceStatus | undefined) => void;
  onRemarksSet: (remarks: string | undefined) => void;
}
const StudentItem = memo(
  ({ student, onStatusSelected, status }: StudentItemProps) => {
    const color = useColorScheme();
    const btnBgColor = color === "dark" ? "black" : "white";

    return (
      <View style={styles.student}>
        <View style={styles.studentLeft}>
          <Text style={styles.studentName}>
            {student.roll_num}. {student.User?.name}
          </Text>

          <TextInput placeholder="Remarks" />
        </View>

        <View style={styles.studentStatusSelector}>
          <MaterialCommunityIcons.Button
            name="hand-back-left"
            size={36}
            color={status === "present" ? "white" : "green"}
            style={{
              ...styles.studentStatusButton,
              backgroundColor: status === "present" ? "green" : btnBgColor,
            }}
            onPress={() =>
              onStatusSelected(status === "present" ? undefined : "present")
            }
          >
            Present
          </MaterialCommunityIcons.Button>
          <MaterialCommunityIcons.Button
            name="hand-back-left-off"
            size={36}
            color={status === "absent" ? "white" : "red"}
            style={{
              ...styles.studentStatusButton,
              backgroundColor: status === "absent" ? "red" : btnBgColor,
            }}
            onPress={() =>
              onStatusSelected(status === "absent" ? undefined : "absent")
            }
          >
            Absent
          </MaterialCommunityIcons.Button>
        </View>
      </View>
    );
  }
);

export default function AttendanceTakerScreen({
  route: {
    params: { periodId },
  },
}: RootStackScreenProps<"AttendanceTaker">) {
  // TODO: Check if attendance is already taken

  const studentsQuery =
    trpc.school.routine.fetchPeriodStudents.useInfiniteQuery(
      {
        periodId,
        limit: 20,
      },
      { getNextPageParam: (lastPage) => lastPage.cursor }
    );

  const [attendance, setAttendance] = useState<
    Record<
      string,
      {
        status?: AttendanceStatus;
        remarks?: string;
      }
    >
  >({});

  const renderItem = useCallback<ListRenderItem<Student>>(
    ({ item: student }) => (
      <StudentItem
        student={student}
        status={attendance[student.id]?.status}
        remarks={attendance[student.id]?.remarks}
        onStatusSelected={(status) =>
          setAttendance((a) => ({
            ...a,
            [student.id]: {
              remarks: a[student.id]?.remarks,
              status,
            },
          }))
        }
        onRemarksSet={(remarks) =>
          setAttendance((a) => ({
            ...a,
            [student.id]: {
              remarks: remarks,
              status: a[student.id]?.status,
            },
          }))
        }
      />
    ),
    [attendance]
  );

  if (studentsQuery.isLoading) return <Spinner visible />;

  const students: Student[] = [];
  studentsQuery.data?.pages.forEach((page) => students.push(...page.students));

  return (
    <View>
      <List
        data={students}
        renderItem={renderItem}
        ListFooterComponent={
          <View>
            {studentsQuery.isFetchingNextPage ? (
              <ActivityIndicator />
            ) : studentsQuery.hasNextPage ? (
              <Button
                title="Load more"
                onPress={() => studentsQuery.fetchNextPage()}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          studentsQuery.isFetched ? <Text>No students here!</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  student: {
    flex: 1,
    flexDirection: "row",
    height: 200,
    padding: 8,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },
  studentLeft: {
    flex: 2,
  },
  studentName: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 8,
  },
  studentStatusSelector: {
    flex: 1,
  },
  studentStatusButton: {
    backgroundColor: "white",
    flexBasis: "50%",
  },
});
