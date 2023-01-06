/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Socket } from "socket.io-client";
import type { GroupBasicInfo } from "../backend/utils/group-identifier";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../shared/types";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  PreLogin: undefined;
  Login: undefined;
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  ChatWindow: GroupBasicInfo;
  Modal: undefined;
  NotFound: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootTabParamList = {
  HomeTab: undefined;
  ChatsTab: undefined;
};

export type ChatsTabParamList = {
  ChatList: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;
