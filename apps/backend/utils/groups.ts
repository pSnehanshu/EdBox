import { User } from "@prisma/client";
import prisma from "../prisma";
import {
  convertObjectToOrderedQueryString,
  getClassGroupIdentifier,
  getCustomGroupIdentifier,
  getSchoolGroupIdentifier,
  getSectionGroupIdentifier,
  getSubjectGroupIdentifier,
  GroupIdentifier,
} from "./group-identifier";
import _ from "lodash";
import { Group } from "schooltalk-shared/types";

/**
 * Get list of all automatic groups a user is part of
 * @param user
 */
async function getAutoGroups(
  user: Pick<
    User,
    "school_id" | "teacher_id" | "student_id" | "parent_id" | "staff_id"
  >,
): Promise<Group[]> {
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

  const classGroups: Group[] = [];
  const sectionGroups: Group[] = [];
  const subjectGroups: Group[] = [];

  if (user.teacher_id) {
    // Fetch necessary info about the teacher
    const teacher = await prisma.teacher.findUnique({
      where: { id: user.teacher_id },
      include: {
        Periods: {
          where: {
            is_active: true,
            Class: {
              is_active: true,
            },
            Subject: {
              is_active: true,
            },
          },
          include: {
            Class: true,
            Subject: true,
            Section: true,
          },
        },
      },
    });

    if (teacher && teacher.school_id === school.id) {
      // Subject groups
      _.uniqBy(teacher.Periods, (p) => p.subject_id).forEach(
        ({ Subject, Class, Section }) => {
          const className = Class.name ?? Class.numeric_id;
          const sectionName = Section.name ?? Section.numeric_id;

          // Subject group
          subjectGroups.push({
            identifier: getSubjectGroupIdentifier(
              school.id,
              Subject.id,
              Class.numeric_id,
            ),
            name: `${Subject.name} - Class ${className}`,
          });
        },
      );

      // Class groups
      _.uniqBy(teacher.Periods, (p) => p.class_id).forEach(({ Class }) => {
        const className = Class.name ?? Class.numeric_id;

        // Class group
        classGroups.push({
          identifier: getClassGroupIdentifier(school.id, Class.numeric_id),
          name: `Class ${className} (all sections)`,
        });
      });
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

    // Check if they belong to any class
    if (
      student &&
      student.school_id === school.id &&
      student.CurrentBatch?.Class
    ) {
      // Class group (A student can belong to only one class)
      const Class = student.CurrentBatch.Class;
      const className = Class.name ?? Class.numeric_id;

      classGroups.push({
        identifier: getClassGroupIdentifier(school.id, Class.numeric_id),
        name: `Class ${className} (all sections)`,
      });

      // Class group (A student can belong to only one section)
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
              where: {
                is_active: true,
                Subject: {
                  is_active: true,
                },
              },
              include: {
                Subject: true,
              },
            },
          },
        });

        if (section) {
          const sectionName = section.name ?? section.numeric_id;

          sectionGroups.push({
            identifier: getSectionGroupIdentifier(
              school.id,
              Class.numeric_id,
              section.numeric_id,
            ),
            name: `Class ${className} (${sectionName})`,
          });

          // Fetch all the subject groups
          _.uniqBy(section.Periods, (p) => p.subject_id).forEach(
            ({ Subject }) => {
              subjectGroups.push({
                name: `${Subject.name} - Class ${className}`,
                identifier: getSubjectGroupIdentifier(
                  school.id,
                  Subject.id,
                  Class.numeric_id,
                ),
              });
            },
          );
        }
      }
    }
  }
  if (user.parent_id) {
    // Fetch the class where their children study
  }
  if (user.staff_id) {
    // Fetch staff specific groups
  }

  return [schoolGroup, ...classGroups, ...sectionGroups, ...subjectGroups];
}

/**
 * Get a list of groups, the user is part of.
 * @param user
 * @param pagination
 * @returns
 */
export async function getUserGroups(
  user: Pick<
    User,
    "id" | "school_id" | "teacher_id" | "student_id" | "parent_id" | "staff_id"
  >,
  pagination?: { page: number; limit: number },
): Promise<Group[]> {
  // Fetch all custom groups
  const customGroupMembers = await prisma.customGroupMembers.findMany({
    where: {
      user_id: user.id,
      Group: {
        is_active: true,
      },
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

  if (groupIdentifier.gd === "c") {
    // Fetch all custom groups
    const customGroupMembers = await prisma.customGroupMembers.findMany({
      where: {
        group_id: groupIdentifier.id,
        Group: {
          is_active: true,
        },
        User: {
          is_active: true,
        },
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
  if (groupIdentifier.ty === "sc") {
    // All users are member of school group
    const users = await prisma.user.findMany({
      where: {
        school_id: groupIdentifier.sc,
        is_active: true,
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
  } else if (groupIdentifier.ty === "cl") {
    // TODO
  } else if (groupIdentifier.ty === "se") {
    // TODO
  } else if (groupIdentifier.ty === "su") {
    // TODO
  }

  return [];
}
