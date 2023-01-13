import { memo, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Keyboard,
  ListRenderItem,
  Pressable,
  StyleSheet,
} from "react-native";
import { Dialog } from "@rneui/themed";
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
  onAddRemarksPress: () => void;
  onRemoveRemarksPress: () => void;
}
const StudentItem = memo(
  ({
    student,
    status,
    remarks,
    onStatusSelected,
    onAddRemarksPress,
    onRemoveRemarksPress,
  }: StudentItemProps) => {
    const color = useColorScheme();
    const btnBgColor = color === "dark" ? "black" : "white";

    return (
      <View style={styles.student}>
        {/* Student name and remarks */}
        <View style={styles.studentLeft}>
          <Text style={styles.studentName}>
            {student.roll_num}. {student.User?.name}
          </Text>

          {remarks ? <Text>Remarks: {remarks}</Text> : null}

          <View style={styles.studentRemarkActions}>
            <Pressable onPress={onAddRemarksPress}>
              <Text
                style={{
                  textDecorationLine: "underline",
                  color: "#09c",
                }}
              >
                {remarks ? "Edit remark" : "Add remarks"}
              </Text>
            </Pressable>

            {remarks ? (
              <Pressable onPress={onRemoveRemarksPress}>
                <Text
                  style={{
                    textDecorationLine: "underline",
                    color: "red",
                    marginLeft: 4,
                  }}
                >
                  Remove remark
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Attendance status selector */}
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

interface RemarksEditorProps {
  isVisible: boolean;
  student?: Student;
  remarks: string;
  onRemarksSet: (remark: string | undefined) => void;
  onClose: () => void;
}
function RemarksEditor({
  isVisible,
  student,
  remarks,
  onRemarksSet,
  onClose,
}: RemarksEditorProps) {
  const color = useColorScheme();
  const [tmpRemarks, setTmpRemarks] = useState<string | undefined>(undefined);
  const closeRemarksDialog = useCallback(() => {
    Keyboard.dismiss();
    setTimeout(() => {
      // For smooth keyboard closure
      onClose();
      setTmpRemarks(undefined);
    }, 300);
  }, []);

  return (
    <Dialog
      isVisible={isVisible}
      onBackdropPress={closeRemarksDialog}
      overlayStyle={{
        backgroundColor: color === "dark" ? "#222" : "white",
      }}
    >
      {student ? (
        <>
          <Dialog.Title
            title={student.User?.name}
            titleStyle={{
              color: color === "dark" ? "white" : "black",
            }}
          />
          <Text>Write attendance remarks:</Text>

          <TextInput
            autoFocus
            multiline
            numberOfLines={5}
            placeholder="Remarks"
            value={tmpRemarks === undefined ? remarks : tmpRemarks}
            style={styles.studentRemarkInput}
            onChangeText={(txt) => setTmpRemarks(txt)}
          />

          <Dialog.Actions>
            <Dialog.Button
              title="SAVE"
              onPress={() => {
                if (tmpRemarks) onRemarksSet(tmpRemarks);
                closeRemarksDialog();
              }}
              buttonStyle={{
                backgroundColor: "#09c",
                borderRadius: 3,
              }}
              containerStyle={{
                width: 100,
              }}
              titleStyle={{ color: "white" }}
            />
            <Dialog.Button
              title="cancel"
              type="clear"
              titleStyle={{ color: "red" }}
              onPress={closeRemarksDialog}
            />
          </Dialog.Actions>
        </>
      ) : null}
    </Dialog>
  );
}

export default function AttendanceTakerScreen({
  route: {
    params: { periodId },
  },
}: RootStackScreenProps<"AttendanceTaker">) {
  // TODO: Check if attendance is already taken
  const utils = trpc.useContext();
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
  const [studentForRemarks, setStudentForRemarks] = useState<Student>();

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
        onAddRemarksPress={() => setStudentForRemarks(student)}
        onRemoveRemarksPress={() =>
          setAttendance((a) => ({
            ...a,
            [student.id]: {
              remarks: undefined,
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
    <View style={styles.container}>
      {/* Why is this not inside <StudentItem />? Answer: https://stackoverflow.com/q/62825753/9990365 */}
      <RemarksEditor
        student={studentForRemarks}
        remarks={
          studentForRemarks
            ? attendance[studentForRemarks.id]?.remarks ?? ""
            : ""
        }
        isVisible={!!studentForRemarks}
        onClose={() => setStudentForRemarks(undefined)}
        onRemarksSet={(remarks) => {
          if (studentForRemarks) {
            setAttendance((a) => ({
              ...a,
              [studentForRemarks.id]: {
                remarks: remarks?.trim(),
                status: a[studentForRemarks.id]?.status,
              },
            }));
          }
        }}
      />

      {/* The list of students */}
      <List
        data={students}
        renderItem={renderItem}
        onRefresh={utils.school.routine.fetchPeriodStudents.invalidate}
        refreshing={studentsQuery.isFetching}
        ListFooterComponent={
          <View style={styles.listFooter}>
            {studentsQuery.isFetchingNextPage ? (
              <ActivityIndicator size="large" />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          studentsQuery.isFetched ? <Text>No students here!</Text> : null
        }
        onEndReached={() => studentsQuery.fetchNextPage()}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: "100%" },
  listFooter: {
    padding: 8,
    marginTop: 16,
    height: 100,
  },
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
    paddingRight: 4,
    justifyContent: "space-between",
  },
  studentName: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 8,
  },
  studentRemarkActions: {
    flexDirection: "row",
  },
  studentRemarkInput: {
    borderColor: "gray",
    borderWidth: 0.5,
    width: "100%",
    height: 100,
    textAlignVertical: "top",
    padding: 4,
    marginVertical: 4,
  },
  studentRemarkBtns: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "red",
    borderWidth: 1.5,
  },
  studentStatusSelector: {
    flex: 1,
  },
  studentStatusButton: {
    backgroundColor: "white",
    flexBasis: "50%",
  },
});
