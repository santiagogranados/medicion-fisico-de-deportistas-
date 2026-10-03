import { z } from 'zod';
import { baseRecordSchema } from './base.schema';

export const userRecordSchema = baseRecordSchema.extend({
  email: z.email(),
  displayName: z.string().min(1).max(100),
  passwordHash: z.string().min(1),
  role: z.enum(['admin', 'editor', 'viewer']),
  active: z.boolean(),
});

export type UserRecord = z.infer<typeof userRecordSchema>;