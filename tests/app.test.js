import { describe, it, expect } from 'vitest';
import { buildPromptPayload } from '../src/utils.js';

/* buildPromptPayload: historial local -> formato de Gemini */
describe('buildPromptPayload', () => {
  it('convierte los roles user y character al formato de Gemini (user y model)', () => {
    const history = [
      { role: 'user', text: 'Hola', timestamp: 1 },
      { role: 'character', text: '¡Hola, dattebayo!', timestamp: 2 },
    ];

    const payload = buildPromptPayload('Eres Naruto', history);

    expect(payload.system_instruction).toEqual({ parts: [{ text: 'Eres Naruto' }] });
    expect(payload.contents).toEqual([
      { role: 'user', parts: [{ text: 'Hola' }] },
      { role: 'model', parts: [{ text: '¡Hola, dattebayo!' }] },
    ]);
  });
});
