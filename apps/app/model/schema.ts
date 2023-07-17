import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "group",
      columns: [
        { name: "name", type: "string" },
        { name: "obj", type: "string" },
      ],
    }),
    tableSchema({
      name: "group_activity",
      columns: [
        { name: "obj", type: "string" },
        {
          name: "group_id",
          type: "string",
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
