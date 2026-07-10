import { z } from "zod";

export const CdiRoleSchema = z.enum([
  "VIEWER",
  "OPERATOR",
  "APPROVER",
  "ADMIN",
]);

export const CdiSessionSchema = z.object({
  subject: z.string().min(1),
  displayName: z.string().min(1),
  orgId: z.string().min(1),
  roles: z.array(CdiRoleSchema).min(1),
  accessToken: z.string().min(1).nullable(),
  mode: z.enum(["DEMO", "LIVE"]),
});

export type CdiRole = z.infer<typeof CdiRoleSchema>;
export type CdiSession = z.infer<typeof CdiSessionSchema>;
