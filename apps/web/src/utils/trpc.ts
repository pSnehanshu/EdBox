import { createTRPCReact } from "@trpc/react-query";
import { TRPCLink, httpBatchLink, createTRPCProxyClient } from "@trpc/client";
import type { AppRouter } from "../../../backend/trpc";
import { env } from "./env";

export const links: TRPCLink<AppRouter>[] = [
  httpBatchLink({
    url: `${env.VITE_BACKEND_URL}/trpc`,
    headers() {
      // Set header
      return {
        "x-session-id": localStorage.getItem("token") ?? undefined,
      };
    },
  }),
];

export const trpc = createTRPCReact<AppRouter>();

export const trpcVanillaClient = createTRPCProxyClient<AppRouter>({ links });
