import { useEffect, useState } from "react";
import { FAB, ListItem } from "@rneui/themed";
import React from "react";
import { Text, View } from "../../components/Themed";
import useColorScheme from "../../utils/useColorScheme";
import {
  ClassWithSections,
  ExamTest,
  Section,
  Subject,
} from "schooltalk-shared/types";
import { trpc } from "../../utils/trpc";
import { Switch } from "@rneui/themed";
import { CustomSelect } from "../../components/CustomSelect";
import { Pressable, StyleSheet } from "react-native";
import { useConfig } from "../../utils/config";
import DatePicker from "react-native-date-picker";
import { format, parseISO } from "date-fns";
import type { ExamTestSchema } from "schooltalk-shared/misc";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { CustomSlider } from "../../components/CustomSlider";
import { MaterialIcons } from "@expo/vector-icons";

interface TestModalProps {
  onClose?: () => void;
  onSubmit: (test: ExamTestSchema) => void;
  testData?: ExamTest | ExamTestSchema | null;
}

export default function TestModal({
  onClose,
  onSubmit,
  testData,
}: TestModalProps) {
  const config = useConfig();

  const [multiselectSub, setMultiselectSub] = useState(false);
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";

  const [mark, setMark] = useState(testData?.total_marks ?? 25);
  const [duration, setDuration] = useState(testData?.duration_minutes ?? 30);
  const [selectedClass, setSelectedClass] = useState<ClassWithSections>();
  const [selectedSection, setSelectedSection] = useState<
    Section | string | undefined
  >("All sections");
  const [dueDate, setDueDate] = useState(
    testData?.date_of_exam ? parseISO(testData.date_of_exam) : undefined,
  );
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);

  const subjectsQuery = trpc.school.subject.fetchSubjects.useQuery({}, {});

  useEffect(() => {
    if (testData?.section_id)
      setSelectedSection(
        selectedClass?.Sections.find(
          (d) => d.numeric_id === testData?.section_id,
        ),
      );
  }, [selectedClass, testData?.section_id]);

  useEffect(() => {
    let tempSubjectArray: string[] = [];
    if (testData && "Subjects" in testData) {
      tempSubjectArray = testData?.Subjects.map((e) => {
        return e.Subject.id;
      });
    } else {
      tempSubjectArray = testData?.subjectIds ?? [];
    }
    if (tempSubjectArray && tempSubjectArray?.length > 1) {
      setMultiselectSub(true);
    }
    if (subjectsQuery.data)
      setSelectedSubjects(
        subjectsQuery?.data.filter((obj) => tempSubjectArray?.includes(obj.id)),
      );
  }, [subjectsQuery.data]);

  const classesAndSectionsData =
    trpc.school.class.fetchClassesAndSections.useQuery(
      { schoolId: config.schoolId },
      {
        cacheTime: 0,
        onSuccess(data) {
          setSelectedClass((c) => {
            if (c) return c;
            return data.find((d) => d.numeric_id === testData?.class_id);
          });
        },
      },
    );

  const sectionsOptions = ["All sections", ...(selectedClass?.Sections ?? [])];

  return (
    <View style={{ height: "95%" }}>
      <CustomSelect
        isSingle
        title="Class"
        items={classesAndSectionsData.data}
        selected={selectedClass}
        onSubmit={(item) => {
          setSelectedClass(item);
        }}
        idExtractor={(item) => item.numeric_id}
        labelExtractor={(item) => `Class ${item.name ?? item.numeric_id}`}
        style={{ flexGrow: 1 }}
        isLoading={classesAndSectionsData.isLoading}
      />
      <CustomSelect
        isSingle
        title="Section"
        items={sectionsOptions}
        selected={selectedSection}
        onSubmit={setSelectedSection}
        idExtractor={(item) =>
          typeof item === "string" ? item : item.numeric_id
        }
        labelExtractor={(item) =>
          typeof item === "string"
            ? item
            : `Section ${item.name ?? item.numeric_id}`
        }
        style={{ flexGrow: 1 }}
      />

      {multiselectSub ? (
        <CustomSelect<Subject>
          isSingle={false}
          title="Subject"
          items={subjectsQuery.data}
          selected={selectedSubjects}
          onSubmit={(items) => setSelectedSubjects(items)}
          idExtractor={(item) => item.id}
          labelExtractor={(item) => `${item.name}`}
          style={{ flexGrow: 1 }}
          isLoading={subjectsQuery.isLoading}
        />
      ) : (
        <CustomSelect
          isSingle
          title="Subject"
          items={subjectsQuery.data}
          selected={selectedSubjects.at(0)}
          onSubmit={(item) => setSelectedSubjects([item])}
          idExtractor={(item) => item.id}
          labelExtractor={(item) => `${item.name}`}
          style={{ flexGrow: 1 }}
          isLoading={subjectsQuery.isLoading}
        />
      )}

      <View
        style={{
          marginLeft: 16,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ textAlignVertical: "center", textAlign: "center" }}>
          Select Multiple Subjects
        </Text>

        <Switch
          trackColor={{ true: "#3bde50", false: "#f5f6fc" }}
          thumbColor="#FFF"
          value={multiselectSub}
          onValueChange={setMultiselectSub}
        />
      </View>
      <DatePicker
        modal
        open={datePickerVisible}
        date={dueDate ?? new Date()}
        mode="datetime"
        title="Select due date"
        theme={scheme}
        minimumDate={new Date()}
        onConfirm={(date) => {
          setDueDate(date);
          setDatePickerVisible(false);
        }}
        onCancel={() => {
          setDatePickerVisible(false);
        }}
      />
      <Pressable
        onPress={() => setDatePickerVisible((v) => !v)}
        style={({ pressed }) => ({
          opacity: pressed ? 0.2 : 1,
        })}
      >
        <ListItem>
          <ListItem.Content>
            <ListItem.Title>Exam date</ListItem.Title>
            <ListItem.Subtitle>
              {dueDate
                ? format(dueDate, "MMM dd, yyyy hh:mm aaa")
                : "No exam date"}
            </ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      </Pressable>
      <CustomSlider
        title={"Total Marks"}
        defaultValue={mark ?? 25}
        onSetValue={setMark}
        minValue={0}
        maxValue={100}
      />
      <CustomSlider
        title={"Duration(min)"}
        defaultValue={duration ?? 30}
        onSetValue={setDuration}
        minValue={0}
        maxValue={180}
      />
      <FAB
        buttonStyle={{ backgroundColor: "#4E48B2" }}
        onPress={() => {
          if (
            selectedClass &&
            selectedSection &&
            selectedSubjects.length > 0 &&
            mark &&
            dueDate &&
            duration
          ) {
            // If multiple subjects not selected, then only send the first
            let subjectIds = selectedSubjects.map((s) => s.id);
            if (!multiselectSub && subjectIds.length > 1) {
              subjectIds = [subjectIds[0]];
            }

            onSubmit({
              class_id: selectedClass?.numeric_id,
              section_id:
                typeof selectedSection === "string"
                  ? undefined
                  : selectedSection?.numeric_id,
              date_of_exam: dueDate.toISOString(),
              duration_minutes: duration,
              subjectIds,
              total_marks: mark,
            });
            onClose?.();
          } else {
            Toast.show({
              type: "error",
              text1: "Insufficient Data",
            });
          }
        }}
        icon={<MaterialIcons name={"check"} size={24} color={"white"} />}
        placement="right"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button_container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginHorizontal: 16,
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#4E48B2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 3,
  },
  text_input: {
    borderWidth: 1,
    width: "80%",
    borderRadius: 3,
    paddingHorizontal: 10,
  },
  text_input_font: {
    fontSize: 16,
  },
  slider_container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    alignItems: "stretch",
    justifyContent: "center",
  },
});
