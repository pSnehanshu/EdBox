// This screen shows a time line with the exams and class tests

import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import type { ExamItem } from "schooltalk-shared/types";
import _ from "lodash";
import { format, parseISO } from "date-fns";
import { ListItem, Divider } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { List, Text, View } from "../../../components/Themed";
import { trpc } from "../../../utils/trpc";
import useColorScheme from "../../../utils/useColorScheme";
import { useNavigation } from "@react-navigation/native";

const ExamComp: React.FC<{
  exam: Extract<ExamItem, { type: "exam" }>["item"];
}> = ({ exam }) => {
  const { Tests } = exam;
  const [isExpanded, setExpanded] = useState(false);
  const scheme = useColorScheme();

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
    <ListItem.Accordion
      content={
        <View style={styles.examHeading}>
          <ListItem.Content>
            <ListItem.Title>{exam.name} examination</ListItem.Title>
          </ListItem.Content>
          <ListItem.Subtitle>
            {startDate} - {endDate}
          </ListItem.Subtitle>
        </View>
      }
      bottomDivider
      isExpanded={isExpanded}
      onPress={() => setExpanded((v) => !v)}
      icon={
        <MaterialCommunityIcons
          name="chevron-down"
          size={24}
          color={scheme === "dark" ? "white" : "black"}
        />
      }
    >
      {Tests.map((test) => (
        <ListItem key={test.id} bottomDivider>
          <ListItem.Content>
            <TestComp test={{ ...test, Exam: null }} style={{ padding: 8 }} />
          </ListItem.Content>
        </ListItem>
      ))}
    </ListItem.Accordion>
  );
};

const TestComp: React.FC<{
  test: Extract<ExamItem, { type: "test" }>["item"];
  style?: StyleProp<ViewStyle>;
}> = ({ test, style }) => {
  const navigation = useNavigation();
  const { Subjects: _subs } = test;
  const Subjects = _.clone(_subs);

  const firstSubject = Subjects.shift();
  const firstSubjectName = firstSubject
    ? firstSubject.Subject.name
    : test.subject_name ?? "N/A";

  const remainingSubjectCount = Subjects.length;

  const date = useMemo(
    () => format(parseISO(test.date_of_exam), "MMM d, yyyy hh:mm bbb"),
    [test.date_of_exam]
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
      onPress={() =>
        navigation.navigate("ExamDetailsStudent", { testId: test.id })
      }
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

const ExamListScreen: React.FC = () => {
  const query = trpc.school.exam.fetchExamsAndTestsForStudent.useQuery({});

  if (query.isLoading) return <Spinner visible />;

  return (
    <SafeAreaView style={styles.container}>
      <List
        onRefresh={() => query.refetch()}
        refreshing={query.isFetching}
        data={query.data}
        keyExtractor={({ item, type }) => `${type}-${item.id}`}
        ItemSeparatorComponent={Divider}
        renderItem={({ item }) =>
          item.type === "exam" ? (
            <ExamComp exam={item.item} />
          ) : (
            <TestComp test={item.item} />
          )
        }
      />
    </SafeAreaView>
  );
};

export default ExamListScreen;

const styles = StyleSheet.create({
  container: {},
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
  examHeading: {
    width: "90%",
  },
});
