import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import type { ListRenderItem } from "@shopify/flash-list";
import type { ArrayElement } from "schooltalk-shared/types";
import { List, Text, View } from "./Themed";
import useColorScheme from "../utils/useColorScheme";

type ItemComponent<T = unknown> = (
  item: T,
  isSelected: boolean,
  index: number,
) => React.ReactNode;

interface MultiSelectProps<T = unknown> {
  isVisible: boolean;
  items: T[];
  selected: T[];
  idExtractor: (item: T) => string | number;
  labelExtractor?: (item: T) => string;
  onClose?: () => void;
  onSubmit?: (selected: T[]) => void;
  itemComponent?: ItemComponent<T>;
}
export function MultiSelect<T>(props: MultiSelectProps<T>) {
  const [isVisible, setIsVisible] = useState(props.isVisible);

  useEffect(() => {
    setTimeout(() => setIsVisible(props.isVisible), 0);
  }, [props.isVisible]);

  if (!isVisible) return <></>;

  return <ModalSelect {...props} />;
}

function ModalSelect<T>(props: MultiSelectProps<T>) {
  const scheme = useColorScheme();
  const color = scheme === "dark" ? "white" : "black";

  const [selectedItems, setSelectedItems] = useState<T[]>(props.selected);

  const items = useMemo(
    () =>
      props.items.map((item) => {
        const isSelected =
          selectedItems.findIndex(
            (sitem) => props.idExtractor(sitem) === props.idExtractor(item),
          ) >= 0;
        return { item, isSelected };
      }),
    [props.items, selectedItems],
  );

  const defaultItemComponent = useCallback<ItemComponent<T>>(
    (item, isSelected) => (
      <View style={styles.item}>
        <Text style={{ maxWidth: "80%" }}>
          {props.labelExtractor?.(item) ?? props.idExtractor(item)}
        </Text>

        {isSelected ? (
          <MaterialIcons name="radio-button-checked" size={24} color={color} />
        ) : (
          <MaterialIcons
            name="radio-button-unchecked"
            size={24}
            color={color}
          />
        )}
      </View>
    ),
    [props.labelExtractor, props.idExtractor, color],
  );

  const handleItemPress = useCallback(
    (item: T) => {
      // Vibrate!
      Haptics.selectionAsync();

      // Update selection
      setSelectedItems((items) => {
        const id = props.idExtractor(item);

        const index = items.findIndex(
          (sitem) => props.idExtractor(sitem) === id,
        );

        if (index >= 0) {
          // Item is already selected, unselect it

          const copy = items.slice();
          copy.splice(index, 1);
          return copy;
        } else {
          // Item isn't selected already, select it

          return items.concat(item);
        }
      });
    },
    [props.idExtractor],
  );

  const renderItem = useCallback<ListRenderItem<ArrayElement<typeof items>>>(
    ({ item: { item, isSelected }, index }) => {
      const id = props.idExtractor(item);

      return (
        <Pressable key={id} onPress={() => handleItemPress(item)}>
          {props.itemComponent?.(item, isSelected, index) ??
            defaultItemComponent(item, isSelected, index)}
        </Pressable>
      );
    },
    [props.idExtractor, props.itemComponent, defaultItemComponent],
  );

  return (
    <Modal
      transparent
      animationType="fade"
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

        <MaterialIcons.Button
          name="check"
          size={24}
          onPress={() => {
            props.onSubmit?.(selectedItems);
            props.onClose?.();
          }}
        >
          Done
        </MaterialIcons.Button>
      </View>

      <View style={styles.list}>
        <List
          data={items}
          renderItem={renderItem}
          estimatedItemSize={styles.item.height}
        />
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
