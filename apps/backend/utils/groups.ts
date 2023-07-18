import type { User, SchoolStaff } from "@prisma/client";
import prisma from "../prisma";

type UserWithStaff = User & { Staff: SchoolStaff | null };
type BareMinimumUser = Pick<
  UserWithStaff,
  | "id"
  | "school_id"
  | "teacher_id"
  | "student_id"
  | "parent_id"
  | "staff_id"
  | "Staff"
>;

// The groups membership scheme: https://excalidraw.com/#json=cRlgjemEuBwGZjLrvQJh0,eAzxIdbAY7j98nrgfUPn0g

/**
 * Get a list of groups, the user is part of.
 * @param user
 * @param pagination
 * @returns
 */
export async function getUserGroups(
  user: BareMinimumUser,
  pagination?: { page: number; limit: number },
): Promise<unknown[]> {
  return [];
  // Fetch all custom groups
  // const customGroupMembers = await prisma.customGroupMembers.findMany({
  //   where: {
  //     user_id: user.id,
  //   },
  //   include: {
  //     Group: true,
  //   },
  // });
  // // Sort
  // // if (pagination.sort === "recent_message") {
  // //   // TODO
  // // }
  // const customGroups: Group[] = customGroupMembers.map((cgm) => ({
  //   identifier: getCustomGroupIdentifier(user.school_id, cgm.group_id),
  //   name: cgm.Group.name,
  // }));
  // // Now fetch all automatic groups
  // const autoGroups = await getAutoGroups(user);
  // // Combine
  // const combined = autoGroups.concat(customGroups);
  // if (!pagination) return combined;
  // // slice and return
  // const startIndex = (pagination.page - 1) * pagination.limit;
  // return combined.slice(startIndex, startIndex + pagination.limit);
}

interface Membership {
  userId: string;
  name: string;
  groupIdentifier: string;
  isAdmin: boolean;
}

/**
 * Get the members of a given group
 * @param groupIdentifier
 * @returns
 */
export async function getGroupMembers(
  groupIdentifier: null,
  pagination?: {
    limit: number;
    page: number;
  },
): Promise<Membership[]> {
  return [];
}
