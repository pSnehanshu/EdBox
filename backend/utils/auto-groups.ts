import { User } from "@prisma/client";
import prisma from "../prisma";
import {
  getClassGroupIdentifier,
  getSchoolGroupIdentifier,
  getSectionGroupIdentifier,
  getSubjectGroupIdentifier,
  GroupBasicInfo,
} from "./group-identifier";
import _ from "lodash";

/**
 * Get list of all automatic groups a user is part of
 * @param user
 */
export async function getAutoGroups(
  user: Pick<
    User,
    "school_id" | "teacher_id" | "student_id" | "parent_id" | "staff_id"
  >
): Promise<GroupBasicInfo[]> {
  const schoolId = user.school_id;

  // School group
  const schoolGroup: GroupBasicInfo = {
    id: getSchoolGroupIdentifier(schoolId),
    name: "School group",
    gd: "a",
  };

  const classGroups: GroupBasicInfo[] = [];
  const sectionGroups: GroupBasicInfo[] = [];
  const subjectGroups: GroupBasicInfo[] = [];

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

    if (teacher && teacher.is_active && teacher.school_id === schoolId) {
      // Subject groups
      _.uniqBy(teacher.Periods, (p) => p.subject_id).forEach(
        ({ Subject, Class, Section }) => {
          const className = Class.name ?? Class.numeric_id;
          const sectionName = Section.name ?? Section.numeric_id;

          // Subject group
          subjectGroups.push({
            gd: "a",
            id: getSubjectGroupIdentifier(schoolId, Subject.id),
            name: `${Subject.name} - Class ${className} (${sectionName})`,
          });
        }
      );

      // Class groups
      _.uniqBy(teacher.Periods, (p) => p.class_id).forEach(({ Class }) => {
        const className = Class.name ?? Class.numeric_id;

        // Class group
        classGroups.push({
          gd: "a",
          id: getClassGroupIdentifier(schoolId, Class.numeric_id),
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
      student.is_active &&
      student.school_id === schoolId &&
      student.CurrentBatch?.Class
    ) {
      // Class group (A student can belong to only one class)
      const Class = student.CurrentBatch.Class;
      const className = Class.name ?? Class.numeric_id;

      classGroups.push({
        gd: "a",
        id: getClassGroupIdentifier(schoolId, Class.numeric_id),
        name: `Class ${className} (all sections)`,
      });

      // Class group (A student can belong to only one section)
      if (typeof student.section === "number") {
        const section = await prisma.classSection.findUnique({
          where: {
            numeric_id_class_id_school_id: {
              class_id: Class.numeric_id,
              numeric_id: student.section,
              school_id: schoolId,
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
            gd: "a",
            id: getSectionGroupIdentifier(
              schoolId,
              Class.numeric_id,
              section.numeric_id
            ),
            name: `Class ${className} (${sectionName})`,
          });

          // Fetch all the subject groups
          _.uniqBy(section.Periods, (p) => p.subject_id).forEach(
            ({ Subject }) => {
              subjectGroups.push({
                gd: "a",
                name: `${Subject.name} - Class ${className} (${sectionName})`,
                id: getSubjectGroupIdentifier(schoolId, Subject.id),
              });
            }
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
