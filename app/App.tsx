import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "./utils/trpc";
import useCachedResources from "./utils/useCachedResources";
import useColorScheme from "./utils/useColorScheme";
import Navigation from "./navigation";
import { useSchool } from "./utils/useSchool";
import { useAuthToken } from "./utils/auth";
import config from "./config";
import { DBProvider } from "./utils/db";
import Toast from "react-native-toast-message";

function AppWithSchool() {
  const colorScheme = useColorScheme();
  const school = useSchool();

  if (!school) return null;

  return (
    <SafeAreaProvider>
      <Navigation colorScheme={colorScheme} />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

export default function App() {
  const authToken = useAuthToken();
  const isLoadingComplete = useCachedResources();

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${config.backendHost}/trpc`,
          async headers() {
            return {
              "x-session-id": (await authToken.get()) ?? undefined,
            };
          },
        }),
      ],
    })
  );

  if (!isLoadingComplete) return null;

  return (
    <DBProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AppWithSchool />
        </QueryClientProvider>
      </trpc.Provider>
      <Toast />
    </DBProvider>
  );
}
