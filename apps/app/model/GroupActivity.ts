import { Model, Relation } from "@nozbe/watermelondb";
import { date, field, relation } from "@nozbe/watermelondb/decorators";
import type { GroupActivityType } from "@prisma/client";
import Group from "./Group";
import { TableNames } from "./TableNames";

export default class GroupActivity extends Model {
  static table = "group_activity";

  @field("obj") obj!: string;
  @field("group_id") groupId!: string;
  @relation(TableNames.GROUP, "group_id") group!: Relation<Group>;
  @field("type") type!: GroupActivityType;
  @date("original_created_at") actCreatedAt!: Date;
}
