import { z } from "zod";
import { getYear, getMonth, getDate } from "date-fns";
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
 * Given a user, get the role
 * @param user The user in question
 * @returns The role
 */
export function getUserRole(user: UnserializedUser | User): StaticRole {
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

/** Get appropritate display name based on gender and role */
export function getDisplayName(user: UnserializedUser | User) {
  const role = getUserRole(user);
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
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).slice(-2);
  }
  return colour;
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
 * Given a hex color, returns a color with good contrast
 * @param hexColor Only long form (6 digit) is supported
 * @param defaultColor The color to use, in case invalid hex value is given
 */
export function getTextColorForGivenBG(
  hexColor: string,
  defaultColor: "black" | "white" = "black"
) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return defaultColor;

  const { r, g, b } = rgb;

  // src: http://jsfiddle.net/alex_ball/PXJ2C/
  const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000);
  if (brightness > 125) {
    return "black";
  }
  return "white";
}

/**
 * Handwritten implementation of Promise.allSettled because React Native doesn't support it.
 * @param promises Array of promises
 */
export async function PromiseAllSettled<T extends readonly unknown[] | []>(
  promises: T
): Promise<{ -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>> }> {
  let wrappedPromises = promises.map((p) =>
    Promise.resolve(p).then(
      (val) => ({ status: "fulfilled", value: val }),
      (err) => ({ status: "rejected", reason: err })
    )
  );

  // @ts-ignore
  return Promise.all(wrappedPromises);
}
