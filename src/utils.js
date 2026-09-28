/* Crea un mensaje con formato estándar */
export function formatMessage(role, text) {
  return {
    role,
    text,
    timestamp: Date.now(),
  };
}

/* true si el texto tiene contenido real (no vacío ni solo espacios) */
export function validateInput(text) {
  return typeof text === 'string' && text.trim().length > 0;
}

/* Extrae el texto de la respuesta de Gemini y maneja errores */
export function parseGeminiResponse(apiData) {
  const text = apiData?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Respuesta de Gemini vacía o con formato inesperado');
  }

  return text.trim();
}

/* Convierte el historial local al formato de la API de Gemini. */
export function buildPromptPayload(systemPrompt, history) {
  return {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: history.map((message) => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.text }],
    })),
  };
}
