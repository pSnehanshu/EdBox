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
import { ListItem } from "@rneui/themed";
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
              <ListItem.Subtitle>{}</ListItem.Subtitle>
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
    <Modal
      transparent
      animationType="fade"
      role="list"
      visible={props.isVisible}
      onRequestClose={props.onClose}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable
          onPress={props.onClose}
          style={({ pressed }) => [
            styles.cancel_btn,
            { opacity: pressed ? 0.5 : 1 },
          ]}
        >
          <MaterialIcons
            name="arrow-back-ios"
            size={24}
            color={color}
            backgroundColor="transparent"
          />
          <Text>Cancel</Text>
        </Pressable>

        {
          <MaterialIcons.Button
            name="check"
            size={24}
            onPress={() => {
              // props.onSubmit?.(selectedItems);
              props.onClose?.();
            }}
          >
            Done
          </MaterialIcons.Button>
        }
      </View>
      <View style={styles.list}>
        {props.isLoading ? (
          <ActivityIndicator size={56} style={{ height: "100%" }} />
        ) : (
          <Text>duration test</Text>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: "red",
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },
  cancel_btn: {
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
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
});
