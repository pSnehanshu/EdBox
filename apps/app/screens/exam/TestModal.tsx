import { useMemo, useState } from "react";
import { Dialog, ListItem } from "@rneui/themed";
import React from "react";
import { Text, TextInput, View } from "../../components/Themed";
import useColorScheme from "../../utils/useColorScheme";
import {
  ArrayElement,
  ClassWithSections,
  Section,
  Subject,
} from "schooltalk-shared/types";
import { trpc } from "../../utils/trpc";
import { Switch } from "@rneui/themed";
import { CustomSelect } from "../../components/CustomSelect";
import { useNavigation } from "@react-navigation/native";
import { ModalTextInput } from "../../components/ModalTextInput";
import { Pressable, StyleSheet } from "react-native";
import { useConfig } from "../../utils/config";
import DatePicker from "react-native-date-picker";
import { format, parseISO } from "date-fns";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ExamTestSchema } from "schooltalk-shared/misc";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { Slider } from "@miblanchard/react-native-slider";
import { CustomSlider } from "../../components/CustomSlider";

interface TestModalProps {
  isTestCreateModal: boolean;
  onClose: () => void;
  onSubmit: (test: ExamTestSchema) => void;
}

export default function ({
  isTestCreateModal,
  onClose,
  onSubmit,
}: TestModalProps) {
  const navigation = useNavigation();
  const config = useConfig();

  const [multiselectSub, setMultiselectSub] = useState(false);
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";
  const ChevronIcon = (
    <MaterialCommunityIcons name="chevron-right" color={iconColor} size={16} />
  );
  const [mark, setMark] = useState<number>(25);
  const [duration, setDuration] = useState<number>(30);
  const [isTextModalOpenName, setIsTextModalOpenName] = useState(false);
  const [isTextModalOpenMark, setIsTextModalOpenMark] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassWithSections>();
  const [selectedSection, setSelectedSection] = useState<Section | string>(
    "All sections",
  );
  const [dueDate, setDueDate] = useState<Date>();
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);

  const subjectsQuery = trpc.school.subject.fetchSubjects.useQuery({});

  const classesAndSectionsData =
    trpc.school.class.fetchClassesAndSections.useQuery(
      { schoolId: config.schoolId },
      {
        cacheTime: 0,
        onSuccess(data) {
          // Initialize selected class and section
          // setSelectedClass((c) => {
          //   if (c) return c;
          //   return data.find((d) => d.numeric_id === ?.class_id);
          // });
        },
      },
    );

  const sectionsOptions = ["All sections", ...(selectedClass?.Sections ?? [])];

  return (
    <View>
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
          marginHorizontal: 16,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ textAlignVertical: "center", textAlign: "center" }}>
          Select Multiple Subjects
        </Text>
        <Switch
          trackColor={{ true: "#3bde50", false: "#f5f6fc" }}
          // change
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
          {ChevronIcon}
        </ListItem>
      </Pressable>
      <CustomSlider
        title={"Total Marks"}
        defaultValue={mark}
        onSetValue={setMark}
        minValue={0}
        maxValue={100}
      />
      <CustomSlider
        title={"Duration(min)"}
        defaultValue={duration}
        onSetValue={setDuration}
        minValue={0}
        maxValue={180}
      />
      <View style={styles.button_container}>
        <Pressable
          style={styles.button}
          onPress={() => {
            if (
              selectedClass &&
              selectedSection &&
              selectedSubjects &&
              mark &&
              dueDate &&
              duration
            ) {
              onSubmit({
                class_id: selectedClass?.numeric_id,
                section_id:
                  typeof selectedSection === "string"
                    ? undefined
                    : selectedSection?.numeric_id,
                date: dueDate.toISOString(),
                duration_minutes: Number(duration),
                subjectIds: selectedSubjects.map((s) => s.id),
                total_marks: Number(mark),
              });
              onClose?.();
            } else {
              Toast.show({
                type: "error",
                text1: "Insufficient Data",
              });
            }
          }}
        >
          <Text style={{ color: "white", fontSize: 18 }}>Done</Text>
        </Pressable>
      </View>
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
