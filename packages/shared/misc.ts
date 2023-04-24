import { z } from "zod";
import { getYear, getMonth, getDate, parseISO } from "date-fns";
import type { UnserializedUser, User } from "./types";

const MonthSchema = z.enum([
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
]);

export const NumberMonthMapping: Record<number, z.infer<typeof MonthSchema>> = {
  0: "jan",
  1: "feb",
  2: "mar",
  3: "apr",
  4: "may",
  5: "jun",
  6: "jul",
  7: "aug",
  8: "sep",
  9: "oct",
  10: "nov",
  11: "dec",
};

export enum StaticRole {
  none,
  principal,
  vice_principal,
  teacher,
  student,
  staff,
  parent,
}

/**
 * Given a user, get the role based on the roles hierarchy
 * @param user The user in question
 * @returns The role
 */
export function getUserRoleHierarchical(
  user: UnserializedUser | User | null | undefined,
): StaticRole {
  if (!user) return StaticRole.none;

  // Principal and vice principal have highest priority
  if (
    user.Staff &&
    (user.Staff.role === "principal" || user.Staff.role === "vice_principal")
  ) {
    return StaticRole[user.Staff.role];
  }

  // Teacher has 2nd highest priority
  if (user.Teacher) {
    return StaticRole.teacher;
  }

  // Student has 3rd highest priority
  if (user.Student) {
    return StaticRole.student;
  }

  // Non-principal staff has 4th highest priority
  if (user.Staff) {
    return StaticRole.staff;
  }

  // Parents has the 5th highest priority
  if (user.Parent) {
    return StaticRole.parent;
  }

  // This user has no role
  return StaticRole.none;
}

/**
 * Get all the static roles a use poses.
 * @param user
 */
export function getUserStaticRoles(
  user: UnserializedUser | User | null | undefined,
): StaticRole[] {
  if (!user) return [];

  const roles: StaticRole[] = [];

  if (user.teacher_id) roles.push(StaticRole.teacher);
  if (user.student_id) roles.push(StaticRole.student);
  if (user.parent_id) roles.push(StaticRole.parent);
  if (user.staff_id) {
    switch (user.Staff?.role) {
      case "principal":
        roles.push(StaticRole.principal);
        break;
      case "vice_principal":
        roles.push(StaticRole.vice_principal);
        break;
      case "others":
        roles.push(StaticRole.staff);
        break;
      default:
        console.warn(
          `User ${user.id} has staff_id defined, but the Staff object is not attached. The role is ${user.Staff?.role}. Please act on it asap.`,
        );
    }
  }

  return roles;
}

/**
 * Check if the user has the static roles.
 * @param user
 * @param requiredRoles
 * @param mode **all**: The user must have all the roles; **some**: The user must have at least one of the roles.
 */
export function hasUserStaticRoles(
  user: UnserializedUser | User | null | undefined,
  requiredRoles: StaticRole[],
  mode: "all" | "some",
): boolean {
  const roles = getUserStaticRoles(user);

  if (mode === "all") {
    return requiredRoles.every((r1) => roles.findIndex((r2) => r2 === r1) >= 0);
  }

  // mode: some
  return requiredRoles.some((r1) => roles.findIndex((r2) => r2 === r1) >= 0);
}

/** Get appropritate display name based on gender and role */
export function getDisplayName(user: UnserializedUser | User) {
  const role = getUserRoleHierarchical(user);

  const sirMam = user.gender
    ? user.gender === "Female"
      ? "ma'am"
      : "sir"
    : "sir";

  function onlySurnameFull(fullName: string) {
    const splitted = fullName.split(" ");
    if (splitted.length < 2) return fullName;
    const surname = splitted.pop();
    if (!surname) return fullName;
    const initials = splitted.map((s) => s[0].toUpperCase()).join(".");
    return `${initials}. ${surname}`;
  }

  function onlyFirstNameFull(fullName: string) {
    const splitted = fullName.split(" ");
    if (splitted.length < 2) return fullName;
    const firstName = splitted.shift();
    if (!firstName) return fullName;
    const initials = splitted.map((s) => s[0].toUpperCase()).join(".");
    return `${firstName} ${initials}.`;
  }

  switch (role) {
    case StaticRole.principal:
      return `Principal ${sirMam}`;
    case StaticRole.vice_principal:
      return `Vice principal ${sirMam}`;
    case StaticRole.teacher:
      return `${onlySurnameFull(user.name)} ${sirMam}`;
    case StaticRole.staff:
      return `${user.name} (staff member)`;
    case StaticRole.student:
      return onlyFirstNameFull(user.name);
    case StaticRole.parent:
      return `${onlySurnameFull(user.name)} (guardian)`;
    default:
      return user.name;
  }
}

/** The format for defining date of attendance */
export const dateOfAttendance = z
  .object({
    year: z.number().int(),
    month: MonthSchema,
    day: z.number().int().min(1).max(31),
  })
  .default(() => {
    const now = new Date();
    return {
      year: getYear(now),
      month: NumberMonthMapping[getMonth(now)],
      day: getDate(now),
    };
  });

/**
 * Given a user Id, compute their color. Based on https://stackoverflow.com/a/16348977/9990365
 * @param userId
 */
export function getUserColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }

  // If dark color
  if (getColorBrightness(color) < 125) {
    return getNegativeColor(color);
  }

  return color;
}

/**
 * Given a hex color, returns the R,G,B components. Based on https://stackoverflow.com/a/5624139/9990365
 * @param hexColor Only long form (6 digit) is supported
 */
function hexToRgb(hexColor: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Get brightness value of a color
 * @param hexColor
 */
export function getColorBrightness(hexColor: string) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  // src: http://jsfiddle.net/alex_ball/PXJ2C/
  const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000);

  return brightness;
}

/**
 * Get negative color of a color (See: https://stackoverflow.com/a/54569758/9990365)
 * @param hexColor
 */
export function getNegativeColor(hexColor: string) {
  return (
    "#" +
    (Number(`0x1${hexColor.slice(1)}`) ^ 0xffffff).toString(16).substring(1)
  );
}

/**
 * Given a hex color, returns a color with good contrast
 * @param hexColor Only long form (6 digit) is supported
 * @param defaultColor The color to use, in case invalid hex value is given
 */
export function getTextColorForGivenBG(
  hexColor: string,
  defaultColor: "black" | "white" = "black",
) {
  const brightness = getColorBrightness(hexColor);
  if (brightness > 125) {
    return "black";
  }
  return "white";
}

export const FilePermissionsInputSchema = z.object({
  permission_id: z.string().cuid(),
  file_name: z.string().optional(),
});

export type FilePermissionsInput = z.infer<typeof FilePermissionsInputSchema>;

export const examTestSchema = z.object({
  name: z.string().max(100).trim().optional(),
  class_id: z.number().int(),
  section_id: z.number().int().optional(),
  date: z
    .string()
    .datetime()
    .transform((d) => parseISO(d)),
  duration_minutes: z.number().int().min(0).default(0),
  subjectIds: z.string().cuid().array(),
  total_marks: z.number().int(),
});

export type ExamTestSchema = z.infer<typeof examTestSchema>;
