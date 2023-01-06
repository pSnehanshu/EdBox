import { createNavigationContainerRef } from "@react-navigation/native";
import { RootStackParamList } from "../types";

/** This can be used to navigate from outside any component or hook */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
