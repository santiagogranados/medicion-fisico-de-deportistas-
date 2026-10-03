// @vitest-environment node

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { POST as register } from '@/app/api/auth/register/route';
import { POST as login } from '@/app/api/auth/login/route';
import { middleware } from '../../middleware';
import { getSchema } from '@data/_schema/registry';
import { NextRequest } from 'next/server';

let testDataDirectory: string;
let originalDataDirectory: string | undefined;

function post(body: unknown): Request {
  return new Request('http://localhost/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  originalDataDirectory = process.env.DATA_DIR;
  testDataDirectory = await mkdtemp(path.join(os.tmpdir(), 'medifis-auth-'));
  process.env.DATA_DIR = testDataDirectory;
});

beforeEach(async () => {
  await writeFile(path.join(testDataDirectory, 'user.json'), JSON.stringify({
    _meta: { version: 1, lastModified: new Date().toISOString(), description: 'Prueba' },
    records: [],
  }));
});

afterAll(async () => {
  if (originalDataDirectory === undefined) delete process.env.DATA_DIR;
  else process.env.DATA_DIR = originalDataDirectory;
  await rm(testDataDirectory, { recursive: true, force: true });
});

describe('autenticación local', () => {
  it('registra con hash, inicia sesión y no publica la colección de usuarios', async () => {
    const registration = await register(post({
      email: '  EQUIPO@MEDIFIS.LOCAL ',
      password: 'una-clave-local-segura',
      displayName: 'Equipo Medifis',
    }));

    expect(registration.status).toBe(201);
    expect(registration.headers.get('set-cookie')).toContain('medifis_session=');

    const stored = JSON.parse(await readFile(path.join(testDataDirectory, 'user.json'), 'utf8')) as {
      records: Array<{ email: string; passwordHash: string; role: string }>;
    };
    expect(stored.records[0]?.email).toBe('equipo@medifis.local');
    expect(stored.records[0]?.passwordHash).not.toBe('una-clave-local-segura');
    expect(stored.records[0]?.role).toBe('admin');
    expect(getSchema('user')).toBeNull();

    const loginResponse = await login(post({ email: 'equipo@medifis.local', password: 'una-clave-local-segura' }));
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers.get('set-cookie')).toContain('medifis_session=');

    const cookie = loginResponse.headers.get('set-cookie')?.split(';')[0] ?? '';
    const allowed = await middleware(new NextRequest('http://localhost/api/data/note', { headers: { cookie } }));
    expect(allowed.headers.get('x-middleware-next')).toBe('1');
  });

  it('rechaza credenciales incorrectas y cuentas duplicadas', async () => {
    await register(post({ email: 'persona@medifis.local', password: 'otra-clave-segura-123', displayName: 'Persona' }));

    const duplicate = await register(post({ email: 'persona@medifis.local', password: 'otra-clave-segura-123', displayName: 'Persona' }));
    const invalidLogin = await login(post({ email: 'persona@medifis.local', password: 'clave-incorrecta' }));

    expect(duplicate.status).toBe(409);
    expect(invalidLogin.status).toBe(401);

    const denied = await middleware(new NextRequest('http://localhost/api/data/note'));
    expect(denied.status).toBe(401);
  });

  it('crea la colección al registrar en una instalación limpia', async () => {
    await rm(path.join(testDataDirectory, 'user.json'));
    const response = await register(post({ email: 'primera@medifis.local', password: 'clave-local-larga-123', displayName: 'Primera' }));
    expect(response.status).toBe(201);
  });
});