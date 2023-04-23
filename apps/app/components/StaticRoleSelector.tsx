import { MaterialIcons } from "@expo/vector-icons";
import { ListItem } from "@rneui/themed";
import { useEffect, useMemo } from "react";
import { Pressable } from "react-native";
import { getUserRoleHierarchical, StaticRole } from "schooltalk-shared/misc";
import { useCurrentUser } from "../utils/auth";
import { useConfig, useConfigUpdate } from "../utils/config";
import useColorScheme from "../utils/useColorScheme";
import { View } from "./Themed";

export function StaticRoleSelector() {
  const scheme = useColorScheme();
  const color = scheme === "dark" ? "white" : "black";

  const { user } = useCurrentUser();
  const config = useConfig();
  const setConfig = useConfigUpdate();

  const availableRoles = useMemo<StaticRole[]>(() => {
    const roles: StaticRole[] = [];
    if (user?.Teacher?.id) roles.push(StaticRole.teacher);
    if (user?.Student?.id) roles.push(StaticRole.student);
    if (user?.Parent?.id) roles.push(StaticRole.parent);
    if (user?.Staff?.role === "principal") roles.push(StaticRole.principal);
    if (user?.Staff?.role === "vice_principal")
      roles.push(StaticRole.vice_principal);
    if (user?.Staff?.role === "others") roles.push(StaticRole.staff);

    return roles;
  }, [user]);

  useEffect(() => {
    if (config.activeStaticRole === StaticRole.none && user) {
      setConfig({ activeStaticRole: getUserRoleHierarchical(user) });
    }
  }, [config.activeStaticRole, user]);

  return (
    <View>
      {availableRoles.map((role) => (
        <Pressable
          key={role}
          onPress={() => {
            setConfig({ activeStaticRole: role });
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <ListItem>
            <ListItem.Content>
              <ListItem.Title>{StaticRole[role].toUpperCase()}</ListItem.Title>
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
    </View>
  );
}
