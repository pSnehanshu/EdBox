import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Subject } from "rxjs";
import { SocketClient } from "../utils/types/common";
import { useSocket } from "./socketio";
import { trpc } from "./trpc";
import _ from "lodash";
import Toast from "react-native-toast-message";
import type { IGroupActivity } from "schooltalk-shared/types";
import type { FilePermissionsInput } from "schooltalk-shared/misc";
import { parseISO } from "date-fns";
