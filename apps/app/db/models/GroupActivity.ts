import { Model, Relation } from "@nozbe/watermelondb";
import { date, field, relation } from "@nozbe/watermelondb/decorators";
import type { GroupActivityType } from "@prisma/client";
import { GroupActivitySchema } from "schooltalk-shared/group-schemas";
import { TableNames } from "../TableNames";
import Group from "./Group";

export default class GroupActivity extends Model {
  static table = "group_activity";

  @field("obj") obj!: string;

  get activityObject() {
    try {
      const obj = JSON.parse(this.obj) as unknown;
      return GroupActivitySchema.parse(obj);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  @field("group_id") groupId!: string;
  @relation(TableNames.GROUP, "group_id") group!: Relation<Group>;
  @field("type") type!: GroupActivityType;
  @date("original_created_at") actCreatedAt!: Date;
}
