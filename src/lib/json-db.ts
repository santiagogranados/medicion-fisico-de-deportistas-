import { mkdir, readFile, rename, copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { BaseRecord, CollectionFile, CreateInput, QueryOptions, QueryResult, UpdateInput } from './types';
import { generateId, now } from './utils';

export class JsonDBError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'DUPLICATE_ID' | 'VALIDATION_ERROR' | 'IO_ERROR',
  ) {
    super(message);
    this.name = 'JsonDBError';
  }
}

export class ReadOnlyError extends Error {
  constructor() {
    super('Las escrituras están deshabilitadas en producción sin un adapter persistente.');
    this.name = 'ReadOnlyError';
  }
}

const locks = new Map<string, Promise<void>>();

function dataDirectory(): string {
  return path.resolve(process.env.DATA_DIR ?? './data');
}

function resolveCollectionPath(collection: string): string {
  if (!/^[a-z0-9-]+$/.test(collection)) {
    throw new JsonDBError('Nombre de colección inválido.', 'VALIDATION_ERROR');
  }

  return path.join(dataDirectory(), `${collection}.json`);
}

async function readCollection<T extends BaseRecord>(collection: string): Promise<CollectionFile<T>> {
  const filePath = resolveCollectionPath(collection);

  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as CollectionFile<T>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new JsonDBError(`La colección "${collection}" no existe.`, 'NOT_FOUND');
    }

    throw new JsonDBError('No se pudo leer la colección.', 'IO_ERROR');
  }
}

async function writeCollection<T extends BaseRecord>(collection: string, data: CollectionFile<T>): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new ReadOnlyError();
  }

  const filePath = resolveCollectionPath(collection);
  const backupDirectory = path.join(dataDirectory(), '_backups');
  const previous = locks.get(filePath) ?? Promise.resolve();
  const next = previous.then(async () => {
    await mkdir(backupDirectory, { recursive: true });
    try {
      await copyFile(filePath, path.join(backupDirectory, `${collection}_${Date.now()}.json`));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }

    const temporaryPath = `${filePath}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(data, null, 2), 'utf8');
    await rename(temporaryPath, filePath);
  });

  locks.set(filePath, next);
  try {
    await next;
  } finally {
    if (locks.get(filePath) === next) locks.delete(filePath);
  }
}

export async function getAll<T extends BaseRecord>(collection: string, options: QueryOptions = {}): Promise<QueryResult<T>> {
  const file = await readCollection<T>(collection);
  const offset = Math.max(options.offset ?? 0, 0);
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  const records = [...file.records];

  if (options.sortBy) {
    records.sort((left, right) => {
      const a = String(left[options.sortBy as keyof T] ?? '');
      const b = String(right[options.sortBy as keyof T] ?? '');
      const result = a.localeCompare(b, 'es', { numeric: true });
      return options.sortOrder === 'desc' ? -result : result;
    });
  }

  return { data: records.slice(offset, offset + limit), total: records.length, limit, offset };
}

export async function getById<T extends BaseRecord>(collection: string, id: string): Promise<T | null> {
  const file = await readCollection<T>(collection);
  return file.records.find((record) => record.id === id) ?? null;
}

export async function create<T extends BaseRecord>(collection: string, input: CreateInput<T>): Promise<T> {
  const file = await readCollection<T>(collection);
  const timestamp = now();
  const record = { ...input, id: generateId(collection.slice(0, 3)), createdAt: timestamp, updatedAt: timestamp } as T;
  if (file.records.some((item) => item.id === record.id)) throw new JsonDBError('ID duplicado.', 'DUPLICATE_ID');
  file.records.push(record);
  file._meta.lastModified = timestamp;
  await writeCollection(collection, file);
  return record;
}

export async function update<T extends BaseRecord>(collection: string, id: string, partial: UpdateInput<T>): Promise<T> {
  const file = await readCollection<T>(collection);
  const index = file.records.findIndex((record) => record.id === id);
  if (index < 0) throw new JsonDBError('Registro no encontrado.', 'NOT_FOUND');
  const current = file.records[index];
  if (!current) throw new JsonDBError('Registro no encontrado.', 'NOT_FOUND');
  const record = { ...current, ...partial, id, updatedAt: now() } as T;
  file.records[index] = record;
  file._meta.lastModified = record.updatedAt;
  await writeCollection(collection, file);
  return record;
}

export async function remove(collection: string, id: string): Promise<boolean> {
  const file = await readCollection(collection);
  const nextRecords = file.records.filter((record) => record.id !== id);
  if (nextRecords.length === file.records.length) throw new JsonDBError('Registro no encontrado.', 'NOT_FOUND');
  file.records = nextRecords;
  file._meta.lastModified = now();
  await writeCollection(collection, file);
  return true;
}

export async function query<T extends BaseRecord>(collection: string, filter: (record: T) => boolean): Promise<T[]> {
  const file = await readCollection<T>(collection);
  return file.records.filter(filter);
}

export async function count(collection: string): Promise<number> {
  const file = await readCollection(collection);
  return file.records.length;
}
