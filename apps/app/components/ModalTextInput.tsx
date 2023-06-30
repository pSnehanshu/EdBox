import { Dialog, ListItem } from "@rneui/themed";
import { useEffect, useState } from "react";
import {
  TextStyle,
  StyleProp,
  StyleSheet,
  Pressable,
  ViewStyle,
} from "react-native";
import { TextInput } from "./Themed";

interface ModalTextInputProps {
  onChange?: (text: string) => void;
  title: string;
  defaultValue?: string;
  multiline?: boolean;
  textBoxStyle?: StyleProp<TextStyle>;
  selectorStyle?: StyleProp<ViewStyle>;
  number?: boolean;
}

export function ModalTextInput(props: ModalTextInputProps) {
  const [value, setValue] = useState(props.defaultValue ?? "");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // When opening the Dialog, sync local value with parent value
    if (isVisible) {
      setValue(props.defaultValue ?? "");
    }
  }, [isVisible]);

  return (
    <>
      <Pressable
        onPress={() => setIsVisible(true)}
        style={({ pressed }) => ({
          opacity: pressed ? 0.2 : 1,
        })}
      >
        <ListItem>
          <ListItem.Content>
            <ListItem.Title>{props.title}</ListItem.Title>
            <ListItem.Subtitle>{value || "Empty"}</ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      </Pressable>

      <Dialog
        isVisible={isVisible}
        onBackdropPress={() => setIsVisible(false)}
        animationType="fade"
      >
        {props.title && <Dialog.Title title={props.title} />}
        <TextInput
          style={[
            props.multiline ? styles.input_multiline : styles.input_singleline,
            props.textBoxStyle,
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
              setIsVisible(false);
            }}
            type="solid"
          />
        </Dialog.Actions>
      </Dialog>
    </>
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
