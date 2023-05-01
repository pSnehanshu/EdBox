import type { User, SchoolStaff } from "@prisma/client";
import prisma from "../prisma";
import {
  AutoGroupType,
  convertObjectToOrderedQueryString,
  getBatchGroupIdentifier,
  getCustomGroupIdentifier,
  getSchoolGroupIdentifier,
  getSectionGroupIdentifier,
  getSubjectGroupIdentifier,
  GroupDefinition,
  GroupIdentifier,
} from "schooltalk-shared/group-identifier";
import _ from "lodash";
import type { Group } from "schooltalk-shared/types";
import { hasUserStaticRoles, StaticRole } from "schooltalk-shared/misc";

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
 * Get list of all automatic groups a user is part of
 * @param user
 */
async function getAutoGroups(user: BareMinimumUser): Promise<Group[]> {
  const school = await prisma.school.findUnique({
    where: { id: user.school_id },
  });

  if (!school || !school.is_active) {
    return [];
  }

  // School group
  const schoolGroup: Group = {
    identifier: getSchoolGroupIdentifier(school.id),
    name: school.name,
  };

  const bacthGroups: Group[] = [];
  const sectionGroups: Group[] = [];
  const subjectGroups: Group[] = [];

  const isPrincipal = hasUserStaticRoles(
    user,
    [StaticRole.principal, StaticRole.vice_principal],
    "some",
  );
  const isStaff = hasUserStaticRoles(user, [StaticRole.staff], "all");

  if (user.teacher_id) {
    // Fetch necessary info about the teacher
    const teacher = await prisma.teacher.findUnique({
      where: { id: user.teacher_id },
      include: {
        Periods: {
          include: {
            Class: {
              include: { Batch: true },
            },
            Section: true,
            Subject: true,
          },
        },
      },
    });

    if (teacher && teacher.school_id === school.id) {
      // Subject groups
      _.uniqBy(teacher.Periods, (p) => `${p.class_id}/${p.subject_id}`).forEach(
        ({ Subject, Class }) => {
          // If class doesn't have batch, that means it's empty
          // Hence no group
          if (Class.Batch) {
            // Subject group
            subjectGroups.push({
              identifier: getSubjectGroupIdentifier(
                school.id,
                Subject.id,
                Class.Batch.numeric_id,
              ),
              name: `${Subject.name} - Class ${Class.name ?? Class.numeric_id}`,
            });
          }
        },
      );

      // Class groups (batch groups)
      _.uniqBy(teacher.Periods, (p) => p.Class.Batch?.numeric_id).forEach(
        ({ Class }) => {
          // If class doesn't have batch, that means it's empty
          // Hence no group
          if (Class.Batch) {
            // Class group
            bacthGroups.push({
              identifier: getBatchGroupIdentifier(
                school.id,
                Class.Batch.numeric_id,
              ),
              name: `Class ${Class.name ?? Class.numeric_id} (all sections)`,
            });
          }
        },
      );

      // Section groups
      _.uniqBy(teacher.Periods, (p) => `${p.class_id}/${p.section_id}`).forEach(
        ({ Class, Section }) => {
          // If class doesn't have batch, that means it's empty
          // Hence no group
          if (Class.Batch) {
            sectionGroups.push({
              identifier: getSectionGroupIdentifier(
                school.id,
                Class.Batch.numeric_id,
                Section.numeric_id,
              ),
              name: `Class ${Class.name ?? Class.numeric_id} (${
                Section.name ?? Section.numeric_id
              })`,
            });
          }
        },
      );
    }
  }
  if (user.student_id) {
    const student = await prisma.student.findUnique({
      where: { id: user.student_id },
      include: {
        CurrentBatch: {
          include: {
            Class: true,
          },
        },
      },
    });

    const Batch = student?.CurrentBatch;
    const Class = Batch?.Class;

    // Check if they belong to any class
    if (student && student.school_id === school.id && Batch && Class) {
      // Batch group (A student can belong to only one batch/class)
      const className = Class.name ?? Class.numeric_id;

      bacthGroups.push({
        identifier: getBatchGroupIdentifier(school.id, Batch.numeric_id),
        name: `Class ${className} (all sections)`,
      });

      // Section group (A student can belong to only one section)
      if (typeof student.section === "number") {
        const section = await prisma.classSection.findUnique({
          where: {
            numeric_id_class_id_school_id: {
              class_id: Class.numeric_id,
              numeric_id: student.section,
              school_id: school.id,
            },
          },
          include: {
            Periods: {
              include: {
                Subject: true,
              },
            },
          },
        });

        if (section) {
          sectionGroups.push({
            identifier: getSectionGroupIdentifier(
              school.id,
              Batch.numeric_id,
              section.numeric_id,
            ),
            name: `Class ${className} (${section.name ?? section.numeric_id})`,
          });

          // Fetch all the subject groups
          _.uniqBy(section.Periods, (p) => p.subject_id).forEach(
            ({ Subject }) => {
              subjectGroups.push({
                name: `${Subject.name} - Class ${className}`,
                identifier: getSubjectGroupIdentifier(
                  school.id,
                  Subject.id,
                  Batch.numeric_id,
                ),
              });
            },
          );
        }
      }
    }
  }
  if (user.parent_id) {
    // TODO: Fetch the class where their children study
  }
  if (isPrincipal) {
    // TODO: Fetch staff specific groups
  }
  if (isStaff && user.staff_id) {
    // TODO: Fetch staff specific groups
  }

  return [schoolGroup, ...bacthGroups, ...sectionGroups, ...subjectGroups];
}

