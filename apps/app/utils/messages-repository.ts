import { Subject } from "rxjs";
import { IComposerContent, SocketClient } from "../utils/types/common";
import { useSocket } from "./socketio";
import { trpc } from "./trpc";
import _ from "lodash";
import Toast from "react-native-toast-message";
import type { IGroupActivity } from "schooltalk-shared/types";
import { atom } from "jotai";

export const Activites$ = new Subject<IGroupActivity>();
export const Composer$ = new Subject<IComposerContent>();

const pendingMessages = atom<IComposerContent[]>([]);

Composer$.subscribe((message) => {
  //
});
