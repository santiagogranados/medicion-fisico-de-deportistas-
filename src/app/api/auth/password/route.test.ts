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
  return new Request('http://localhost/api/auth/password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/auth/password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ data: { user: { email: 'member@medifis.local' } }, error: null });
    signInWithPassword.mockResolvedValue({ error: null });
    updateUser.mockResolvedValue({ error: null });
  });

  it('permite cambiar la contraseña repetidas veces para la sesión autenticada', async () => {
    const passwords = ['PrimeraClave-2026', 'SegundaClave-2026'];

    for (const newPassword of passwords) {
      const response = await POST(createRequest({
        currentPassword: 'ClaveActual-2026',
        newPassword,
        confirmPassword: newPassword,
      }));
      expect(response.status).toBe(200);
    }

    expect(signInWithPassword).toHaveBeenCalledTimes(2);
    expect(updateUser).toHaveBeenNthCalledWith(1, { password: passwords[0] });
    expect(updateUser).toHaveBeenNthCalledWith(2, { password: passwords[1] });
  });

  it('no actualiza la contraseña si la actual es incorrecta', async () => {
    signInWithPassword.mockResolvedValue({ error: new Error('Invalid login credentials') });

    const response = await POST(createRequest({
      currentPassword: 'Incorrecta-2026',
      newPassword: 'NuevaClave-2026',
      confirmPassword: 'NuevaClave-2026',
    }));

    expect(response.status).toBe(400);
    expect(updateUser).not.toHaveBeenCalled();
  });
});