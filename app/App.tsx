import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "./utils/trpc";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import { useFetchSchool, SchoolContext } from "./hooks/useSchool";

function AppWithSchool() {
  const colorScheme = useColorScheme();
  const { isLoading, isError, data: school } = useFetchSchool();

  if (isLoading) return null;
  if (isError) return null;

  return (
    <SchoolContext.Provider value={school}>
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    </SchoolContext.Provider>
  );
}

export default function App() {
  const isLoadingComplete = useCachedResources();

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://192.168.29.42:5080/trpc",
          headers() {
            return {};
          },
        }),
      ],
    })
  );

  if (!isLoadingComplete) return null;

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppWithSchool />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
