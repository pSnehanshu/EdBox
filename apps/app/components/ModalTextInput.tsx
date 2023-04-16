import { Dialog } from "@rneui/themed";
import { useEffect, useState } from "react";
import { TextStyle, StyleProp } from "react-native";
import { TextInput } from "./Themed";

interface ModalTextInputProps {
  isVisible: boolean;
  onClose?: () => void;
  onChange?: (text: string) => void;
  title?: string;
  defaultValue?: string;
  style?: StyleProp<TextStyle>;
}

export function ModalTextInput(props: ModalTextInputProps) {
  const [value, setValue] = useState(props.defaultValue ?? "");

  useEffect(() => {
    // When opening the Dialog, sync local value with parent value
    if (props.isVisible) {
      setValue(props.defaultValue ?? "");
    }
  }, [props.isVisible]);

  return (
    <Dialog
      isVisible={props.isVisible}
      onBackdropPress={props.onClose}
      animationType="fade"
    >
      {props.title && <Dialog.Title title={props.title} />}
      <TextInput
        style={[
          {
            borderWidth: 0.5,
            borderRadius: 4,
            textAlignVertical: "top",
            padding: 4,
            maxHeight: 200,
          },
          props.style,
        ]}
        autoFocus
        multiline
        numberOfLines={10}
        value={value}
        onChangeText={setValue}
      />

      <Dialog.Actions>
        <Dialog.Button
          title="Done"
          onPress={() => {
            props.onChange?.(value);
            props.onClose?.();
          }}
          type="solid"
        />
      </Dialog.Actions>
    </Dialog>
  );
}
