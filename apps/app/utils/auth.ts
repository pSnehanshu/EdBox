import { isPast, isValid, parseISO } from "date-fns";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import type { User } from "schooltalk-shared/types";
import { trpc } from "./trpc";
import { AUTH_TOKEN, AUTH_TOKEN_EXPIRY, USER } from "./async-storage-keys";
import { useDB } from "./db";

/**
 * Get the current token
 */
export async function getAuthToken() {
  const expiry = await SecureStore.getItemAsync(AUTH_TOKEN_EXPIRY);
  if (!expiry) return null;

  const expiryDate = parseISO(expiry);
  if (!isValid(expiryDate)) return null;

  // Expired tokens are invalid
  if (isPast(expiryDate)) return null;

  return SecureStore.getItemAsync(AUTH_TOKEN);
}

export async function setAuthToken(token: string, expiry: Date): Promise<void> {
  if (!isValid(expiry)) {
    throw new Error("Cannot set invalid token expiry date");
  }
  if (isPast(expiry)) {
    throw new Error("Cannot set an expired auth token");
  }
  await SecureStore.setItemAsync(AUTH_TOKEN, token);
  await SecureStore.setItemAsync(AUTH_TOKEN_EXPIRY, expiry.toISOString());
}

/**
 * This hook returns a setter function, which also invalidates the login status
 */
export function useSetAuthToken() {
  const utils = trpc.useContext();

  return useCallback<typeof setAuthToken>(
    async (token: string, expiry: Date) => {
      await setAuthToken(token, expiry);
      utils.auth.whoami.invalidate();
    },
    []
  );
}

export function useLogout() {
  const utils = trpc.useContext();
  const db = useDB();
  const logoutMutation = trpc.auth.logout.useMutation({
    async onSuccess() {
      Toast.show({
        type: "success",
        text1: "You have been logged out",
        position: "top",
      });

      await SecureStore.deleteItemAsync(AUTH_TOKEN);
      await SecureStore.deleteItemAsync(AUTH_TOKEN_EXPIRY);
      await SecureStore.deleteItemAsync(USER);

      await utils.auth.whoami.invalidate();

      // Clear all SQLite data
      db.transaction(
        (tx) => {
          tx.executeSql("DELETE FROM messages");
          tx.executeSql("DELETE FROM groups");
        },
        (error) => {
          console.error("Failed to delete all SQLite data", error);
        },
        () => {
          console.log("Deleted all SQLite data!");
        }
      );
    },
    onError(error, variables, context) {
      Toast.show({
        type: "error",
        text1: "Failed to logout",
        text2: "Please try again later",
        position: "top",
      });
    },
  });

  return useCallback(() => logoutMutation.mutate(), []);
}

/**
 * Cache user object to avoid fetching from AsyncStorage over and over
 */
let globalUser: User | undefined = undefined;

export function useCurrentUser() {
  const [user, setUser] = useState<User | undefined>(globalUser);
  const whoami = trpc.auth.whoami.useQuery(undefined, {
    retry: false,
    staleTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    (async () => {
      // Cached value found, no need to refetch
      if (globalUser) return;

      const token = await getAuthToken();
      if (!token) return;

      // Token is set, try to fetch the user object
      const _user = await AsyncStorage.getItem(USER);
      if (!_user) return;

      const user = JSON.parse(_user);
      setUser(user);

      // Cache the value
      globalUser = user;
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!whoami.isFetching) {
        if (whoami.isError) {
          const error = whoami.error;
          if (error.data?.code === "UNAUTHORIZED") {
            // Session is invalid
            setUser(undefined);
            await AsyncStorage.removeItem(USER);
            globalUser = undefined;
          }
        } else {
          // Save locally
          setUser(whoami.data);
          await AsyncStorage.setItem(USER, JSON.stringify(whoami.data));
          globalUser = whoami.data;
        }
      }
    })();
  }, [whoami.isFetching]);

  return {
    isLoggedIn: !!user,
    user,
  };
}
