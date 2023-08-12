import { useMemo } from "react";
import { StaticRole, getUserStaticRoles } from "schooltalk-shared/misc";
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

  const availableRoles = useMemo<StaticRole[]>(
    () => (isLoggedIn ? getUserStaticRoles(user) : []),
    [user, isLoggedIn],
  );

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
