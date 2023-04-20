import { useState } from "react";
import { Dialog, ListItem } from "@rneui/themed";
import React from "react";
import { Text, TextInput, View } from "../../components/Themed";
import ModalSelector from "react-native-modal-selector";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useColorScheme from "../../utils/useColorScheme";
import MultiSelect from "react-native-multiple-select";
import { ArrayElement, Subject } from "schooltalk-shared/types";
import { trpc } from "../../utils/trpc";
import { Switch } from "@rneui/themed";

interface TestModalProps {
  isTestCreateModal: boolean;
  onClose: () => void;
  selectedSubject: string;
  setSelectedSubject: (selectedSubject: string) => void;
}

export default function ({
  isTestCreateModal,
  onClose,
  selectedSubject,
  setSelectedSubject,
}: TestModalProps) {
  const subjectsQuery = trpc.school.subject.fetchSubjects.useQuery({});
  // const [selectedSubject, setSelectedSubject] = useState<any>();
  const selectedSubjectObject = subjectsQuery.data?.find(
    (s) => s.id === selectedSubject,
  );

  const [multiselectSub, setMultiselectSub] = useState(false);
  const scheme = useColorScheme();
  const iconColor = scheme === "dark" ? "white" : "black";
  const ChevronIcon = (
    <MaterialCommunityIcons name="chevron-right" color={iconColor} size={16} />
  );
  return (
    <Dialog
      isVisible={isTestCreateModal}
      onBackdropPress={onClose}
      animationType="fade"
      style={{ width: "100%" }}
    >
      <Dialog.Title title={"Create Test"} />

      {!multiselectSub ? (
        <ModalSelector
          data={
            subjectsQuery.data?.map((sub) => ({
              key: sub.id,
              label: sub.name,
            })) ?? []
          }
          onChange={(item) => setSelectedSubject(item.key)}
          animationType="fade"
          selectedKey={selectedSubject}
        >
          <ListItem
            containerStyle={{
              marginTop: 5,
              padding: 0,
            }}
          >
            <ListItem.Content>
              <ListItem.Title>Subject</ListItem.Title>
              <ListItem.Subtitle>
                {selectedSubjectObject?.name ?? "Select subject"}
              </ListItem.Subtitle>
            </ListItem.Content>
            {ChevronIcon}
          </ListItem>
        </ModalSelector>
      ) : (
        <Text>Multiselect</Text>
      )}
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

      <Dialog.Actions>
        <Dialog.Button
          title="Done"
          onPress={() => {
            // props.onChange?.(value);
            onClose?.();
          }}
          type="solid"
        />
      </Dialog.Actions>
    </Dialog>
  );
}
