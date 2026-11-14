import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const { resetPasswordForEmail } = vi.hoisted(() => ({
  resetPasswordForEmail: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { resetPasswordForEmail },
  })),
}));

function createRequest(body: unknown): Request {
  return new Request('https://medifis.vercel.app/api/auth/recovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/auth/recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetPasswordForEmail.mockResolvedValue({ error: null });
  });

  it('solicita recuperación en Supabase con el retorno de producción', async () => {
    const response = await POST(createRequest({ email: 'Santiago@example.com' }));

    expect(response.status).toBe(200);
    expect(resetPasswordForEmail).toHaveBeenCalledWith('santiago@example.com', {
      redirectTo: 'https://medifis.vercel.app/auth/confirm',
    });
  });

  it('rechaza una dirección no válida', async () => {
    const response = await POST(createRequest({ email: 'no-es-correo' }));

    expect(response.status).toBe(400);
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('informa si Supabase rechaza la solicitud', async () => {
    resetPasswordForEmail.mockResolvedValue({ error: new Error('Auth service unavailable') });

    const response = await POST(createRequest({ email: 'santiago@example.com' }));

    expect(response.status).toBe(502);
  });

  it('informa claramente cuando Supabase limita temporalmente los correos', async () => {
    resetPasswordForEmail.mockResolvedValue({ error: { status: 429 } });

    const response = await POST(createRequest({ email: 'santiago@example.com' }));
    const result = await response.json();

    expect(response.status).toBe(429);
    expect(result.error).toContain('varios enlaces recientemente');
  });
});
