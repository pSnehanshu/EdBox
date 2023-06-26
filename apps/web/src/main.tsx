import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { ChakraProvider } from "@chakra-ui/react";
import Routes from "./routes.tsx";
import { trpc } from "./utils/trpc";
import { env } from "./utils/env.ts";

const ProvidersTree: React.FC = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${env.VITE_BACKEND_URL}/trpc`,
          async headers() {
            return {
              // authorization: getAuthCookie(),
            };
          },
        }),
      ],
    }),
  );

  return (
    <React.StrictMode>
      <ChakraProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <Routes />
          </QueryClientProvider>
        </trpc.Provider>
      </ChakraProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ProvidersTree />,
);
