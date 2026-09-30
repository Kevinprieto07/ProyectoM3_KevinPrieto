import { initChat } from './chat.js';

/*Página */
function homeView() {
  return `
    <section class="home">
      <div class="home-card">
        <img class="avatar avatar-lg" src="/src/assets/NarutoLogo.webp" alt="Naruto Uzumaki">
        <h1>¡Habla con Naruto Uzumaki, Dattebayo!</h1>
        <p>Ninja de la aldea de la hoja, Jinchūriki del zorro de las nueve colas, su sueño es ser Hokage.</p>
        <a href="/chat" class="btn" data-link>Chatear</a>
      </div>
    </section>
  `;
}

function chatView() {
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

function aboutView() {
  return `
    <section class="view">
      <h1>Acerca del proyecto</h1>

      <h2>Ficha técnica</h2>
      <ul>
        <li>SPA con HTML, CSS y JavaScript (ES Modules), sin frameworks.</li>
        <li>Navegación con History API (sin recargar la página).</li>
        <li>Diseño responsive Mobile-First.</li>
        <li>Backend serverless en Vercel Functions conectado a la API de Gemini.</li>
        <li>Pruebas unitarias con Vitest.</li>
      </ul>

      <h2>Créditos</h2>
      <p>Desarrollado por Kevin Prieto.</p>

      <h2>¿Por qué Naruto?</h2>
      <p>
        Naruto es mi serie favorita, es una historia que nos enseña a nunca rendirnos y 
        trabajar por nuestros sueños, por muy dificiles que parezcan y las expectativas sean bajas, 
        hay que seguir adelante y no rendirnos en el camino.
      </p>
    </section>
  `;
}

/* Mapa de rutas */
const routes = {
  '/home': homeView,
  '/chat': chatView,
  '/about': aboutView,
};

/* Renderizado */
function renderRoute() {
  let path = location.pathname;

  /* "/" o rutas no reconocidas -> /home */
  if (!routes[path]) {
    path = '/home';
    history.replaceState(null, null, path);
  }

  document.getElementById('app').innerHTML = routes[path]();
  updateActiveLink(path);

  /* La vista /chat necesita conectar su formulario */
  if (path === '/chat') {
    initChat();
  }
}

/* Marca en el menú el enlace de la página actual */
function updateActiveLink(path) {
  document.querySelectorAll('nav a[data-link]').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === path);
  });
}

/* Navegación */
function navigateTo(url) {
  history.pushState(null, null, url);
  renderRoute();
}

/* Listener para los enlaces del menú */
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-link]');
  if (link) {
    e.preventDefault();
    navigateTo(link.getAttribute('href'));
  }
});

/* Botones atrás / adelante del navegador */
window.addEventListener('popstate', renderRoute);

/* Primera carga */
renderRoute();
