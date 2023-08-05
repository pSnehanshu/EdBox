import { createTRPCReact } from "@trpc/react-query";
import { TRPCLink, httpBatchLink, createTRPCProxyClient } from "@trpc/client";
import type { AppRouter } from "../../../backend/trpc";
import { env } from "./env";

export const links: TRPCLink<AppRouter>[] = [
  httpBatchLink({
    url: `${env.VITE_BACKEND_URL}/trpc`,
    async headers() {
      // Read from localStorage
      let token = "";
      try {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          const parsed = JSON.parse(storedToken) as unknown;
          if (typeof parsed === "string") {
            token = parsed;
          }
        }
      } catch (error) {
        console.warn(error);
      }

      // Set header
      return {
        "x-session-id": token,
      };
    },
  }),
];

export const trpc = createTRPCReact<AppRouter>();

export const trpcVanillaClient = createTRPCProxyClient<AppRouter>({ links });
