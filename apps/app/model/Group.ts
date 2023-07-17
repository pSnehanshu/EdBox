import { Model, Query } from "@nozbe/watermelondb";
import { field, text, children } from "@nozbe/watermelondb/decorators";
import GroupActivity from "./GroupActivity";
import { TableNames } from "./TableNames";

export default class Group extends Model {
  static table = "group";

  @text("name") name!: string;
  @field("obj") obj!: string;
  @children(TableNames.GROUP_ACTIVITY) activities!: Query<GroupActivity>;
}
