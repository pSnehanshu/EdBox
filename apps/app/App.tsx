import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "./utils/trpc";
import useCachedResources from "./utils/useCachedResources";
import useColorScheme, { ColorSchemeContext } from "./utils/useColorScheme";
import Navigation from "./navigation";
import { useSchool } from "./utils/useSchool";
import { useAuthToken } from "./utils/auth";
import config from "./config";
import { DBProvider } from "./utils/db";
import Toast from "react-native-toast-message";
import SchoolNotFound from "./screens/SchoolNotFound";

function AppWithSchool() {
  const colorScheme = useColorScheme();
  const school = useSchool();

  return (
    <SafeAreaProvider>
      {school ? <Navigation colorScheme={colorScheme} /> : <SchoolNotFound />}
      <StatusBar style={colorScheme === "light" ? "dark" : "light"} />
    </SafeAreaProvider>
  );
}

export default function App() {
  const authToken = useAuthToken();
  const isLoadingComplete = useCachedResources();
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

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
          <ColorSchemeContext.Provider
            value={{ scheme: colorScheme, change: setColorScheme }}
          >
            <AppWithSchool />
          </ColorSchemeContext.Provider>
        </QueryClientProvider>
      </trpc.Provider>
      <Toast />
    </DBProvider>
  );
}
