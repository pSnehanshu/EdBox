import { z } from "zod";

const cuid = z.string().cuid();
const int = z.number().int();

export enum GroupDefinition {
  custom = "c",
  auto = "a",
}

export enum AutoGroupType {
  batch = "ba",
  section = "se",
  school = "sc",
  subject = "su",
}

export const CustomGroupIdentifier = z.object({
  gd: z.literal(GroupDefinition.custom),
  sc: cuid,
  id: cuid,
});

const AutoGroupIdentifierBase = z.object({
  gd: z.literal(GroupDefinition.auto),
  sc: cuid,
});

export const BatchGroupIdentifier = AutoGroupIdentifierBase.extend({
  ty: z.literal(AutoGroupType.batch),
  ba: int,
});

export const SectionGroupIdentifier = AutoGroupIdentifierBase.extend({
  ty: z.literal(AutoGroupType.section),
  ba: int,
  se: int,
});

export const SchoolGroupIdentifier = AutoGroupIdentifierBase.extend({
  ty: z.literal(AutoGroupType.school),
});

export const SubjectGroupIdentifier = AutoGroupIdentifierBase.extend({
  ty: z.literal(AutoGroupType.subject),
  su: cuid,
  ba: int,
});

export const AutoGroupIdentifier = z.discriminatedUnion("ty", [
  BatchGroupIdentifier,
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
        `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`,
      );
    });

  return finalString.join("&");
}

export function parseGroupIdentifierString(
  identifier: string,
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
  groupId: string,
): string {
  const id: z.infer<typeof CustomGroupIdentifier> = {
    gd: GroupDefinition.custom,
    id: groupId,
    sc: schoolId,
  };
  return convertObjectToOrderedQueryString(id);
}

export function getSchoolGroupIdentifier(schoolId: string): string {
  const id: z.infer<typeof SchoolGroupIdentifier> = {
    gd: GroupDefinition.auto,
    ty: AutoGroupType.school,
    sc: schoolId,
  };
  return convertObjectToOrderedQueryString(id);
}

export function getBatchGroupIdentifier(
  schoolId: string,
  batchNum: number,
): string {
  const id: z.infer<typeof BatchGroupIdentifier> = {
    gd: GroupDefinition.auto,
    ty: AutoGroupType.batch,
    sc: schoolId,
    ba: batchNum,
  };
  return convertObjectToOrderedQueryString(id);
}

export function getSectionGroupIdentifier(
  schoolId: string,
  batchNum: number,
  sectionNum: number,
) {
  const id: z.infer<typeof SectionGroupIdentifier> = {
    gd: GroupDefinition.auto,
    ty: AutoGroupType.section,
    sc: schoolId,
    ba: batchNum,
    se: sectionNum,
  };
  return convertObjectToOrderedQueryString(id);
}

export function getSubjectGroupIdentifier(
  schoolId: string,
  subjectId: string,
  batchNum: number,
) {
  const id: z.infer<typeof SubjectGroupIdentifier> = {
    gd: GroupDefinition.auto,
    ty: AutoGroupType.subject,
    sc: schoolId,
    su: subjectId,
    ba: batchNum,
  };
  return convertObjectToOrderedQueryString(id);
}

export function getGroupIdentifier(idf: GroupIdentifier) {
  if (idf.gd === "c") return getCustomGroupIdentifier(idf.sc, idf.id);

  switch (idf.ty) {
    case AutoGroupType.school:
      return getSchoolGroupIdentifier(idf.sc);
    case AutoGroupType.batch:
      return getBatchGroupIdentifier(idf.sc, idf.ba);
    case AutoGroupType.section:
      return getSectionGroupIdentifier(idf.sc, idf.ba, idf.se);
    case AutoGroupType.subject:
      return getSubjectGroupIdentifier(idf.sc, idf.su, idf.ba);
  }
}
