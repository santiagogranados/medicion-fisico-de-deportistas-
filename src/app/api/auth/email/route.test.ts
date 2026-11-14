import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const { getUser, signInWithPassword, updateUser } = vi.hoisted(() => ({
  getUser: vi.fn(),
  signInWithPassword: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { getUser, signInWithPassword, updateUser },
  })),
}));

function createRequest(body: Record<string, string>): Request {
  return new Request('http://localhost/api/auth/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/auth/email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ data: { user: { email: 'member@medifis.local' } }, error: null });
    signInWithPassword.mockResolvedValue({ error: null });
    updateUser.mockResolvedValue({ error: null });
  });

  it('solicita cambio de correo después de verificar la contraseña actual', async () => {
    const response = await POST(createRequest({
      email: 'Nuevo.Correo@example.com',
      currentPassword: 'ClaveActual-2026',
    }));

    expect(response.status).toBe(200);
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'member@medifis.local',
      password: 'ClaveActual-2026',
    });
    expect(updateUser).toHaveBeenCalledWith(
      { email: 'nuevo.correo@example.com' },
      { emailRedirectTo: 'http://localhost/auth/confirm?type=email_change' },
    );
  });

  it('no solicita el cambio cuando la contraseña actual es incorrecta', async () => {
    signInWithPassword.mockResolvedValue({ error: new Error('Invalid login credentials') });

    const response = await POST(createRequest({
      email: 'nuevo@example.com',
      currentPassword: 'Incorrecta-2026',
    }));

    expect(response.status).toBe(400);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('requiere una sesión autenticada', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: new Error('No session') });

    const response = await POST(createRequest({
      email: 'nuevo@example.com',
      currentPassword: 'ClaveActual-2026',
    }));

    expect(response.status).toBe(401);
    expect(signInWithPassword).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
  });
});
