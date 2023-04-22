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
  items?: T[];
  title: string;
  idExtractor: (item: T) => string | number;
  labelExtractor?: (item: T) => string;
  itemComponent?: ItemComponent<T>;
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean;
}

interface MultiSelectProps<T = unknown> extends SelectProps<T> {
  isSingle: false;
  selected?: T[];
  onSubmit?: (selected: T[]) => void;
}

interface SingleSelectProps<T = unknown> extends SelectProps<T> {
  isSingle: true;
  selected?: T;
  onSubmit?: (selected: T) => void;
}

type CustomSelectProps<T> = SingleSelectProps<T> | MultiSelectProps<T>;

export function CustomSelect<T>(
  props: CustomSelectProps<T> & { children?: React.ReactNode },
) {
  const [isVisible, setIsVisible] = useState(false);

  const selectedItemsText = useMemo(() => {
    const selected = Array.isArray(props.selected)
      ? props.selected
      : props.selected
      ? [props.selected]
      : [];

    const labels = selected.map((selectedItem) =>
      (
        props.labelExtractor?.(selectedItem) ?? props.idExtractor(selectedItem)
      ).toString(),
    );

    if (labels.length < 1) {
      return `Select ${props.title}`;
    } else if (labels.length === 1) {
      return labels[0];
    } else {
      return `${labels[0]} and ${labels.length - 1} more`;
    }
  }, [props.selected, props.labelExtractor, props.idExtractor, props.title]);

  return (
    <>
      <View style={[{}, props.style]}>
        <Pressable
          onPress={() => setIsVisible(true)}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          {props.children ?? (
            <ListItem>
              <ListItem.Content>
                <ListItem.Title>{props.title}</ListItem.Title>
                <ListItem.Subtitle>{selectedItemsText}</ListItem.Subtitle>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          )}
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

  const [selectedItems, setSelectedItems] = useState<T[]>(() => {
    if (Array.isArray(props.selected)) {
      return props.selected;
    } else if (props.selected) {
      return [props.selected];
    } else {
      return [];
    }
  });

  const items = useMemo(
    () =>
      props.items?.map((item) => {
        const isSelected =
          selectedItems.findIndex(
            (sitem) => props.idExtractor(sitem) === props.idExtractor(item),
          ) >= 0;
        return { item, isSelected };
      }) ?? [],
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
      // Update selection
      setSelectedItems((selectedItems) => {
        if (props.isSingle) {
          setTimeout(() => {
            props.onSubmit?.(item);
            props.onClose?.();
          }, 100);

          return [item];
        }

        const id = props.idExtractor(item);
        const index = selectedItems.findIndex(
          (sitem) => props.idExtractor(sitem) === id,
        );

        if (index >= 0) {
          // Item is already selected, unselect it

          const copy = selectedItems.slice();
          copy.splice(index, 1);
          return copy;
        } else {
          // Item isn't selected already, select it

          return selectedItems.concat(item);
        }
      });
    },
    [props.idExtractor, props.isSingle],
  );

  const renderItem = useCallback<ListRenderItem<ArrayElement<typeof items>>>(
    ({ item: { item, isSelected }, index }) => {
      const id = props.idExtractor(item);

      return (
        <Pressable
          key={id}
          onPress={() => handleItemPress(item)}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
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

        {props.isSingle ? null : (
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
        )}
      </View>

      <View style={styles.list}>
        {props.isLoading ? (
          <ActivityIndicator size={56} style={{ height: "100%" }} />
        ) : (
          <List
            data={items}
            renderItem={renderItem}
            estimatedItemSize={styles.item.height}
          />
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
