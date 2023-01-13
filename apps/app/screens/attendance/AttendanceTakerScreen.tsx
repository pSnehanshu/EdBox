import {
  ComponentProps,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
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

/** Height of a student row */
const STUDENT_ITEM_HEIGHT: number = 200;

interface StudentItemProps {
  student: Student;
  status?: AttendanceStatus;
  remarks?: string;
  onStatusSelected: (
    studentId: string,
    status: AttendanceStatus | undefined
  ) => void;
  onAddRemarksPress: (student: Student) => void;
  onRemarks: (studentId: string, remarks: string | undefined) => void;
}
const StudentItem = memo(
  ({
    student,
    status,
    remarks,
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
                status === "present" ? undefined : "present"
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
                status === "absent" ? undefined : "absent"
              )
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

const getItemLayout: NonNullable<
  ComponentProps<typeof List<Student>>["getItemLayout"]
> = (_student, index) => ({
  length: STUDENT_ITEM_HEIGHT,
  offset: STUDENT_ITEM_HEIGHT * index,
  index,
});

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
        limit: 4,
      },
      { getNextPageParam: (lastPage) => lastPage.cursor }
    );
  const fetchNextPage = useCallback(() => {
    studentsQuery.fetchNextPage();
  }, []);

  const students = useMemo<Student[]>(() => {
    const students: Student[] = [];
    studentsQuery.data?.pages.forEach((page) =>
      students.push(...page.students)
    );

    return students;
  }, [studentsQuery.fetchStatus]);

  const studentsList = useRef<FlatList<Student>>();
  const [attendance, setAttendance] = useState<
    Record<
      string,
      {
        status?: AttendanceStatus;
        remarks?: string;
      }
    >
  >({});
  const setAttendanceStatus = useCallback(
    (studentId: string, status: AttendanceStatus | undefined) => {
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
        });
    },
    [students]
  );
  const setAttendanceRemarks = useCallback(
    (studentId: string, remarks: string | undefined) => {
      setAttendance((a) => ({
        ...a,
        [studentId]: {
          remarks,
          status: a[studentId]?.status,
        },
      }));
    },
    []
  );
  const [studentForRemarks, setStudentForRemarks] = useState<Student>();

  const renderItem = useCallback<ListRenderItem<Student>>(
    ({ item: student }) => (
      <StudentItem
        student={student}
        status={attendance[student.id]?.status}
        remarks={attendance[student.id]?.remarks}
        onStatusSelected={setAttendanceStatus}
        onAddRemarksPress={setStudentForRemarks}
        onRemarks={setAttendanceRemarks}
      />
    ),
    [attendance]
  );

  if (studentsQuery.isLoading) return <Spinner visible />;

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
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        getItemLayout={getItemLayout}
        innerRef={studentsList as any}
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
});
