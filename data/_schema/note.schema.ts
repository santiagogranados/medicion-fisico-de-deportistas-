import { z } from 'zod';
import { baseRecordSchema } from './base.schema';

export const noteInputSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(5000),
  category: z.enum(['general', 'importante', 'pendiente']),
  pinned: z.boolean().default(false),
});
export const noteRecordSchema = baseRecordSchema.extend(noteInputSchema.shape);
export type NoteRecord = z.infer<typeof noteRecordSchema>;
