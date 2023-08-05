import React, { Suspense, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider } from "@chakra-ui/react";
import Routes from "./routes.tsx";
import { trpc, links } from "./utils/trpc";

const ProvidersTree: React.FC = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30000 },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links,
    }),
  );

  return (
    <React.StrictMode>
      <ChakraProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <Suspense fallback={<h1>Please wait...</h1>}>
              <Routes />
            </Suspense>
          </QueryClientProvider>
        </trpc.Provider>
      </ChakraProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ProvidersTree />,
);
