import { formatMessage, validateInput } from './utils.js';

/* Datos del personaje */
const CHARACTER_INITIAL = 'N';
const WELCOME_MESSAGE = 'Hola, soy Naruto Uzumaki, ¡de veras!';

/* Memoria de la conversación*/
let conversationHistory = [];

/* Contenedor de mensajes */
let chatContainer = null;

/* Scroll automático al último mensaje */
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* Crea el círculo con la inicial del personaje */
function createAvatar() {
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = CHARACTER_INITIAL;
  return avatar;
}

/* Inserta un mensaje en el DOM textContent (no innerHTML) */
function renderMessage(role, text) {
  const row = document.createElement('div');
  row.className = `message-row ${role}`;

  if (role === 'character') {
    row.append(createAvatar());
  }

  const bubble = document.createElement('div');
  bubble.className = `message ${role}`;
  bubble.textContent = text;
  row.append(bubble);

  chatContainer.append(row);
  scrollToBottom();
}

/* Indicador "escribiendo..." (tres puntos animados) */
function showTypingIndicator() {
  const row = document.createElement('div');
  row.className = 'message-row character';
  row.id = 'typing-indicator';
  row.append(createAvatar());

  const dots = document.createElement('div');
  dots.className = 'typing-indicator';
  dots.setAttribute('aria-label', 'Naruto está escribiendo');
  dots.innerHTML = '<span></span><span></span><span></span>';
  row.append(dots);

  chatContainer.append(row);
  scrollToBottom();
}

function hideTypingIndicator() {
  document.getElementById('typing-indicator')?.remove();
}

/* Mensaje de error visible dentro del chat */
function renderError(text) {
  const banner = document.createElement('div');
  banner.className = 'error-banner';
  banner.setAttribute('role', 'alert');
  banner.textContent = text;

  chatContainer.append(banner);
  scrollToBottom();
}

/* Pide la respuesta del personaje al backend */
async function fetchCharacterReply() {
  const res = await fetch('/api/functions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: conversationHistory }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || typeof data.reply !== 'string') {
    throw new Error(data.error || 'Respuesta inválida del servidor');
  }

  return data.reply;
}

/* Conecta la vista /chat */
export function initChat() {
  chatContainer = document.getElementById('chat-messages');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const sendButton = document.getElementById('chat-send');

  /* Mensaje inicial */
  renderMessage('character', WELCOME_MESSAGE);

  /* mensajes previos */
  conversationHistory.forEach((message) => renderMessage(message.role, message.text));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = input.value;
    if (!validateInput(text)) return;

    const userMessage = formatMessage('user', text.trim());
    conversationHistory.push(userMessage);
    renderMessage(userMessage.role, userMessage.text);
    input.value = '';

    /* Evita doble envío */
    showTypingIndicator();
    input.disabled = true;
    sendButton.disabled = true;

    try {
      const replyText = await fetchCharacterReply();
      const reply = formatMessage('character', replyText);
      hideTypingIndicator();
      conversationHistory.push(reply);
      renderMessage(reply.role, reply.text);
    } catch (error) {
      hideTypingIndicator();
      /* Se omite el mensaje sin respuesta para poder reintentar */
      if (conversationHistory.at(-1) === userMessage) {
        conversationHistory.pop();
      }
      renderError(
        error instanceof TypeError
          ? 'Hubo un error de conexión con el personaje. Por favor intenta de nuevo.'
          : error.message
      );
    } finally {
      hideTypingIndicator();
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    }
  });

  input.focus();
}
