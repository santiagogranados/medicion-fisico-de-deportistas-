import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function ensureUserCollection(): Promise<void> {
  const filePath = path.join(path.resolve(process.env.DATA_DIR ?? './data'), 'user.json');
  await mkdir(path.dirname(filePath), { recursive: true });

  try {
    await readFile(filePath, 'utf8');
    return;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }

  const timestamp = new Date().toISOString();
  const emptyCollection = {
    _meta: { version: 1, lastModified: timestamp, description: 'Usuarios locales con contraseñas hasheadas' },
    records: [],
  };
  try {
    await writeFile(filePath, JSON.stringify(emptyCollection, null, 2), { encoding: 'utf8', flag: 'wx' });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
  }
}