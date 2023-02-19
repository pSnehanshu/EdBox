import { createNavigationContainerRef } from "@react-navigation/native";
import { RootStackParamList } from "../utils/types/common";

/** This can be used to navigate from outside any component or hook */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
