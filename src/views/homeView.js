/* Vista /home */
export function homeView() {
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
