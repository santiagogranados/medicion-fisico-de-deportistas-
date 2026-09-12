import type { ZodObject, ZodRawShape } from 'zod';
import { exampleRecordSchema } from './example.schema';
import { noteRecordSchema } from './note.schema';

export const schemaRegistry: Record<string, ZodObject<ZodRawShape>> = {
  example: exampleRecordSchema,
  note: noteRecordSchema,
};

export function getSchema(collection: string): ZodObject<ZodRawShape> | null {
  return schemaRegistry[collection] ?? null;
}
