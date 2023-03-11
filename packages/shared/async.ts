/**
 * This script re-exports `async`'s functions in a more usable manner.
 * It basically asyncifies them.
 */

import { everyLimit as _everyLimit } from "async";

export async function everyLimit<T = unknown>(
  collection: T[],
  limit: number,
  iterator: (item: T) => Promise<boolean>,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    _everyLimit(
      collection,
      limit,
      (item, callback) => {
        iterator(item)
          .then((result) => callback(null, result))
          .catch((error) => callback(error));
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(!!result);
        }
      },
    );
  });
}
