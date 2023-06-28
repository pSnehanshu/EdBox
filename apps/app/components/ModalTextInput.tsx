import { Dialog } from "@rneui/themed";
import { useEffect, useState } from "react";
import { TextStyle, StyleProp, StyleSheet } from "react-native";
import { TextInput } from "./Themed";

interface ModalTextInputProps {
  isVisible: boolean;
  onClose?: () => void;
  onChange?: (text: string) => void;
  title?: string;
  defaultValue?: string;
  multiline?: boolean;
  style?: StyleProp<TextStyle>;
  number?: boolean;
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
          props.multiline ? styles.input_multiline : styles.input_singleline,
          props.style,
        ]}
        autoFocus
        multiline={!!props.multiline}
        numberOfLines={props.multiline ? 10 : 1}
        value={value}
        onChangeText={setValue}
        keyboardType={props.number ? "numeric" : "ascii-capable"}
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

const styles = StyleSheet.create({
  input_multiline: {
    borderWidth: 0.5,
    borderRadius: 4,
    textAlignVertical: "top",
    padding: 4,
    maxHeight: 200,
  },
  input_singleline: {
    borderBottomWidth: 0.5,
  },
});
