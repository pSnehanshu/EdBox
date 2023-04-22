import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getUserRoleHierarchical,
  hasUserStaticRoles,
  StaticRole,
} from "schooltalk-shared/misc";
import { RootStackParamList } from "../../utils/types/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { List, Text, View } from "../../components/Themed";
import { FAB } from "@rneui/themed";
import { Homework } from "schooltalk-shared/types";
import { format, parseISO, isPast } from "date-fns";
import { trpc } from "../../utils/trpc";
import { useCurrentUser } from "../../utils/auth";
import { LottieAnimation } from "../../components/LottieAnimation";

const pageLimit = 10;

export default function HomeWorkScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "HomeWorkScreen">) {
  const { user } = useCurrentUser();
  const role = getUserRoleHierarchical(user);
  const isStudent = hasUserStaticRoles(user, [StaticRole.student], "all");
  const isTeacher = hasUserStaticRoles(user, [StaticRole.teacher], "all");

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

  const query =
    role === StaticRole.teacher ? homeworkTeacherQuery : homeworkSectionQuery;

  const homeworks: Homework[] = [];
  query.data?.pages.forEach((page) => {
    homeworks.push(...page.data);
  });

  return (
    <View style={{ flex: 1, marginTop: 0 }}>
      <List
        data={homeworks}
        keyExtractor={(g) => g.id}
        estimatedItemSize={200}
        renderItem={({ item }) => (
          <SingleHomework
            homework={item}
            onClick={() =>
              navigation.navigate("DisplayHomeworkScreen", {
                homeworkId: item.id,
              })
            }
          />
        )}
        onRefresh={() => {
          if (isTeacher) homeworkTeacherQuery.refetch();
          if (canFetchSectionHW) homeworkSectionQuery.refetch();
        }}
        refreshing={
          homeworkTeacherQuery.isFetching || homeworkSectionQuery.isFetching
        }
        onEndReached={() => {
          query.fetchNextPage();
        }}
        onEndReachedThreshold={1}
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator size="large" style={{ margin: 16 }} />
          ) : null
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <LottieAnimation
            src={require("../../assets/lotties/person-floating.json")}
            caption="No homeworks"
            style={styles.empty}
          />
        }
      />

      {isTeacher && (
        <FAB
          icon={<Ionicons name="add" size={24} color="white" />}
          buttonStyle={{ backgroundColor: "#4E48B2" }}
          onPress={() => navigation.navigate("CreateHomeworkScreen")}
          placement="right"
        />
      )}
    </View>
  );
}

interface HomeworkProps {
  homework: Homework;
  onClick: () => void;
}
function SingleHomework({ homework, onClick }: HomeworkProps) {
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
    <Pressable
      style={({ pressed }) => [styles.homework, { opacity: pressed ? 0.7 : 1 }]}
      onPress={onClick}
    >
      <View style={styles.homework_middle}>
        <Text style={styles.homework_name}>
          {homework.Subject.name} — {classAndSection}
        </Text>
        <Text style={styles.homework_description} numberOfLines={1}>
          {homework.text ? homework.text : ""}
        </Text>
        <View>
          {homework.Attachments.length > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="attach" size={16} color="gray" />
              <Text>{homework.Attachments.length}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.homework_right}>
        {dueDateStr && (
          <Text
            style={[
              styles.homework_description,
              { textAlign: "right", color: isPastDue ? "red" : "gray" },
            ]}
          >
            Due date: {"\n" + dueDateStr}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {},
  homework: {
    paddingVertical: 16,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    flex: 1,
    flexDirection: "row",
    height: 80,
    overflow: "hidden",
  },
  homework_middle: {
    backgroundColor: undefined,
    flexGrow: 1,
    paddingLeft: 16,
    maxWidth: "80%",
  },
  homework_name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  homework_right: {
    backgroundColor: undefined,
    paddingRight: 8,
    marginLeft: "auto",
  },
  homework_description: {
    fontSize: 12,
    color: "gray",
  },
  empty: {
    height: "100%",
    justifyContent: "center",
  },
});
