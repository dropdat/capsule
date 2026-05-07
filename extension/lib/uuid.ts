import { v7 as uuidv7 } from "uuid";

/** Lexicographically-sortable, time-ordered uuid. */
export function newCapsuleId(): string {
  return uuidv7();
}
