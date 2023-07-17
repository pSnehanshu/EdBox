import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import schema from "./schema";
import migrations from "./migrations";
import { TableNames } from "./TableNames";

// Models
import Group from "./models/Group";
import GroupActivity from "./models/GroupActivity";

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true,
  onSetUpError: (error) => {
    console.error("Error setting up wDB", error);
    // Database failed to load -- offer the user to reload the app or log out
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Group, GroupActivity],
});

/** A Map of all the table Collection objects */
export const Tables = {
  [TableNames.GROUP]: database.get<Group>(TableNames.GROUP),
  [TableNames.GROUP_ACTIVITY]: database.get<GroupActivity>(
    TableNames.GROUP_ACTIVITY,
  ),
};
