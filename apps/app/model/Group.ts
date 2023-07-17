import { Model } from "@nozbe/watermelondb";
import { field, text } from "@nozbe/watermelondb/decorators";

export default class Group extends Model {
  static table = "group";

  @text("name") name!: string;
  @field("obj") obj!: string;
}
