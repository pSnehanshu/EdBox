import _ from "lodash";
import { Permissions } from "schooltalk-shared/permissions.enum";
import prisma from "../prisma";

/**
 * Check if user has given permissions. This will throw if user doesn't exists.
 * @param userId The user id
 * @param permissions The permissions to check
 * @param mode all: All permissions must exist; some: At least one permission must exist. Default "all"
 * @returns Boolean
 */
export async function userHasPermissions(
  userId: string,
  permissions: Permissions[],
  mode: "all" | "some" = "all"
): Promise<boolean> {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      DynamicRoles: {
        where: {
          Role: {
            is_active: true,
          },
        },
        include: {
          Role: true,
        },
      },
      school_id: true,
    },
  });

  const roles = user.DynamicRoles.map((d) => d.Role).filter(
    // Ignore roles not part of their school
    (r) => r.school_id === user.school_id
  );

  const userPermissions = _.uniq(
    roles.reduce<Permissions[]>(
      (permissions, role) => permissions.concat(role.permissions),
      []
    )
  );

  if (mode === "all") {
    const hasAll = permissions.every((rp) => userPermissions.includes(rp));
    return hasAll;
  }

  // mode: some
  const hasSome = permissions.some((rp) => userPermissions.includes(rp));
  return hasSome;
}
