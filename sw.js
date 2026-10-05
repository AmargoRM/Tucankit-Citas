/* =========================================================
   Tucankit Citas — service worker (funcionamiento sin internet)

   Guarda una copia de los archivos de la app en el teléfono
   para que abra aunque no haya conexión.

   ⚠️ IMPORTANTE AL PUBLICAR CAMBIOS:
   Cada vez que se modifique CUALQUIER archivo de la app
   (index.html, styles.css, core.js, app.js, íconos, etc.),
   hay que subir el número de VERSION de aquí abajo (1 → 2 → 3...).
   Si no se sube, los teléfonos seguirán mostrando la versión vieja.
   ========================================================= */
const VERSION = 1;
const NOMBRE_CACHE = `tucankit-citas-v${VERSION}`;

/** Archivos que se guardan para usar sin internet. */
const ARCHIVOS = [
  './',
  'index.html',
  'styles.css',
  'core.js',
  'app.js',
  'manifest.json',
  'privacidad.html',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];

/**
 * Descarga un archivo y lo guarda en la caché.
 * Algunos servidores (como Cloudflare Pages) redirigen "index.html" a "/".
 * Una respuesta que vino de una redirección no se puede usar después
 * para abrir la página, así que se guarda una copia "limpia".
 */
async function guardarArchivo(cache, ruta) {
  const respuesta = await fetch(new Request(ruta, { cache: 'reload' }));
  if (!respuesta.ok) throw new Error(`No se pudo descargar ${ruta}`);
  const limpia = respuesta.redirected
    ? new Response(await respuesta.blob(), {
      status: respuesta.status,
      statusText: respuesta.statusText,
      headers: respuesta.headers
    })
    : respuesta;
  await cache.put(ruta, limpia);
}

/* Instalación: guardar todos los archivos de esta versión.
   La versión nueva queda "esperando" hasta que la persona toque
   el aviso "Hay una versión nueva" (no se activa sola). */
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(NOMBRE_CACHE).then((cache) => Promise.all(ARCHIVOS.map((ruta) => guardarArchivo(cache, ruta))))
  );
});

/* Activación: borrar las copias de versiones anteriores. */
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(
        nombres
          .filter((nombre) => nombre.startsWith('tucankit-citas-') && nombre !== NOMBRE_CACHE)
          .map((nombre) => caches.delete(nombre))
      ))
      .then(() => self.clients.claim())
  );
});

/* La página pide activar la versión nueva cuando la persona toca el aviso. */
self.addEventListener('message', (evento) => {
  if (evento.data && evento.data.tipo === 'ACTIVAR_VERSION_NUEVA') self.skipWaiting();
});

/* Cada vez que la app pide un archivo: primero se busca la copia guardada;
   si no está, se pide a internet. Sin internet, las páginas abren la app. */
self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;
  if (new URL(pedido.url).origin !== self.location.origin) return; // ej.: wa.me no se toca

  evento.respondWith(
    caches.match(pedido, { ignoreSearch: true }).then((guardada) => {
      if (guardada) return guardada;
      return fetch(pedido).catch(() => {
        if (pedido.mode === 'navigate') return caches.match('./');
        return Response.error();
      });
    })
  );
});
