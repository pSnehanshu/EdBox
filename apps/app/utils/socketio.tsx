import { io } from "socket.io-client";
import config from "../config";
import { useRef, createContext, useEffect, useContext, useState } from "react";
import { getAuthToken } from "./auth";
import { useSchool } from "../utils/useSchool";
import { SocketClient } from "../types";

const SocketContext = createContext<SocketClient | undefined>(undefined);

interface SocketProviderProps {
  children: JSX.Element | JSX.Element[];
}
export function SocketProvider({ children }: SocketProviderProps) {
  const school = useSchool();
  const socket = useRef<SocketClient>();
  const [, setSocketIsSet] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!school) return;

    (async () => {
      socket.current = io(`${config.backendHost}/${school.id}`, {
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
  }, [school?.id]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
