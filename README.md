# Tucankit Citas

Agenda simple para profesionales independientes y pequeños negocios (dentistas, barberos,
terapeutas, talleres, tiendas, personal shoppers) que envían recordatorios por
**WhatsApp sin pagar por mensaje**.

La app **no envía mensajes sola**: arma el mensaje y abre WhatsApp con el texto ya escrito
(enlace oficial). La persona solo toca «enviar», un mensaje por toque.

- **Clientes** con nota, etiquetas (VIP, Debe…) e historial.
- **Tipos de recordatorio:** cita, entrega, cobro (monto y forma de pago), seguimiento y «ya llegó».
- **Mensajes** por tipo, armables con clics (saludo, tú/usted, confirmar, dirección, despedida),
  firma opcional y enlaces para que el cliente responda con un toque.
- **Estados de respuesta:** confirmó, canceló, pagó, respondió.
- **Grupos:** mensaje a todos los clientes de una etiqueta, en fila (un toque por mensaje).
- **Varios dispositivos sin servidor:** por código QR (sin internet) o con el **Google Drive del propio usuario**.
- Funciona sin internet y se instala en el celular como una app.
- Sin frameworks, sin npm, sin compilación, sin servidor: HTML, CSS y JavaScript puro.

Reglas del proyecto: ver [`CLAUDE.md`](CLAUDE.md).

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Estructura de las pantallas. |
| `styles.css` | Colores y diseño (los colores de marca están al principio). |
| `config.js` | ID de cliente de Google para la sincronización (valor de ejemplo hasta configurarlo). |
| `core.js` | Funciones reutilizables, sin pantalla ni base de datos: teléfonos, fechas, plantillas, montos, **mezcla segura** y empaquetado para QR. |
| `app.js` | Pantallas, base de datos del dispositivo, copias, QR, Drive e instalación. Textos en el objeto `TEXTOS`. |
| `sw.js` | Service worker: guarda la app para usarla sin internet. **Tiene un número de versión.** |
| `manifest.json` | Datos para instalar la app. |
| `privacidad.html` | Política de privacidad. |
| `icons/` | Íconos (se regeneran con `python3 tools/generar_iconos.py`). |
| `vendor/` | Bibliotecas para QR copiadas en el repositorio, con su licencia (ver `vendor/README.md`). |
| `docs/google-drive.md` | Guía paso a paso para activar Google Drive. |
| `pruebas/core.test.js` | Pruebas automáticas de `core.js` (`node pruebas/core.test.js`). No forman parte de la app. |
| `CLAUDE.md` | Reglas permanentes del proyecto. |

## Ramas

- **`claude/clever-bohr-n7ztvm`**: versión **publicada** (la que sirve GitHub Pages). Solo se actualiza
  cuando todo está terminado y probado.
- Las versiones nuevas se construyen en otra rama (por ejemplo `claude/v3-sincronizacion`) y se pasan
  a la publicada al final.

## Publicarla gratis con GitHub Pages (sin terminal)

1. En GitHub: repositorio → **Settings** → **Pages**.
2. **Source:** *Deploy from a branch*. **Branch:** `claude/clever-bohr-n7ztvm`, carpeta **`/ (root)`**. **Save**.
3. Esperar 1 o 2 minutos. La dirección es **<https://amargorm.github.io/Tucankit-Citas/>**.

> El archivo vacío `.nojekyll` le indica a GitHub Pages que publique los archivos tal cual. No lo borre.

## Publicarla en Cloudflare Pages

1. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git** → elegir el repositorio y la rama publicada.
2. Framework preset: **None** · Build command: *(vacío)* · Build output directory: **`/`**.
3. Dirección: `https://tucankit-citas.pages.dev`; luego se puede conectar `citas.tucankit.com`.

## Cambio de dirección web (importante)

El navegador guarda los datos **por dirección web**. Para el navegador, `amargorm.github.io` y
`citas.tucankit.com` son dos lugares distintos: los datos de uno **no aparecen** en el otro.

Cuando la app pase de la dirección de prueba (`amargorm.github.io`) a la definitiva (`citas.tucankit.com`),
cada persona tiene que **mudar sus datos** de una de estas formas:

1. **Copia de seguridad:** en la dirección vieja, Ajustes → «Descargar copia». En la nueva,
   Ajustes → «Restaurar copia» → «Mezclar».
2. **Google Drive:** conectar Drive en la dirección vieja (se suben los datos) y luego en la nueva
   (se bajan solos). Las dos direcciones deben estar autorizadas en Google (ver la guía).
3. **Código QR:** abrir la dirección vieja en un dispositivo y la nueva en otro, y pasar los datos por QR.

Cuando la app detecta que funciona en `github.io`, muestra un aviso que lo explica.

## Probarla en una computadora con terminal (opcional)

```
python3 -m http.server 8000
```

y abrir <http://localhost:8000>. No abra `index.html` con doble clic: el modo sin internet,
la instalación, la cámara y Google Drive **solo funcionan en `localhost` o con `https://`**.

## Sincronización y mezcla segura

- Cada registro (cliente, recordatorio, etiqueta) guarda cuándo se cambió (`actualizadoEn`),
  en qué dispositivo (`dispositivoId`) y si se borró (`borradoEn`). Borrar **marca**, no elimina,
  para que el otro dispositivo se entere. Las marcas de más de 90 días se limpian solas.
- Al mezclar, registro por registro **gana el cambio más reciente**; los ajustes, campo por campo.
  Nunca se reemplaza la base completa.
- Antes de cada mezcla que cambie algo se guarda una **copia automática** (las últimas 5).
  En Ajustes → «Copias automáticas» se puede volver a una. Volver a una copia **se aplica en todos
  los dispositivos** que sincronizan.
- «Gana el más reciente» depende del reloj de cada dispositivo: si uno tiene la hora mal puesta,
  sus cambios pueden ganar sin ser los más nuevos.
- Google Drive: activar con la guía [`docs/google-drive.md`](docs/google-drive.md). El permiso de Google
  dura una hora; al vencer, la app pide «Volver a conectar» (un toque) sin perder nada.

## ⚠️ Al publicar cambios: subir la versión

Cada cambio en archivos de la app sube en 1 el número de `sw.js`:

```js
const VERSION = 9;   // cambiar a 10, luego 11, etc.
```

Si no se sube, los teléfonos que ya tienen la app siguen viendo la versión vieja.
Si se agrega un archivo nuevo a la app, también va en la lista `ARCHIVOS` de `sw.js`.

## Copias de seguridad

- Formato 1 (versión 1 de la app): `{ app, version: 1, citas, ajustes }`.
- Formato 2 (actual): `{ app, version: 2, creada, dispositivo, datos: { clientes, recordatorios, etiquetas, ajustes } }`.
- Se aceptan ambos. Al restaurar se puede «Mezclar» (recupera lo borrado sin perder lo nuevo)
  o «Reemplazar todo».

## Agregar otro idioma (por ejemplo portugués)

1. `app.js`: copiar el bloque `es` del objeto `TEXTOS` como `pt` y traducirlo.
2. `core.js`: copiar el bloque `es` de `IDIOMAS` (días, meses, piezas de mensajes, respuestas) como `pt`.
3. `app.js`: cambiar `const IDIOMA = 'es';` por `'pt'`.
