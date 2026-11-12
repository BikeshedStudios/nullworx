import { z } from "zod";

export const dropsSchema = z.strictObject({
  email: z.email().max(254),
  source: z.enum(["home", "footer", "drops"]),
  website: z.string().max(200).optional(),
});

export type DropsSubmission = z.infer<typeof dropsSchema>;
