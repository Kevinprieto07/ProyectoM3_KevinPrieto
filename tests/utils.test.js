import { describe, it, expect, vi, afterEach } from 'vitest';
import { validateInput, formatMessage, parseGeminiResponse } from '../src/utils.js';

/* Test 1: validateInput */
describe('validateInput', () => {
  it('rechaza strings vacíos o compuestos solo por espacios en blanco', () => {
    expect(validateInput('')).toBe(false);
    expect(validateInput('   ')).toBe(false);
    expect(validateInput('\n\t  ')).toBe(false);
  });

  it('acepta texto con contenido', () => {
    expect(validateInput('Hola Naruto')).toBe(true);
  });
});

/* Test 2: formatMessage */
describe('formatMessage', () => {
  it('devuelve la estructura correcta con role, text y timestamp', () => {
    const message = formatMessage('user', 'Hola');

    expect(message).toHaveProperty('role', 'user');
    expect(message).toHaveProperty('text', 'Hola');
    expect(message).toHaveProperty('timestamp');
    expect(typeof message.timestamp).toBe('number');
  });

  /* Mock: Date.now*/
  it('usa Date.now() como timestamp', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);

    const message = formatMessage('character', '¡Dattebayo!');

    expect(Date.now).toHaveBeenCalled();
    expect(message.timestamp).toBe(1700000000000);
  });

  afterEach(() => {
    vi.restoreAllMocks(); /* devuelve Date.now a su versión real */
  });
});

/* Tests 3 y 4: parseGeminiResponse */
describe('parseGeminiResponse', () => {
  it('extrae el texto de una respuesta estándar exitosa', () => {
    const apiData = {
      candidates: [
        {
          content: {
            role: 'model',
            parts: [{ text: '¡Dattebayo!' }],
          },
        },
      ],
    };

    expect(parseGeminiResponse(apiData)).toBe('¡Dattebayo!');
  });

  it('lanza un error controlado ante estructuras anómalas o payloads vacíos', () => {
    const invalidPayloads = [
      undefined,
      null,
      {},
      { candidates: [] },
      { candidates: [{ content: { parts: [] } }] },
      { candidates: [{ content: { parts: [{ text: '   ' }] } }] },
    ];

    invalidPayloads.forEach((payload) => {
      expect(() => parseGeminiResponse(payload)).toThrow(
        'Respuesta de Gemini vacía o con formato inesperado'
      );
    });
  });
});
