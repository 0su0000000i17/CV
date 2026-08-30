import { z } from "zod";

export const uuidSchema = z.string().uuid();

export function boundedSearchQuery(value: unknown) {
  return String(value ?? "").trim().toLowerCase().slice(0, 120);
}
