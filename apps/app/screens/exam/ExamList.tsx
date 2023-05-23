import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import type { ExamItem } from "schooltalk-shared/types";
import _ from "lodash";
import { format, parseISO } from "date-fns";
import { ListItem, Divider, SpeedDial, Dialog } from "@rneui/themed";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
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
import ExamModal from "../../components/ExamModal";

const ExamComp: React.FC<{
  exam: Extract<ExamItem, { type: "exam" }>["item"];
  setIsExamUpdateModal?: (value: boolean) => void;
  setExam?: (value: Extract<ExamItem, { type: "exam" }>["item"]) => void;
}> = ({ exam, setIsExamUpdateModal, setExam }) => {
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
                borderColor: `${scheme === "dark" ? "white" : "black"}`,
                opacity: pressed ? 0.5 : 1,
              },
            ]}
            onPress={() => {
              setIsExamUpdateModal && setIsExamUpdateModal(true);
              setExam && setExam(exam);
            }}
          >
            <MaterialIcons
              name="edit"
              size={18}
              color={scheme === "dark" ? "white" : "black"}
            />
            <Text
              style={{
                textAlign: "center",
                fontWeight: "500",
                marginHorizontal: 4,
              }}
            >
              Edit
            </Text>
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
  const [isExamUpdateModal, setIsExamUpdateModal] = useState(false);
  const [exam, setExam] =
    useState<Extract<ExamItem, { type: "exam" }>["item"]>();

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

  const updateExam = trpc.school.exam.updateExam.useMutation({
    onSuccess(data) {
      query?.refetch();
    },
    onError(error, variables, context) {
      alert(error.message);
    },
  });

  if (!query) return <></>;
  if (query.isLoading || updateExam.isLoading) return <Spinner visible />;
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
              <ExamComp
                exam={item.item}
                setIsExamUpdateModal={setIsExamUpdateModal}
                setExam={setExam}
              />
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
              icon={{ name: "add", color: "white" }}
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
      )}
      <Dialog
        isVisible={isExamUpdateModal}
        onBackdropPress={() => setIsExamUpdateModal(false)}
        animationType="fade"
        overlayStyle={{ width: "95%", height: "30%" }}
      >
        <Dialog.Title title={"Update Exam"} />
        <View style={{ borderBottomWidth: 2 }}></View>
        <View style={{ height: "90%" }}>
          <ExamModal
            displayAddButton={false}
            onSubmit={(examName, tests) => {
              if (exam)
                updateExam.mutate({
                  id: exam.id,
                  name: examName,
                });
              setIsExamUpdateModal(false);
            }}
            examData={exam}
          />
        </View>
      </Dialog>
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
    textAlign: "center",
  },
  edit_delete_button: {
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    width: "100%",
    paddingVertical: 10,
  },
});
