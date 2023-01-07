import { isPast, isValid, parseISO } from "date-fns";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { trpc } from "./trpc";
import type { User } from "../../shared/types";
import { AUTH_TOKEN, AUTH_TOKEN_EXPIRY, USER } from "./async-storage-keys";

export function useAuthToken() {
  const utils = trpc.useContext();

  return {
    async set(token: string, expiry: Date) {
      if (!isValid(expiry)) {
        throw new Error("Cannot set invalid token expiry date");
      }
      if (isPast(expiry)) {
        throw new Error("Cannot set an expired auth token");
      }
      await SecureStore.setItemAsync(AUTH_TOKEN, token);
      await SecureStore.setItemAsync(AUTH_TOKEN_EXPIRY, expiry.toISOString());
      utils.auth.whoami.invalidate();
    },
    async get() {
      const expiry = await SecureStore.getItemAsync(AUTH_TOKEN_EXPIRY);
      if (!expiry) return null;

      const expiryDate = parseISO(expiry);
      if (!isValid(expiryDate)) return null;

      // Expired tokens are invalid
      if (isPast(expiryDate)) return null;

      return SecureStore.getItemAsync(AUTH_TOKEN);
    },
  };
}

export function useCurrentUser() {
  const Token = useAuthToken();
  const [user, setUser] = useState<User>();
  const whoami = trpc.auth.whoami.useQuery(undefined, {
    retry: false,
    staleTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    (async () => {
      const token = await Token.get();
      if (!token) return;

      // Token is set, try to fetch the user object
      const _user = await AsyncStorage.getItem(USER);
      if (!_user) return;

      setUser(JSON.parse(_user));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!whoami.isLoading) {
        if (whoami.isError) {
          const error = whoami.error;
          if (error.data?.code === "UNAUTHORIZED") {
            // Session is invalid
            setUser(undefined);
            await AsyncStorage.removeItem(USER);
          }
        } else {
          // Save locally
          setUser(whoami.data);
          await AsyncStorage.setItem(USER, JSON.stringify(whoami.data));
        }
      }
    })();
  }, [whoami.isLoading]);

  return {
    isLoggedIn: !!user,
    user,
  };
}
