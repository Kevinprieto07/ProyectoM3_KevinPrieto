import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from '../api/functions.js';

/* Petición falsa */
function createReq(body, method = 'POST') {
  return { method, body };
}

/* Respuesta falsa de Vercel */
function createRes() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    setHeader: vi.fn(),
  };
  res.status.mockReturnValue(res); /* permite res.status(200) */
  return res;
}

/* Respuesta falsa de Gemini con su estructura real */
function geminiResponse(status, text = '') {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
    text: async () => `error ${status}`,
  };
}

const validBody = { messages: [{ role: 'user', text: 'Hola Naruto' }] };

describe('api/functions (con fetch simulado)', () => {
  let fetchMock;

  beforeEach(() => {
    /* Mock de fetch: ningún test sale a internet */
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    /* Clave falsa: nunca se usa la real */
    vi.stubEnv('GEMINI_API_KEY', 'clave-de-prueba');

    /* Silencia los console.error del backend */
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('devuelve la respuesta del personaje cuando Gemini responde bien', async () => {
    fetchMock.mockResolvedValueOnce(geminiResponse(200, '¡Dattebayo!'));
    const res = createRes();

    await handler(createReq(validBody), res);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers['x-goog-api-key']).toBe('clave-de-prueba');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ reply: '¡Dattebayo!' });
  });

  it('usa el siguiente modelo si el primero está saturado (fallback)', async () => {
    fetchMock
      .mockResolvedValueOnce(geminiResponse(503))
      .mockResolvedValueOnce(geminiResponse(200, '¡De veras!'));
    const res = createRes();

    await handler(createReq(validBody), res);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstUrl = fetchMock.mock.calls[0][0];
    const secondUrl = fetchMock.mock.calls[1][0];
    expect(firstUrl).not.toBe(secondUrl);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ reply: '¡De veras!' });
  });

  it('responde 503 si todos los modelos están saturados', async () => {
    fetchMock.mockResolvedValue(geminiResponse(503));
    const res = createRes();

    await handler(createReq(validBody), res);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Naruto está ocupado entrenando, intenta en un momento',
    });
  });

  it('rechaza métodos distintos de POST sin llamar a Gemini', async () => {
    const res = createRes();

    await handler(createReq(undefined, 'GET'), res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rechaza mensajes con formato inválido sin llamar a Gemini', async () => {
    const res = createRes();

    await handler(createReq({ messages: 'x' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
