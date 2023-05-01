import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
} from "react-native";
import type { ListRenderItem } from "@shopify/flash-list";
import type { ArrayElement } from "schooltalk-shared/types";
import { Dialog, ListItem } from "@rneui/themed";
import { Slider } from "@miblanchard/react-native-slider";
import { List, Text, TextInput, View } from "./Themed";
import useColorScheme from "../utils/useColorScheme";

interface SelectProps<T = unknown> {
  title: string;
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean;
}
interface SingleSelectProps<T = unknown> extends SelectProps<T> {
  onSetValue: (value: number) => void;
  defaultValue: number;
}

type CustomSelectProps<T> = SingleSelectProps<T>;

export function CustomSlider<T>(
  props: CustomSelectProps<T> & { children?: React.ReactNode },
) {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <>
      <View style={[{}, props.style]}>
        <Pressable
          onPress={() => setIsVisible(true)}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <ListItem>
            <ListItem.Content>
              <ListItem.Title>{props.title}</ListItem.Title>
              <ListItem.Subtitle>{props.defaultValue}</ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        </Pressable>
      </View>

      {isVisible && (
        <ModalSelect
          {...props}
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
          defaultValue={props.defaultValue ? props.defaultValue : 0}
          onChange={(value: number[]) => props.onSetValue(value[0])}
        />
      )}
    </>
  );
}

function ModalSelect<T>(
  props: CustomSelectProps<T> & {
    isVisible: boolean;
    defaultValue: number;
    onClose?: () => void;
    onChange?: (value: number[]) => void;
  },
) {
  const scheme = useColorScheme();
  const color = scheme === "dark" ? "white" : "black";

  return (
    <Dialog
      isVisible={props.isVisible}
      onBackdropPress={props.onClose}
      animationType="fade"
    >
      {props.title && <Dialog.Title title={props.title} />}

      <View style={styles.slider_container}>
        {/* test */}
        <Slider
          animateTransitions
          maximumTrackTintColor="#d3d3d3"
          minimumTrackTintColor="#1fb28a"
          thumbTintColor="#1a9274"
          value={props.defaultValue}
          minimumValue={1}
          maximumValue={70}
          step={1}
          trackClickable={true}
          onValueChange={(value) => props.onChange?.(value)}
        />
      </View>
      <TextInput
        style={styles.slider_input}
        value={props.defaultValue.toString()}
        keyboardType="numeric"
        onChangeText={(value) => props.onChange?.([Number(value)])}
      />

      <Dialog.Actions>
        <Dialog.Button
          title="Done"
          onPress={() => {
            props.onClose?.();
          }}
          type="solid"
        />
      </Dialog.Actions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },
  list: {
    flex: 1,
  },
  item: {
    padding: 16,
    height: 64,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  slider_container: {
    flex: 1,
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    alignItems: "stretch",
    justifyContent: "center",
  },
  slider_input: {
    marginTop: 15,
    marginLeft: 10,
    borderWidth: 1,
    width: "20%",
    textAlign: "center",
    borderRadius: 4,
  },
});
