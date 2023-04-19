import { useState } from "react";
import { Dialog, ListItem } from "@rneui/themed";
import React from "react";
import { Text, TextInput, View } from "../../components/Themed";
import ModalSelector from "react-native-modal-selector";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useColorScheme from "../../utils/useColorScheme";
import MultiSelect from "react-native-multiple-select";
import { ArrayElement } from "schooltalk-shared/types";
import { trpc } from "../../utils/trpc";

interface TestModalProps {
  isTestCreateModal: boolean;
  onClose: () => void;
}

export default function ({ isTestCreateModal, onClose }: TestModalProps) {
  const subjectsQuery = trpc.school.subject.fetchSubjects.useQuery({});
  // test
  const items = [
    {
      id: "1",
      name: "Ondo",
    },
    {
      id: "2",
      name: "Ogun",
    },
    {
      id: "3",
      name: "Calabar",
    },
    {
      id: "4",
      name: "Lagos",
    },
    {
      id: "5",
      name: "Maiduguri",
    },
    {
      id: "7",
      name: "Anambra",
    },
    {
      id: "8",
      name: "Benue",
    },
    {
      id: "8",
      name: "Kaduna",
    },
    {
      id: "10",
      name: "Abuja",
    },
  ];
  const [selectedItems, setSelectedItems] = useState();

  const onSelectedItemsChange = (selectedItems: any) => {
    setSelectedItems(selectedItems);
  };
  //
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

      {/* <ModalSelector
        data={[]}
        //   onChange={(item) => setSelectedSubject(item.key)}
        animationType="fade"
        //   selectedKey={selectedSubject}
      >
        <ListItem>
          <ListItem.Content>
            <ListItem.Title>Subject</ListItem.Title>
            <ListItem.Subtitle>{"Select subject"}</ListItem.Subtitle>
          </ListItem.Content>
          {ChevronIcon}
        </ListItem>
      </ModalSelector> */}
      <View style={{}}>
        <MultiSelect
          hideTags
          items={subjectsQuery.data ?? []}
          uniqueKey="name"
          onSelectedItemsChange={onSelectedItemsChange}
          selectedItems={selectedItems}
          selectText="Pick Subjects"
          searchInputPlaceholderText="Search Subjects"
          tagRemoveIconColor="#CCC"
          tagBorderColor="#CCC"
          tagTextColor="#CCC"
          selectedItemTextColor="#CCC"
          selectedItemIconColor="#CCC"
          itemTextColor="#000"
          displayKey="name"
          submitButtonColor="black"
          submitButtonText="Submit"
          textInputProps={{ editable: false, autoFocus: false }}
          // searchIcon={false}
          // searchInputStyle={{ display: "none" }}
        />
        <Text>{JSON.stringify(selectedItems, null, 2)}</Text>
      </View>

      <Dialog.Actions>
        <Dialog.Button
          title="Done"
          onPress={() => {
            // props.onChange?.(value);
            // props.onClose?.();
          }}
          type="solid"
        />
      </Dialog.Actions>
    </Dialog>
  );
}
