import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('/api/health', () => {
  it('responde con estado operativo', async () => {
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.status).toBe('ok');
    expect(body.data.timestamp).toBeDefined();
  });
});
