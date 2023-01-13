import { io } from "socket.io-client";
import config from "../config";
import { useRef, createContext, useEffect, useContext, useState } from "react";
import { useAuthToken } from "./auth";
import { useSchool } from "../utils/useSchool";
import { SocketClient } from "../types";

const SocketContext = createContext<
  | {
      isConnected: false;
    }
  | {
      isConnected: true;
      client: SocketClient;
    }
>({
  isConnected: false,
});

interface SocketProviderProps {
  children: JSX.Element | JSX.Element[];
}
export function SocketProvider({ children }: SocketProviderProps) {
  const school = useSchool();
  const socket = useRef<SocketClient>();
  const authToken = useAuthToken();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!school) return;

    (async () => {
      socket.current = io(`${config.backendHost}/${school.id}`, {
        auth: {
          token: (await authToken.get()) ?? undefined,
        },
      });

      socket.current.on("connect", () => setIsConnected(true));
      socket.current.on("disconnect", () => setIsConnected(false));
    })();

    return () => {
      socket.current?.disconnect();
      socket.current?.removeAllListeners();
    };
  }, [school?.id]);

  return (
    <SocketContext.Provider
      value={
        isConnected && socket.current
          ? { client: socket.current, isConnected }
          : { isConnected: false }
      }
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const socket = useContext(SocketContext);
  return socket;
}