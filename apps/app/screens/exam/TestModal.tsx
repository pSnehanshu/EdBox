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
import { Pressable } from "react-native";
import { useConfig } from "../../utils/config";
import DatePicker from "react-native-date-picker";
import { format, parseISO } from "date-fns";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ExamTestSchema } from "schooltalk-shared/misc";
import { Toast } from "react-native-toast-message/lib/src/Toast";

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
  const [name, setName] = useState<string>("");
  const [mark, setMark] = useState<number>(50);
  const [duration, setDuration] = useState<number>(30);
  const [isTextModalOpenName, setIsTextModalOpenName] = useState(false);
  const [isTextModalOpenMark, setIsTextModalOpenMark] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassWithSections>();
  const [selectedSection, setSelectedSection] = useState<Section>();
  const [dueDate, setDueDate] = useState<any>();
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>();

  const subjectsQuery = trpc.school.subject.fetchSubjects.useQuery({});

  // const createTest = trpc.school.exam.createTest.useMutation({
  //   onSuccess(data) {
  //     navigation.navigate("CreateExamScreen");
  //     // set tests
  //   },
  //   onError(error, variables, context) {
  //     console.log(error, variables, context);
  //   },
  // });

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
  // working as a form
  return (
    // <Dialog
    //   isVisible={isTestCreateModal}
    //   onBackdropPress={onClose}
    //   animationType="fade"
    //   style={{ width: "100%" }}
    // >
    //   <Dialog.Title title={"Create Test"} />

    <View>
      <ModalTextInput
        isVisible={isTextModalOpenName}
        onClose={() => setIsTextModalOpenName(false)}
        onChange={setName}
        defaultValue={name}
        title="Name"
      />
      <Pressable
        onPress={() => setIsTextModalOpenName(true)}
        style={({ pressed }) => ({
          opacity: pressed ? 0.2 : 1,
          borderBottomWidth: 1,
        })}
      >
        <ListItem>
          <ListItem.Content>
            <ListItem.Subtitle>Name</ListItem.Subtitle>
            <ListItem.Title>{name || "Empty"}</ListItem.Title>
          </ListItem.Content>
          <MaterialCommunityIcons
            name="chevron-right"
            color={iconColor}
            size={16}
          />
        </ListItem>
      </Pressable>
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
        items={selectedClass?.Sections}
        selected={selectedSection}
        onSubmit={(item) => setSelectedSection(item)}
        idExtractor={(item) => item.numeric_id}
        labelExtractor={(item) => `Section ${item.name ?? item.numeric_id}`}
        style={{ flexGrow: 1 }}
      />

      {!multiselectSub ? (
        <CustomSelect
          isSingle
          title="Subject"
          items={subjectsQuery.data}
          selected={selectedSubject}
          onSubmit={(item) => {
            if (item) setSelectedSubject(item);
          }}
          idExtractor={(item) => item?.id ?? 0}
          labelExtractor={(item) => `${item?.name}`}
          style={{ flexGrow: 1 }}
          isLoading={subjectsQuery.isLoading}
        />
      ) : (
        <CustomSelect
          isSingle={false}
          title="Subject"
          items={subjectsQuery.data}
          selected={selectedSubject ? [selectedSubject] : []}
          onSubmit={([item]) => {
            setSelectedSubject(item);
          }}
          idExtractor={(item) => item.id}
          labelExtractor={(item) => `${item.name}`}
          style={{ flexGrow: 1 }}
          isLoading={subjectsQuery.isLoading}
        />
      )}
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
                : "No due date"}
            </ListItem.Subtitle>
          </ListItem.Content>
          {ChevronIcon}
        </ListItem>
      </Pressable>
      <CustomSelect
        isSingle
        title="Duration"
        items={[15, 30, 60, 120, 180]}
        selected={mark}
        onSubmit={(item) => {
          setDuration(item);
        }}
        idExtractor={(item) => item}
        labelExtractor={(item) => `${item}`}
        style={{ flexGrow: 1 }}
      />
      <CustomSelect
        isSingle
        title="Mark"
        items={[25, 50, 100]}
        selected={mark}
        onSubmit={(item) => {
          setMark(item);
        }}
        idExtractor={(item) => item}
        labelExtractor={(item) => `${item}`}
        style={{ flexGrow: 1 }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
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
          onValueChange={(value) => setMultiselectSub(value)}
        />
      </View>
      <Pressable
        onPress={() => {
          if (
            name &&
            selectedClass &&
            selectedSection &&
            selectedSubject &&
            mark &&
            dueDate &&
            duration
          ) {
            onSubmit({
              name: name,
              class_id: selectedClass?.numeric_id,
              section_id: selectedSection?.numeric_id,
              date: dueDate,
              duration_minutes: duration,
              // for muliple subject make a arry outside
              subjectIds: [selectedSubject.id],
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
      >
        <Text>Done</Text>
      </Pressable>
    </View>

    //   <Dialog.Actions>
    //     <Dialog.Button
    //       title="Done"
    //       onPress={() => {
    //         if (
    //           mark &&
    //           name &&
    //           selectedClass &&
    //           selectedSection &&
    //           selectedSubject &&
    //           dueDate
    //         )
    //           createTest.mutate({
    //             name: "test1",
    //             class_id: selectedClass.numeric_id,
    //             section_id: selectedSection.numeric_id,
    //             date: dueDate.toISOString(),
    //             subjectIds: [selectedSubject.id],
    //             total_marks: mark,
    //           });
    //         onClose?.();
    //       }}
    //       type="solid"
    //     />
    //   </Dialog.Actions>
    // </Dialog>
  );
}
