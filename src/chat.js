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

/* Respuesta chat*/
function getMockReply(userText) {
  return `Dijiste: "${userText}". ¡Dattebayo!`;
}

/* Conecta la vista /chat */
export function initChat() {
  chatContainer = document.getElementById('chat-messages');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');

  /* Mensaje inicial */
  renderMessage('character', WELCOME_MESSAGE);

  /* mensajes previos */
  conversationHistory.forEach((message) => renderMessage(message.role, message.text));

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = input.value;
    if (!validateInput(text)) return;

    const userMessage = formatMessage('user', text.trim());
    conversationHistory.push(userMessage);
    renderMessage(userMessage.role, userMessage.text);
    input.value = '';

    showTypingIndicator();

    setTimeout(() => {
      hideTypingIndicator();
      const reply = formatMessage('character', getMockReply(userMessage.text));
      conversationHistory.push(reply);
      renderMessage(reply.role, reply.text);
    }, 1000);
  });

  input.focus();
}
