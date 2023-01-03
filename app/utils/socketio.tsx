import { io, Socket } from "socket.io-client";
import config from "../config";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../shared/types";
import { useRef, createContext, useEffect, useContext, useState } from "react";
import { useAuthToken } from "./auth";

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

const SocketContext = createContext<
  | {
      isConnected: false;
    }
  | {
      isConnected: true;
      client: SocketType;
    }
>({
  isConnected: false,
});

interface SocketProviderProps {
  children: JSX.Element | JSX.Element[];
}
export function SocketProvider({ children }: SocketProviderProps) {
  const socket = useRef<SocketType>();
  const authToken = useAuthToken();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    (async () => {
      socket.current = io(config.backendHost, {
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
  }, []);

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
