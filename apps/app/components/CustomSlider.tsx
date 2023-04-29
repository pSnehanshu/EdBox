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
import { List, Text, View } from "./Themed";
import useColorScheme from "../utils/useColorScheme";

type ItemComponent<T = unknown> = (
  item: T,
  isSelected: boolean,
  index: number,
) => React.ReactNode;

interface SelectProps<T = unknown> {
  title: string;
  //   itemComponent?: ItemComponent<T>;
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean;
}

interface MultiSelectProps<T = unknown> extends SelectProps<T> {
  // selected?: T[];
  // onSubmit?: (selected: T[]) => void;
}

interface SingleSelectProps<T = unknown> extends SelectProps<T> {
  // selected?: T;
  // onSubmit?: (selected: T) => void;
}

type CustomSelectProps<T> = SingleSelectProps<T> | MultiSelectProps<T>;

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
              <ListItem.Subtitle>{"Slide value"}</ListItem.Subtitle>
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
        />
      )}
    </>
  );
}

function ModalSelect<T>(
  props: CustomSelectProps<T> & {
    isVisible: boolean;
    onClose?: () => void;
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
          value={2}
          minimumValue={1}
          maximumValue={10}
          step={1}
          trackClickable={true}
          onValueChange={(value) => console.log(value)}
        />
      </View>

      <Dialog.Actions>
        <Dialog.Button
          title="Done"
          onPress={() => {
            // props.onChange?.(value);
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
});
