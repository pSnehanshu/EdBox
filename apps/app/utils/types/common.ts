import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  Group,
  ServerToClientEvents,
} from "schooltalk-shared/types";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Login: undefined;
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  ChatWindow: Group;
  AttendanceTaker: { periodId: string };
  NotFound: undefined;
  SchoolSettings: undefined;
  SubjectsSettings: undefined;
  ClassSectionSettings: undefined;
  RoutineSettingsScreen: undefined;
  PeopleSettings: undefined;
  TestDetails: { testId: string };
  ExamDetails: { examId: string };
  AboutApp: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootTabParamList = {
  HomeTab: undefined;
  ChatsTab: undefined;
  Routine: undefined;
  Settings: undefined;
  ExamsTab: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface SettingsOption {
  title: string;
  subtitle?: string;
  icon?: JSX.Element;
  onPress?: () => void;
}
