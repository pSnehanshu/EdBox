import { memo, useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
} from "react-native";
import { Card, Dialog } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Spinner from "react-native-loading-spinner-overlay";
import type { AttendanceStatus } from "@prisma/client";
import Toast from "react-native-toast-message";
import { RouterInput, Student } from "schooltalk-shared/types";
import _ from "lodash";
import { FlashList } from "@shopify/flash-list";
import { List, Text, TextInput, View } from "../../components/Themed";
import { RootStackScreenProps } from "../../utils/types/common";
import { trpc } from "../../utils/trpc";
import useColorScheme from "../../utils/useColorScheme";
import { format, getDate, getMonth, getYear } from "date-fns";
import { NumberMonthMapping } from "schooltalk-shared/misc";
import { LottieAnimation } from "../../components/LottieAnimation";

/** Height of a student row */
const STUDENT_ITEM_HEIGHT = 200;

interface StudentItemProps {
  student: Student;
  status?: AttendanceStatus;
  remarks?: string;
  showRemarkActions: boolean;
  onStatusSelected: (
    studentId: string,
    status: AttendanceStatus | undefined,
  ) => void;
  onAddRemarksPress: (student: Student) => void;
  onRemarks: (studentId: string, remarks: string | undefined) => void;
}
const StudentItem = memo(
  ({
    student,
    status,
    remarks,
    showRemarkActions,
    onStatusSelected,
    onAddRemarksPress,
    onRemarks,
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

          {showRemarkActions ? (
            <View style={styles.studentRemarkActions}>
              <Pressable onPress={() => onAddRemarksPress(student)}>
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
                <Pressable onPress={() => onRemarks(student.id, undefined)}>
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
          ) : null}
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
              onStatusSelected(
                student.id,
                status === "present" ? undefined : "present",
              )
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
              onStatusSelected(
                student.id,
                status === "absent" ? undefined : "absent",
              )
            }
          >
            Absent
          </MaterialCommunityIcons.Button>
        </View>
      </View>
    );
  },
);

