import { z } from "zod";

export const SourceHealthSchema = z.enum([
  "HEALTHY",
  "DEGRADED",
  "STALE",
  "DISCONNECTED",
]);

export type SourceHealth = z.infer<typeof SourceHealthSchema>;
