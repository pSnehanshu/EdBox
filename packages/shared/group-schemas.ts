import { z } from "zod";
import { GroupActivityType } from "@prisma/client";

const MessageNewSchema = z.object({
  t: z.literal(GroupActivityType.message_new),
  body: z.string(),
  fileIds: z.string().cuid().array().optional(),
});

const MessageEditSchema = z.object({
  t: z.literal(GroupActivityType.message_edit),
  body: z.string(),
  fileIds: z.string().cuid().array().optional(),
});

const MessageDeleteSchema = z.object({
  t: z.literal(GroupActivityType.message_delete),
});

const MemberAddSchema = z.object({
  t: z.literal(GroupActivityType.member_add),
  id: z.string().cuid(),
  name: z.string(),
});

const MemberRemoveSchema = z.object({
  t: z.literal(GroupActivityType.member_remove),
  name: z.string(),
  id: z.string().cuid(),
});

const NameChangeSchema = z.object({
  t: z.literal(GroupActivityType.name_change),
  name: z.string(),
});

const DescriptionChangeSchema = z.object({
  t: z.literal(GroupActivityType.description_change),
  des: z.string(),
});

const IconChangeSchema = z.object({
  t: z.literal(GroupActivityType.icon_change),
  fileId: z.string().cuid(),
});

const ReadReceiptSchema = z.object({
  t: z.literal(GroupActivityType.read),
});

const DeliveryReceiptSchema = z.object({
  t: z.literal(GroupActivityType.delivered),
});

export const ActivityPayloadSchema = z.discriminatedUnion("t", [
  MessageNewSchema,
  MessageEditSchema,
  MessageDeleteSchema,
  MemberAddSchema,
  MemberRemoveSchema,
  NameChangeSchema,
  DescriptionChangeSchema,
  IconChangeSchema,
  ReadReceiptSchema,
  DeliveryReceiptSchema,
]);

export const GroupActivitySchema = z.object({
  id: z.string().uuid(),
  author_id: z.string().cuid().nullish(),
  is_system_generated: z.boolean(),
  group_id: z.string().cuid(),
  parent_id: z.string().uuid().nullish(),
  created_at: z.string().datetime(),
  payload: ActivityPayloadSchema,
  type: z.nativeEnum(GroupActivityType),
});
