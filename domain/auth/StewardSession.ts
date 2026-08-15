import { z } from "zod";

export const StewardRoleSchema = z.enum([
  "VIEWER",
  "OPERATOR",
  "APPROVER",
  "ADMIN",
]);

export const StewardSessionSchema = z.object({
  subject: z.string().min(1),
  displayName: z.string().min(1),
  orgId: z.string().min(1),
  roles: z.array(StewardRoleSchema).min(1),
  accessToken: z.string().min(1).nullable(),
  mode: z.enum(["DEMO", "LIVE"]),
});

export type StewardRole = z.infer<typeof StewardRoleSchema>;
export type StewardSession = z.infer<typeof StewardSessionSchema>;
