import { io } from "socket.io-client";
import config from "../config";
import {
  useRef,
  createContext,
  createElement,
  useEffect,
  useContext,
  useState,
} from "react";
import { getAuthToken } from "./auth";
import { SocketClient } from "../utils/types/common";

const SocketContext = createContext<SocketClient | undefined>(undefined);

interface SocketProviderProps {
  children: JSX.Element | JSX.Element[];
}
export function SocketProvider({ children }: SocketProviderProps) {
  const socket = useRef<SocketClient>();
  const [, setSocketIsSet] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    (async () => {
      socket.current = io(`${config.backendHost}/${config.schoolId}`, {
        auth: {
          token: (await getAuthToken()) ?? undefined,
        },
      });

      setSocketIsSet(true);

      socket.current.on("connect", () => setIsConnected(true));
      socket.current.on("disconnect", () => setIsConnected(false));
    })();

    return () => {
      socket.current?.disconnect();
      socket.current?.removeAllListeners();
    };
  }, []);

  return createElement(
    SocketContext.Provider,
    { value: socket.current },
    children,
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
