import type { Migration } from "./db";

/**
 * This is the array of migrations. These are applied sequentially.
 * Once a migration is applied, it is recorded and not applied again.
 *
 * When writing migrations, always add new migrations to the bottom
 * of the list. Never write it in the middle, it won't be executed.
 *
 * While applying a subset of the following migrations, even if one fails,
 * none are applied. To reset the DB structure to inital, the app data
 * has to be cleared.
 */
export const migrations: Migration[] = [
  {
    name: "create groups table",
    async fn(tx) {
      tx.executeSql(
        `CREATE TABLE groups (
        id TEXT NOT NULL PRIMARY KEY,
        obj TEXT NOT NULL
      );`,
        [],
      );
    },
  },
  {
    name: "create messages table",
    async fn(tx) {
      tx.executeSql(
        `CREATE TABLE messages (
        id TEXT NOT NULL PRIMARY KEY,
        obj TEXT NOT NULL,
        created_at TEXT NOT NULL,
        group_identifier TEXT NOT NULL,
        sort_key INTEGER NOT NULL
      );`,
      );
      tx.executeSql(
        "CREATE UNIQUE INDEX messages_sort_key_unique_index ON messages(sort_key);",
      );
    },
  },
];
