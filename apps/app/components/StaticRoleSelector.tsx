import { useMemo } from "react";
import { StaticRole } from "schooltalk-shared/misc";
import { useCurrentUser } from "../utils/auth";
import {
  useConfig,
  useConfigUpdate,
  useSelectDefaultRole,
} from "../utils/config";
import { CustomSelect, type SelectControlParams } from "./CustomSelect";

interface StaticRoleSelector {
  children?: (params: SelectControlParams) => React.ReactNode;
}
export function StaticRoleSelector({ children }: StaticRoleSelector) {
  useSelectDefaultRole();

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

  return (
    <CustomSelect
      isSingle
      selected={config.activeStaticRole}
      items={availableRoles}
      title="Select your role"
      idExtractor={(item) => item}
      labelExtractor={(item) =>
        StaticRole[item].split("_").join(" ").toUpperCase()
      }
      onSubmit={(item) => setConfig({ activeStaticRole: item })}
      control={children}
    />
  );
}
