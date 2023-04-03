import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useCallback, useEffect, useState, Suspense } from "react";
import { Button, ThemeProvider } from "@rneui/themed";
import { trpc } from "./utils/trpc";
import useCachedResources from "./utils/useCachedResources";
import useColorScheme, {
  ColorSchemeContext,
  theme,
} from "./utils/useColorScheme";
import Navigation from "./navigation";
import { useSchool } from "./utils/useSchool";
import { getAuthToken } from "./utils/auth";
import { useConfig } from "./config";
import { DBProvider } from "./utils/db";
import Toast from "react-native-toast-message";
import SchoolNotFound from "./screens/SchoolNotFound";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLOR_SCHEME } from "./utils/async-storage-keys";
import { Text, View } from "./components/Themed";

function SchoolSelector() {
  const [, setConfig] = useConfig();

  return (
    <View>
      <Text>School selector</Text>
      <Button
        onPress={() =>
          setConfig({
            schoolId: "clcpuzcxf00001yvt5ppcenso",
          })
        }
      >
        Set school
      </Button>
    </View>
  );
}

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

function AppWithConfig() {
  const isLoadingComplete = useCachedResources();
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");
  const [config] = useConfig();
  const isSchoolSelected = !!config.schoolId;

  useEffect(() => {
    AsyncStorage.getItem(COLOR_SCHEME).then((scheme) => {
      if (scheme === "light" || scheme === "dark") {
        setColorScheme(scheme);
      }
    });
  }, []);
  const setAndSaveColorScheme = useCallback((scheme: typeof colorScheme) => {
    setColorScheme(scheme);
    AsyncStorage.setItem(COLOR_SCHEME, scheme);
  }, []);

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${config.backendHost}/trpc`,
          async headers() {
            return {
              "x-session-id": (await getAuthToken()) ?? undefined,
            };
          },
        }),
      ],
    }),
  );

  if (!isLoadingComplete) return null;

  return (
    <DBProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <ColorSchemeContext.Provider
              value={{ scheme: colorScheme, change: setAndSaveColorScheme }}
            >
              {isSchoolSelected ? <AppWithSchool /> : <SchoolSelector />}
            </ColorSchemeContext.Provider>
          </ThemeProvider>
        </QueryClientProvider>
      </trpc.Provider>
      <Toast />
    </DBProvider>
  );
}

export default function App() {
  return (
    <Suspense fallback={<></>}>
      <AppWithConfig />
    </Suspense>
  );
}
