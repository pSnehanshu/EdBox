import { MaterialIcons } from "@expo/vector-icons";
import { ListItem } from "@rneui/themed";
import { useEffect, useMemo } from "react";
import { Pressable } from "react-native";
import { getUserRoleHierarchical, StaticRole } from "schooltalk-shared/misc";
import { useCurrentUser } from "../utils/auth";
import { useConfig, useConfigUpdate } from "../utils/config";
import useColorScheme from "../utils/useColorScheme";
import { ScrollView, View } from "./Themed";

interface StaticRoleSelector {
  onChange?: (role: StaticRole) => void;
}
export function StaticRoleSelector({ onChange }: StaticRoleSelector) {
  const scheme = useColorScheme();
  const color = scheme === "dark" ? "white" : "black";

  const { isLoggedIn, user } = useCurrentUser();
  const config = useConfig();
  const setConfig = useConfigUpdate();

  const availableRoles = useMemo<StaticRole[]>(() => {
    if (!isLoggedIn) return [];

    const roles: StaticRole[] = [];
    if (user.Teacher?.id) roles.push(StaticRole.teacher);
    if (user.Student?.id) roles.push(StaticRole.student);
    if (user.Parent?.id) roles.push(StaticRole.parent);
    if (user.Staff?.role === "principal") roles.push(StaticRole.principal);
    if (user.Staff?.role === "vice_principal")
      roles.push(StaticRole.vice_principal);
    if (user.Staff?.role === "others") roles.push(StaticRole.staff);

    return roles;
  }, [user, isLoggedIn]);

  useEffect(() => {
    if (config.activeStaticRole === StaticRole.none && isLoggedIn) {
      setConfig({ activeStaticRole: getUserRoleHierarchical(user) });
    }
  }, [config.activeStaticRole, user, isLoggedIn]);

  return (
    <View>
      <ScrollView>
        {availableRoles.map((role) => (
          <Pressable
            key={role}
            onPress={() => {
              setConfig({ activeStaticRole: role });
              onChange?.(role);
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <ListItem>
              <ListItem.Content>
                <ListItem.Title>
                  {StaticRole[role].split("_").join(" ").toUpperCase()}
                </ListItem.Title>
              </ListItem.Content>

              {config.activeStaticRole === role ? (
                <MaterialIcons
                  name="radio-button-checked"
                  size={24}
                  color={color}
                />
              ) : (
                <MaterialIcons
                  name="radio-button-unchecked"
                  size={24}
                  color={color}
                />
              )}
            </ListItem>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
