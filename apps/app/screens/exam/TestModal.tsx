import { useState } from "react";
import { Dialog, ListItem } from "@rneui/themed";
import React from "react";
import { Text, TextInput, View } from "../../components/Themed";
import useColorScheme from "../../utils/useColorScheme";
import type { ArrayElement, Subject } from "schooltalk-shared/types";
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

  return (
    <Dialog
      isVisible={isTestCreateModal}
      onBackdropPress={onClose}
      animationType="fade"
      style={{ width: "100%" }}
    >
      <Dialog.Title title={"Create Test"} />

      {multiselectSub ? (
        // TODO: Use <CustomSelect isSingle={false} />
        <Text>Multi select</Text>
      ) : (
        // TODO: Use <CustomSelect isSingle />
        <Text>Single select</Text>
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
