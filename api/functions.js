import { buildPromptPayload, parseGeminiResponse } from '../src/utils.js';

/* Modelos de Gemini en orden de preferencia (fallback si uno está saturado) */
const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/* Errores que justifican probar con el siguiente modelo */
const RETRYABLE_STATUS = [429, 503];

/* Tiempo máximo de espera por modelo (ms) */
const MODEL_TIMEOUT = 20000;

/* Largo máximo por mensaje (protege la cuota sin recortar el historial) */
const MAX_TEXT_LENGTH = 1000;

/* Personalidad del personaje (vive solo en el servidor) */
const SYSTEM_PROMPT = `Eres Naruto Uzumaki durante la época de Naruto Shippuden: un ninja de la Aldea Oculta de la Hoja, 
jinchūriki del Zorro de las Nueve Colas (Kurama), que sueña con convertirse en Hokage. Eres enérgico, optimista, impulsivo y nunca te rindes.
Hablas en primera persona, como si estuvieras chateando, en español y con un tono cercano y entusiasta. Usa de forma natural tus muletillas "¡de veras!" y "¡dattebayo!",
sin repetirlas en cada frase. Responde siempre de forma breve: máximo 2 a 3 oraciones.
Solo conoces el mundo de Naruto: si te preguntan por algo que no existe en tu mundo (tecnología moderna, internet, otros países o personajes reales), reacciona confundido,
como lo haría Naruto, sin salirte del personaje. Nunca digas que eres una inteligencia artificial ni rompas el personaje.`;

/* true si messages es una lista válida */
function isValidMessages(messages) {
  return (
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.every(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'character') &&
        typeof m.text === 'string' &&
        m.text.trim() !== ''
    )
  );
}

/* Recibe { messages } y devuelve { reply } */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta configurar GEMINI_API_KEY en el servidor' });
  }

  const { messages } = req.body ?? {};
  if (!isValidMessages(messages)) {
    return res.status(400).json({ error: 'Formato de mensajes inválido' });
  }

  /* Historial completo, con un largo máximo por mensaje */
  const history = messages.map((m) => ({
    role: m.role,
    text: m.text.slice(0, MAX_TEXT_LENGTH),
  }));

  const payload = JSON.stringify(buildPromptPayload(SYSTEM_PROMPT, history));

  try {
    let geminiRes = null;

    /* Prueba cada modelo hasta obtener una respuesta que no sea 429/503 */
    for (const model of GEMINI_MODELS) {
      try {
        geminiRes = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: payload,
          signal: AbortSignal.timeout(MODEL_TIMEOUT),
        });
      } catch (error) {
        /* Tiempo agotado: se trata como modelo saturado */
        if (error.name !== 'TimeoutError') throw error;
        console.error(`Modelo ${model}: tiempo de espera agotado`);
        geminiRes = { ok: false, status: 503, text: async () => 'timeout' };
        continue;
      }

      if (!RETRYABLE_STATUS.includes(geminiRes.status)) break;
      console.error(`Modelo ${model} no disponible (${geminiRes.status}), probando el siguiente`);
    }

    if (!geminiRes.ok) {
      console.error('Error de Gemini:', geminiRes.status, await geminiRes.text());

      if (geminiRes.status === 429) {
        return res.status(429).json({ error: 'Demasiadas peticiones, intenta en un momento' });
      }
      if (geminiRes.status === 503) {
        return res.status(503).json({ error: 'Naruto está ocupado entrenando, intenta en un momento' });
      }
      return res.status(502).json({ error: 'El servicio de Gemini respondió con un error' });
    }

    const apiData = await geminiRes.json();
    const responseText = parseGeminiResponse(apiData);

    return res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error('Error en /api/functions:', error);
    return res.status(502).json({ error: 'No se pudo obtener respuesta de Gemini' });
  }
}
