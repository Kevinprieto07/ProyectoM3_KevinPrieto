/* Vista /chat */
export function chatView() {
  return `
    <section class="chat">
      <div class="chat-header">
        <img class="avatar" src="/src/assets/NarutoLogo.webp" alt="Naruto Uzumaki">
        <div>
          <p class="chat-header-name">Naruto Uzumaki</p>
          <p class="chat-header-status">En línea</p>
        </div>
      </div>

      <div class="chat-messages" id="chat-messages"></div>

      <form class="chat-form" id="chat-form">
        <input
          type="text"
          class="chat-input"
          id="chat-input"
          placeholder="Escribe un mensaje..."
          autocomplete="off"
          aria-label="Mensaje"
        >
        <button type="submit" class="btn" id="chat-send">Enviar</button>
      </form>
    </section>
  `;
}
