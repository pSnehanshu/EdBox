// This screen shows a time line with the exams and class tests

import React, { useMemo, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import type { ExamItem } from "schooltalk-shared/types";
import _ from "lodash";
import { format, parseISO } from "date-fns";
import { ListItem, Divider } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { List, Text, View } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import useColorScheme from "../../utils/useColorScheme";
import { TestComp } from "../../components/TestComp";
import { useCurrentUser } from "../../utils/auth";
import { getUserRoleHierarchical, StaticRole } from "schooltalk-shared/misc";
import { Banner } from "../../components/Banner";
import { LottieAnimation } from "../../components/LottieAnimation";

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
            <TestComp test={test} style={{ padding: 8 }} />
          </ListItem.Content>
        </ListItem>
      ))}
    </ListItem.Accordion>
  );
};

const ExamListScreen: React.FC = () => {
  const { user } = useCurrentUser();
  const hierarchicalRole = getUserRoleHierarchical(user);

  const query =
    hierarchicalRole === StaticRole.student
      ? trpc.school.exam.fetchExamsAndTestsForStudent.useQuery({})
      : trpc.school.exam.fetchExamsAndTestsForTeacher.useQuery({});

  if (query.isLoading) return <Spinner visible />;
  if (query.isError)
    return <Banner text="Failed to fetch exams!" type="error" />;

  return (
    <SafeAreaView style={styles.container}>
      {query.data.length > 0 ? (
        <List
          onRefresh={() => query.refetch()}
          refreshing={query.isFetching}
          data={query.data}
          estimatedItemSize={77}
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
      ) : (
        <LottieAnimation
          src={require("../../assets/lotties/person-floating.json")}
          caption="No upcoming exams"
          style={styles.no_exam_animation}
        />
      )}
    </SafeAreaView>
  );
};

export default ExamListScreen;

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  examHeading: {
    width: "90%",
  },
  no_exam_animation: {
    height: "100%",
    justifyContent: "center",
  },
});
