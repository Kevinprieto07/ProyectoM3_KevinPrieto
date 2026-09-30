import { initChat } from './chat.js';
import { homeView } from './views/homeView.js';
import { chatView } from './views/chatView.js';
import { aboutView } from './views/aboutView.js';

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
