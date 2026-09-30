/* Vista /about */
export function aboutView() {
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
