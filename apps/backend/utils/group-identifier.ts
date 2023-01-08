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

const AutoGroupIdentifierBase = z.object({
  gd: z.literal("a"),
  sc: cuid,
});

export const ClassGroupIdentifier = AutoGroupIdentifierBase.extend({
  ty: z.literal("cl"),
  cl: int,
});

export const SectionGroupIdentifier = AutoGroupIdentifierBase.extend({
  ty: z.literal("se"),
  cl: int,
  se: int,
});

export const SchoolGroupIdentifier = AutoGroupIdentifierBase.extend({
  ty: z.literal("sc"),
});

export const SubjectGroupIdentifier = AutoGroupIdentifierBase.extend({
  ty: z.literal("su"),
  su: cuid,
});

export const AutoGroupIdentifier = z.discriminatedUnion("ty", [
  ClassGroupIdentifier,
  SectionGroupIdentifier,
  SchoolGroupIdentifier,
  SubjectGroupIdentifier,
]);

export const GroupIdentifier = z.union([
  CustomGroupIdentifier,
  AutoGroupIdentifier,
]);

export type GroupIdentifier = z.infer<typeof GroupIdentifier>;

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

export function parseGroupIdentifierString(
  identifier: string
): GroupIdentifier {
  const opts = identifier.split("&");
  const final: Record<string, string | number> = {};
  opts.forEach((opt) => {
    const keyVal = opt.split("=");
    const key = decodeURIComponent(keyVal[0]);
    const val = decodeURIComponent(keyVal[1]);

    // Convert to int if possible
    final[key] = /^\d+$/.test(val) ? parseInt(val, 10) : val;
  });

  return GroupIdentifier.parse(final);
}

/**
 * A zod schema to validate and parse Group Identifier strings
 */
export const groupIdentifierSchema = z.string().transform((val, ctx) => {
  try {
    return parseGroupIdentifierString(val);
  } catch (error) {
    ctx.addIssue({
      code: "custom",
      message: "Not a proper Group Identifier String",
    });
    return z.NEVER;
  }
});

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

export function getSectionGroupIdentifier(
  schoolId: string,
  classNum: number,
  sectionNum: number
) {
  const id: z.infer<typeof SectionGroupIdentifier> = {
    gd: "a",
    ty: "se",
    sc: schoolId,
    cl: classNum,
    se: sectionNum,
  };
  return convertObjectToOrderedQueryString(id);
}

export function getSubjectGroupIdentifier(schoolId: string, subjectId: string) {
  const id: z.infer<typeof SubjectGroupIdentifier> = {
    gd: "a",
    ty: "su",
    sc: schoolId,
    su: subjectId,
  };
  return convertObjectToOrderedQueryString(id);
}

export function getGroupIdentifier(idf: GroupIdentifier) {
  if (idf.gd === "c") return getCustomGroupIdentifier(idf.sc, idf.id);

  switch (idf.ty) {
    case "sc":
      return getSchoolGroupIdentifier(idf.sc);
    case "cl":
      return getClassGroupIdentifier(idf.sc, idf.cl);
    case "se":
      return getSectionGroupIdentifier(idf.sc, idf.cl, idf.se);
    case "su":
      return getSubjectGroupIdentifier(idf.sc, idf.su);
  }
}
