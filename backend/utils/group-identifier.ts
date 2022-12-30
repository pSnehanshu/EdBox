import { z } from "zod";

export type GroupBasicInfo = {
  id: string;
  name: string;
  /** Group Definition: a-automatic, c-custom */
  gd: "a" | "c";
};

const cuid = z.string().cuid();
const int = z.number().int();

export const CustomGroupIdentifier = z.object({
  gd: z.literal("c"),
  sc: cuid,
  id: cuid,
});

const AutoGroupIdentifier = z.object({
  gd: z.literal("a"),
  sc: cuid,
});

export const ClassGroupIdentifier = AutoGroupIdentifier.extend({
  ty: z.literal("cl"),
  cl: int,
});

export const SectionGroupIdentifier = AutoGroupIdentifier.extend({
  ty: z.literal("se"),
  cl: int,
  se: int,
});

export const SchoolGroupIdentifier = AutoGroupIdentifier.extend({
  ty: z.literal("sc"),
});

export const SubjectGroupIdentifier = AutoGroupIdentifier.extend({
  ty: z.literal("su"),
  su: cuid,
});

/**
 * Given an object, convert to query string but with keys alphabetically ordered
 * @param obj
 * @returns
 */
export function convertObjectToOrderedQueryString(obj: { [k: string]: any }) {
  const finalString: string[] = [];

  Object.keys(obj)
    .sort()
    .forEach((key) => {
      finalString.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`
      );
    });

  return finalString.join("&");
}

export function getCustomGroupIdentifier(
  schoolId: string,
  groupId: string
): string {
  const id: z.infer<typeof CustomGroupIdentifier> = {
    gd: "c",
    id: groupId,
    sc: schoolId,
  };
  return convertObjectToOrderedQueryString(id);
}

export function getSchoolGroupIdentifier(schoolId: string): string {
  const id: z.infer<typeof SchoolGroupIdentifier> = {
    gd: "a",
    ty: "sc",
    sc: schoolId,
  };
  return convertObjectToOrderedQueryString(id);
}

export function getClassGroupIdentifier(
  schoolId: string,
  classNum: number
): string {
  const id: z.infer<typeof ClassGroupIdentifier> = {
    gd: "a",
    ty: "cl",
    sc: schoolId,
    cl: classNum,
  };
  return convertObjectToOrderedQueryString(id);
}
