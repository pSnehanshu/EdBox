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

/**
 * Given a user, get the role
 * @param user The user in question
 * @returns The role
 */
export function getUserRole(user: UnserializedUser | User) {
  // Principal and vice principal have highest priority
  if (
    user.Staff &&
    (user.Staff.role === "principal" || user.Staff.role === "vice_principal")
  ) {
    return user.Staff.role;
  }

  // Teacher has 2nd highest priority
  if (user.Teacher) {
    return "teacher";
  }

  // Student has 3rd highest priority
  if (user.Student) {
    return "student";
  }

  // Non-principal staff has 4th highest priority
  if (user.Staff) {
    return "staff";
  }

  // Parents has the 5th highest priority
  if (user.Parent) {
    return "parent";
  }

  // This user has no role
  return "none";
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
