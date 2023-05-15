import React, { useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import type { ExamItem } from "schooltalk-shared/types";
import _ from "lodash";
import { format, parseISO } from "date-fns";
import { ListItem, Divider, FAB, SpeedDial } from "@rneui/themed";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { List, Text, View } from "../../components/Themed";
import { trpc } from "../../utils/trpc";
import useColorScheme from "../../utils/useColorScheme";
import { TestComp } from "../../components/TestComp";
import { StaticRole } from "schooltalk-shared/misc";
import { Banner } from "../../components/Banner";
import { LottieAnimation } from "../../components/LottieAnimation";
import { useConfig } from "../../utils/config";
import { RootStackParamList } from "../../utils/types/common";

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
      <ListItem bottomDivider>
        <ListItem.Content style={styles.edit_delete_container}>
          <Pressable
            style={({ pressed }) => [
              styles.edit_delete_button,
              {
                opacity: pressed ? 0.5 : 1,
              },
            ]}
          >
            <Text style={{ textAlign: "center" }}>Delete</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.edit_delete_button,
              {
                opacity: pressed ? 0.5 : 1,
              },
            ]}
          >
            <Text style={{ textAlign: "center" }}>Edit</Text>
          </Pressable>
        </ListItem.Content>
      </ListItem>
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

const ExamListScreen: React.FC<
  NativeStackScreenProps<RootStackParamList, "ExamsScreen">
> = ({ navigation }) => {
  const config = useConfig();
  const [isActionOpen, setActionOpen] = useState(false);

  const isTeacher = config.activeStaticRole === StaticRole.teacher;
  const isStudent = config.activeStaticRole === StaticRole.student;

  const studentQuery = trpc.school.exam.fetchExamsAndTestsForStudent.useQuery(
    {},
    { enabled: isStudent },
  );
  const teacherQuery = trpc.school.exam.fetchExamsAndTestsForTeacher.useQuery(
    {},
    { enabled: isTeacher },
  );

  const query =
    config.activeStaticRole === StaticRole.student
      ? studentQuery
      : isTeacher
      ? teacherQuery
      : null;

  if (!query) return <></>;
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
      {isTeacher && (
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
              title="Create Exam"
              onPress={() => navigation.navigate("CreateExamScreen")}
              buttonStyle={{ backgroundColor: "#4E48B2" }}
              key={1}
            />,
            <SpeedDial.Action
              icon={{ name: "edit", color: "white" }}
              title="Create Test"
              onPress={() => navigation.navigate("CreateTestScreen")}
              buttonStyle={{ backgroundColor: "#4E48B2" }}
              key={3}
            />,
          ]}
        </SpeedDial>
        // <FAB
        //   icon={<Ionicons name="add" size={24} color="white" />}
        //   buttonStyle={{ backgroundColor: "#4E48B2" }}
        //   onPress={() => navigation.navigate("CreateExamScreen")}
        //   placement="right"
        // />
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
  edit_delete_container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    textAlign: "center",
  },
  edit_delete_button: { borderWidth: 1, width: "50%", paddingVertical: 10 },
});
