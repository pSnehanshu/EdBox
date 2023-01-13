import { createContext, useContext } from "react";
import {
  ColorSchemeName,
  useColorScheme as _useColorScheme,
} from "react-native";

type ColorScheme = NonNullable<ColorSchemeName>;

export const ColorSchemeContext = createContext<{
  scheme: ColorScheme;
  change: (scheme: ColorScheme) => void;
}>({ scheme: "light", change: () => {} });

// The useColorScheme value is always either light or dark, but the built-in
// type suggests that it can be null. This will not happen in practice, so this
// makes it a bit easier to work with.
export default function useColorScheme(): ColorScheme {
  const { scheme } = useContext(ColorSchemeContext);
  return scheme; // _useColorScheme() as NonNullable<ColorSchemeName>;
}