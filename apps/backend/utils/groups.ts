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
