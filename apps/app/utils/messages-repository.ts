import { Subject } from "rxjs";
import { IComposerContent, SocketClient } from "../utils/types/common";
import { useSocket } from "./socketio";
import { trpc } from "./trpc";
import _ from "lodash";
import Toast from "react-native-toast-message";
import type {
  IGroupActivity,
  SelfGroupActivity,
} from "schooltalk-shared/types";

export const Activites$ = new Subject<IGroupActivity | SelfGroupActivity>();
export const Composer$ = new Subject<IComposerContent>();
