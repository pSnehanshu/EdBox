import { useState } from "react";
import { Dialog, ListItem } from "@rneui/themed";
import React from "react";
import { TextInput } from "../../components/Themed";
import ModalSelector from "react-native-modal-selector";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useColorScheme from "../../utils/useColorScheme";

interface TestModalProps {
  isTestCreateModal: boolean;
  onClose: () => void;
}
export default function ({ isTestCreateModal, onClose }: TestModalProps) {
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

      <ModalSelector
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
      </ModalSelector>

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