/**
 * Get a list of groups, the user is part of.
 * @param user
 * @param pagination
 * @returns
 */
export async function getUserGroups(
  user: BareMinimumUser,
  pagination?: { page: number; limit: number },
): Promise<Group[]> {
  // Fetch all custom groups
  const customGroupMembers = await prisma.customGroupMembers.findMany({
    where: {
      user_id: user.id,
    },
    include: {
      Group: true,
    },
  });

  // Sort
  // if (pagination.sort === "recent_message") {
  //   // TODO
  // }

  const customGroups: Group[] = customGroupMembers.map((cgm) => ({
    identifier: getCustomGroupIdentifier(user.school_id, cgm.group_id),
    name: cgm.Group.name,
  }));

  // Now fetch all automatic groups
  const autoGroups = await getAutoGroups(user);

  // Combine
  const combined = autoGroups.concat(customGroups);

  if (!pagination) return combined;

  // slice and return
  const startIndex = (pagination.page - 1) * pagination.limit;
  return combined.slice(startIndex, startIndex + pagination.limit);
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
  groupIdentifier: GroupIdentifier,
  pagination?: {
    limit: number;
    page: number;
  },
): Promise<Membership[]> {
  const groupIdentifierString =
    convertObjectToOrderedQueryString(groupIdentifier);

  if (groupIdentifier.gd === GroupDefinition.custom) {
    // Fetch all custom groups
    const customGroupMembers = await prisma.customGroupMembers.findMany({
      where: {
        group_id: groupIdentifier.id,
      },
      include: {
        User: {
          select: {
            name: true,
          },
        },
      },
      take: pagination?.limit,
      skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
    });

    return customGroupMembers.map((cgm) => ({
      userId: cgm.user_id,
      name: cgm.User.name,
      groupIdentifier: groupIdentifierString,
      isAdmin: cgm.is_admin,
    }));
  }

  // Fetch auto group members
  if (groupIdentifier.ty === AutoGroupType.school) {
    // All users are member of school group
    const users = await prisma.user.findMany({
      where: {
        school_id: groupIdentifier.sc,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        Staff: {
          select: {
            role: true,
          },
        },
      },
      take: pagination?.limit,
      skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
    });

    return users.map((u) => ({
      groupIdentifier: groupIdentifierString,
      name: u.name,
      userId: u.id,
      isAdmin:
        u.Staff?.role === "principal" || u.Staff?.role === "vice_principal",
    }));
  } else if (groupIdentifier.ty === AutoGroupType.batch) {
    // TODO
  } else if (groupIdentifier.ty === AutoGroupType.section) {
    // TODO
  } else if (groupIdentifier.ty === AutoGroupType.subject) {
    // TODO
  }

  return [];
}
