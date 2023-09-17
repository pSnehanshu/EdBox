import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text } from "@rneui/themed";
import { format } from "date-fns";
import _ from "lodash";
import { useMemo } from "react";
import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import type { ExamItem } from "schooltalk-shared/types";
import type { RootStackParamList } from "../utils/types/common";
import { View } from "./Themed";

export const TestComp: React.FC<{
  test: Extract<ExamItem, { type: "test" }>["item"];
  style?: StyleProp<ViewStyle>;
}> = ({ test, style }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { Subjects: _subs } = test;
  const Subjects = _.clone(_subs);

  const firstSubject = Subjects.shift();
  const firstSubjectName = firstSubject
    ? firstSubject.Subject.name
    : test.subject_name ?? "N/A";

  const remainingSubjectCount = Subjects.length;

  const date = useMemo(
    () => format(test.date_of_exam, "MMM d, yyyy hh:mm bbb"),
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
    <Pressable
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        width: "100%",
      })}
      onPress={() => navigation.push("TestDetails", { testId: test.id })}
    >
      <View style={[styles.testContainer, style]}>
        <View style={styles.testContainerMain}>
          <Text style={styles.testName}>
            {firstSubjectName}
            {remainingSubjectCount > 0
              ? ` & ${remainingSubjectCount} more`
              : ""}
          </Text>
          <Text>{date}</Text>
        </View>
        <View style={styles.testContainerRight}>
          <Text>{duration}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  testContainer: {
    padding: 16,
    flexDirection: "row",
    flex: 1,
  },
  testContainerMain: {
    flexGrow: 1,
  },
  testContainerRight: {},
  testName: {
    fontWeight: "bold",
  },
});