interface RemarksEditorProps {
  isVisible: boolean;
  student?: Student;
  remarks: string;
  onRemarksSet: (studentId: string, remark: string | undefined) => void;
  onClose: () => void;
}
function RemarksEditor({
  isVisible,
  student,
  remarks,
  onRemarksSet,
  onClose,
}: RemarksEditorProps) {
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
    <Dialog isVisible={isVisible} onBackdropPress={closeRemarksDialog}>
      {student ? (
        <>
          <Dialog.Title title={student.User?.name} />
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
                if (tmpRemarks) onRemarksSet(student.id, tmpRemarks);
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

interface AttendanceInfo {
  status?: AttendanceStatus;
  remarks?: string;
}

type StudentWithAttendance = Student & { attendance?: AttendanceInfo };

export default function AttendanceTakerScreen({
  route: {
    params: { periodId },
  },
}: RootStackScreenProps<"AttendanceTaker">) {
  const utils = trpc.useContext();

  /** A ref of the list to auto-scroll */
  const studentsList = useRef<FlashList<StudentWithAttendance>>(null);

  // State to store attendance status and remarks
  const [attendance, setAttendance] = useState<Record<string, AttendanceInfo>>(
    {},
  );

  // To check if attendance already taken
  const dateToday = useMemo<
    RouterInput["school"]["attendance"]["fetchForPeriod"]["date"]
  >(() => {
    const today = new Date();
    return {
      year: getYear(today),
      month: NumberMonthMapping[getMonth(today)],
      day: getDate(today),
    };
  }, []);
  const periodAttendanceQuery = trpc.school.attendance.fetchForPeriod.useQuery({
    periodId,
    date: dateToday,
  });

  const isAttendanceTaken =
    periodAttendanceQuery.isFetched && !!periodAttendanceQuery.data;

  const attendanceTakenByTeacher =
    periodAttendanceQuery.data?.Teacher?.User?.name ?? null;

  const attendanceTakenOnDate = useMemo(() => {
    if (!periodAttendanceQuery.data?.created_at) return null;

    return format(
      new Date(periodAttendanceQuery.data.created_at),
      "do LLLL, yyyy hh:mm bbb",
    );
  }, [periodAttendanceQuery.data?.created_at]);

  // Populate attendance state if taken
  useEffect(() => {
    if (isAttendanceTaken) {
      const existingAttendance: typeof attendance = {};
      periodAttendanceQuery.data.StudentAttendances.forEach((attendance) => {
        existingAttendance[attendance.Student.id] = {
          remarks: attendance.remarks ?? undefined,
          status: attendance.status,
        };
      });
      setAttendance(existingAttendance);
    } else {
      // Reset the attendance state as it hasn't been taken
      setAttendance({});
    }
  }, [isAttendanceTaken]);

  // Fetch all students of this period -> section
  const studentsQuery =
    trpc.school.routine.fetchPeriodStudents.useInfiniteQuery(
      {
        periodId,
        limit: 20,
      },
      { getNextPageParam: (lastPage) => lastPage.cursor },
    );
  const fetchNextPage = useCallback(() => {
    studentsQuery.fetchNextPage();
  }, []);

  // Submit attendance mutation
  const submitAttendanceMutation = trpc.school.attendance.create.useMutation({
    onSuccess() {
      Toast.show({
        position: "bottom",
        type: "success",
        text1: "Attendance recorded succesfully",
        visibilityTime: 2000,
      });
      periodAttendanceQuery.refetch();
      utils.school.routine.fetchForTeacher.invalidate();

      studentsList.current?.scrollToOffset?.({
        offset: 0,
        animated: true,
      });
    },
    onError(error) {
      console.error(error);
      Toast.show({
        position: "bottom",
        type: "error",
        text1: "Something went wrong",
        text2: "Please try after sometime",
      });
    },
  });

  const students = useMemo<StudentWithAttendance[]>(() => {
    const students: StudentWithAttendance[] = [];
    studentsQuery.data?.pages.forEach((page) =>
      page.students.forEach((student) => {
        students.push({
          ...student,
          attendance: attendance[student.id],
        });
      }),
    );

    return students;
  }, [studentsQuery.fetchStatus, attendance]);

  const totalStudents = useMemo(
    () => _.last(studentsQuery.data?.pages)?.total ?? 0,
    [studentsQuery.fetchStatus],
  );

  let totalPresent = 0;
  let totalAbsent = 0;
  Object.values(attendance).forEach(({ status }) => {
    if (status === "present") totalPresent += 1;
    else if (status === "absent") totalAbsent += 1;
  });
  const totalRemaining = totalStudents - (totalPresent + totalAbsent);

  const setAttendanceStatus = useCallback(
    (studentId: string, status: AttendanceStatus | undefined) => {
      if (isAttendanceTaken) {
        return;
      }

      setAttendance((a) => ({
        ...a,
        [studentId]: {
          status,
          remarks: a[studentId]?.remarks,
        },
      }));

      // Scroll to next item
      const nextItemIndex = students.findIndex((s) => s.id === studentId) + 1;
      if (nextItemIndex < students.length)
        studentsList.current?.scrollToIndex?.({
          index: students.findIndex((s) => s.id === studentId) + 1,
          viewPosition: 0.5,
          animated: true,
        });
    },
    [students, isAttendanceTaken],
  );
  const setAttendanceRemarks = useCallback(
    (studentId: string, remarks: string | undefined) => {
      if (isAttendanceTaken) {
        return;
      }

      setAttendance((a) => ({
        ...a,
        [studentId]: {
          remarks,
          status: a[studentId]?.status,
        },
      }));
    },
    [isAttendanceTaken],
  );
  const [studentForRemarks, setStudentForRemarks] = useState<Student>();

  const submitAttendance = useCallback(() => {
    if (totalRemaining > 0) {
      Alert.alert(
        "Attendance not complete yet!",
        `Take attendance of the remaining ${totalRemaining} students before you submit.`,
      );
    } else {
      // Prepare attendance object
      const finalAttendance: Record<
        string,
        {
          status: AttendanceStatus;
          remarks?: string;
        }
      > = {};

      Object.entries(attendance).forEach(([studentId, { status, remarks }]) => {
        finalAttendance[studentId] = {
          remarks,
          status: status!,
        };
      });

      // Run the mutation
      submitAttendanceMutation.mutate({
        date: new Date().toISOString(),
        periodId,
        studentsAttendance: finalAttendance,
      });
    }
  }, [attendance, totalRemaining]);

  const refetchData = useCallback(() => {
    studentsQuery.refetch();
    periodAttendanceQuery.refetch();
  }, []);

  return (
    <View style={styles.container}>
      <Spinner
        visible={studentsQuery.isLoading || submitAttendanceMutation.isLoading}
      />

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
        onRemarksSet={setAttendanceRemarks}
      />

      {/* The list of students */}
      <List
        data={students}
        renderItem={({ item: student }) => (
          <StudentItem
            student={student}
            status={student.attendance?.status}
            remarks={student.attendance?.remarks}
            showRemarkActions={!isAttendanceTaken}
            onStatusSelected={setAttendanceStatus}
            onAddRemarksPress={setStudentForRemarks}
            onRemarks={setAttendanceRemarks}
          />
        )}
        onRefresh={refetchData}
        refreshing={studentsQuery.isFetching}
        estimatedItemSize={STUDENT_ITEM_HEIGHT}
        ListHeaderComponent={
          isAttendanceTaken ? (
            <Card containerStyle={styles.attendanceTakenAlertBox}>
              <Text>
                Attendance for this period has been taken by{" "}
                {attendanceTakenByTeacher} on {attendanceTakenOnDate}.
              </Text>
            </Card>
          ) : null
        }
        ListFooterComponent={
          <View style={styles.listFooter}>
            {studentsQuery.isFetchingNextPage ? (
              <ActivityIndicator size="large" />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          studentsQuery.isFetched ? (
            <LottieAnimation
              src={require("../../assets/lotties/tumbleweed-rolling.json")}
              caption="This class is empty like a desert!"
              style={styles.empty_animation}
            />
          ) : null
        }
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        innerRef={studentsList}
      />

      {students.length > 0 && (
        <View style={styles.submitPanel}>
          <View style={styles.submitPanelStats}>
            <Text style={{ color: "green" }}>Present: {totalPresent}</Text>
            <Text style={{ color: "red" }}>Absent: {totalAbsent}</Text>
            {isAttendanceTaken ? null : (
              <Text>Remaining: {totalRemaining}</Text>
            )}
          </View>
          <View style={styles.submitPanelBtn}>
            {isAttendanceTaken ? null : (
              <MaterialCommunityIcons.Button
                name="cloud-upload"
                size={30}
                onPress={submitAttendance}
                style={{ height: "100%" }}
              >
                Submit attendance
              </MaterialCommunityIcons.Button>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: "100%" },
  attendanceTakenAlertBox: {
    marginBottom: 16,
  },
  listFooter: {
    padding: 8,
    marginTop: 16,
    height: 100,
  },
  submitPanel: {
    flexDirection: "row",
    padding: 4,
    borderColor: "gray",
    borderTopWidth: 1,
    height: 80,
  },
  submitPanelStats: {
    flex: 1,
  },
  submitPanelBtn: {
    flex: 1,
    height: "100%",
  },
  student: {
    flex: 1,
    flexDirection: "row",
    height: STUDENT_ITEM_HEIGHT,
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
  empty_animation: {
    height: "100%",
    justifyContent: "center",
    marginHorizontal: 16,
  },
});
