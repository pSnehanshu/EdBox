import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  Group,
  Homework,
  ServerToClientEvents,
  UploadPermission,
} from "schooltalk-shared/types";
import type { Subject } from "rxjs";
import type { FileSystemUploadResult } from "expo-file-system";

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
  ExamsScreen: undefined;
  HomeWorkScreen: undefined;
  CreateHomeworkScreen: undefined;
  DisplayHomeworkScreen: { homeworkId: string };
  UpdateHomeworkScreen: { homeworkId: string };
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootTabParamList = {
  HomeTab: undefined;
  ChatsTab: undefined;
  Routine: undefined;
  Settings: undefined;
  ExamsTab: undefined;
  Menu: undefined;
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

interface File {
  name?: string;
  size?: number;
  mimeType?: string;
  uri: string;
}

export interface FileUploadTask {
  progress: Subject<number>;
  start: () => Promise<FileSystemUploadResult | undefined>;
  cancel: () => Promise<void>;
  permission: UploadPermission;
  file: File;
  uploadResult?: FileSystemUploadResult;
  started: boolean;
}
