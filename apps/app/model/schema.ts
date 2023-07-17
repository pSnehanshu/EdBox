import { appSchema, tableSchema } from "@nozbe/watermelondb";
import { TableNames } from "./TableNames";

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: TableNames.GROUP,
      columns: [
        { name: "name", type: "string" },
        { name: "obj", type: "string" },
      ],
    }),
    tableSchema({
      name: TableNames.GROUP_ACTIVITY,
      columns: [
        { name: "obj", type: "string" },
        {
          name: "group_id",
          type: "string",
          isIndexed: true,
        },
        {
          name: "type",
          type: "string",
        },
        {
          name: "original_created_at", // WatermelonDB treats `created_at` as special, hence this name
          type: "number",
        },
      ],
    }),
  ],
});
