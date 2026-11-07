import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const { enviarCorreo } = vi.hoisted(() => ({
  enviarCorreo: vi.fn(),
}));

vi.mock('@/lib/correo', () => ({ enviarCorreo }));

function crearSolicitud(cuerpo: unknown): Request {
  return new Request('http://localhost/api/correo/prueba', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });
}

describe('/api/correo/prueba', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
    enviarCorreo.mockResolvedValue({ ok: true, id: 'correo-prueba' });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('envía la prueba al correo validado', async () => {
    const response = await POST(crearSolicitud({ para: 'santiagogranados200709@gmail.com' }));

    expect(response.status).toBe(200);
    expect(enviarCorreo).toHaveBeenCalledWith({
      para: 'santiagogranados200709@gmail.com',
      asunto: 'Prueba de correo',
      html: '<p>Este es un correo de prueba de Medifis.</p>',
    });
  });

  it('rechaza direcciones inválidas', async () => {
    const response = await POST(crearSolicitud({ para: 'correo-invalido' }));

    expect(response.status).toBe(400);
    expect(enviarCorreo).not.toHaveBeenCalled();
  });

  it('devuelve el error del proveedor cuando falla el envío', async () => {
    enviarCorreo.mockResolvedValue({ ok: false, error: 'No se pudo enviar.' });

    const response = await POST(crearSolicitud({ para: 'santiagogranados200709@gmail.com' }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({ error: 'No se pudo enviar.' });
  });

  it('oculta la ruta en producción', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const response = await POST(crearSolicitud({ para: 'santiagogranados200709@gmail.com' }));

    expect(response.status).toBe(404);
    expect(enviarCorreo).not.toHaveBeenCalled();
  });
});
