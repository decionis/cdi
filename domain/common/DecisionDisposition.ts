import { z } from "zod";

export const DecisionDispositionSchema = z.enum([
  "ALLOW",
  "BLOCK",
  "ESCALATE",
  "REVIEW",
]);

export type DecisionDisposition = z.infer<typeof DecisionDispositionSchema>;
