/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */
import { ComponentPropsWithRef } from "react";
import {
  Text as DefaultText,
  View as DefaultView,
  ScrollView as DefaultScrollView,
  TextInput as DefaultTextInput,
} from "react-native";
import Colors from "../constants/Colors";
import useColorScheme from "../utils/useColorScheme";
import { FlashList } from "@shopify/flash-list";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];
export type TextInputProps = ThemeProps & DefaultTextInput["props"];
export type ListProps<ItemT> = ThemeProps &
  Omit<FlashList<ItemT>["props"], "style"> & {
    innerRef?: ComponentPropsWithRef<typeof FlashList<ItemT>>["ref"];
  };
export type ScrollViewProps = ThemeProps &
  DefaultScrollView["props"] & {
    innerRef?: ComponentPropsWithRef<typeof DefaultScrollView>["ref"];
  };

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function ScrollView(props: ScrollViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  return (
    <DefaultScrollView
      style={[{ backgroundColor }, style]}
      {...otherProps}
      ref={props.innerRef}
    />
  );
}

export function List<ItemT = any>(props: ListProps<ItemT>) {
  const { lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  return (
    <FlashList
      {...otherProps}
      ref={props.innerRef}
      contentContainerStyle={{
        backgroundColor,
        ...otherProps.contentContainerStyle,
      }}
    />
  );
}

export function TextInput(props: TextInputProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  const placeholderTextColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "placeholderColor",
  );
  const borderColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text",
  );

  return (
    <DefaultTextInput
      style={[{ color, backgroundColor, borderColor }, style]}
      placeholderTextColor={placeholderTextColor}
      {...otherProps}
    />
  );
}
