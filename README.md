# Tucankit Citas

Agenda simple para profesionales independientes (dentistas, barberos, terapeutas, talleres)
que envían recordatorios de citas por **WhatsApp sin pagar por mensaje**.

La app **no envía mensajes sola**: arma el mensaje y abre WhatsApp con el texto ya escrito
(enlace oficial `wa.me`). El profesional solo toca «enviar».

- Funciona sin internet y se puede instalar en el celular como una app.
- Los datos se guardan **solo en el teléfono** (IndexedDB). Nada sale del dispositivo.
- Sin frameworks, sin npm, sin compilación, sin servidor: HTML, CSS y JavaScript puro.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Estructura de la pantalla. |
| `styles.css` | Colores y diseño (los colores de marca están al principio). |
| `core.js` | Funciones reutilizables: teléfono, plantillas y fechas. No dependen de la pantalla ni de la base de datos (sirven para una futura extensión de Chrome). |
| `app.js` | Lógica de la app: pantalla, base de datos, copias, instalación. Todos los textos están en el objeto `TEXTOS`. |
| `sw.js` | Service worker: guarda la app para usarla sin internet. **Tiene un número de versión.** |
| `manifest.json` | Datos para instalar la app (nombre, colores, íconos). |
| `privacidad.html` | Política de privacidad. |
| `icons/` | Íconos de la app. |
| `tools/generar_iconos.py` | Programa que dibuja los íconos (no se publica como parte de la app, pero no molesta). |

## Publicarla gratis con GitHub Pages (sin terminal)

1. En GitHub, abra el repositorio → **Settings** (Configuración) → **Pages** (menú de la izquierda).
2. En **Build and deployment → Source**, elija **Deploy from a branch**.
3. En **Branch**, elija la rama `claude/clever-bohr-n7ztvm` y la carpeta **`/ (root)`**. Toque **Save**.
4. Espere 1 o 2 minutos y recargue esa página de Settings → Pages. Arriba aparecerá la dirección:
   **<https://amargorm.github.io/Tucankit-Citas/>**
5. Abra esa dirección en la computadora o en el celular. Ya tiene `https://`, así que funciona
   el modo sin internet y se puede instalar.

Cada vez que se suban cambios a esa rama, GitHub vuelve a publicar solo (tarda 1 o 2 minutos).

> El archivo vacío `.nojekyll` le indica a GitHub Pages que publique los archivos tal cual.
> No lo borre.

## Probarla en una computadora con terminal (opcional)

```
python3 -m http.server 8000
```

y abrir <http://localhost:8000>. No abra `index.html` con doble clic: el modo sin internet
y la instalación **solo funcionan en `localhost` o con `https://`**.

## Publicarla en Cloudflare Pages (más adelante)

1. En Cloudflare: **Workers & Pages → Create → Pages → Connect to Git** y elija el repositorio.
2. Framework preset: **None** · Build command: *(vacío)* · Build output directory: **`/`**
3. Guardar y publicar. Cloudflare le dará una dirección `https://...pages.dev`.

## ⚠️ Al publicar cambios: subir la versión

Cada vez que cambie cualquier archivo de la app, abra `sw.js` y suba el número:

```js
const VERSION = 1;   // cambiar a 2, luego 3, etc.
```

Si no lo sube, los teléfonos que ya tienen la app seguirán viendo la versión vieja.
Cuando lo sube, la app muestra el aviso «Hay una versión nueva. Toque para actualizar».

Si agrega un archivo nuevo a la app, agréguelo también a la lista `ARCHIVOS` de `sw.js`.

## Regenerar los íconos

```
python3 tools/generar_iconos.py
```

## Agregar otro idioma (por ejemplo portugués)

1. En `app.js`, copiar el bloque `es` del objeto `TEXTOS` como `pt` y traducirlo.
2. En `core.js`, copiar el bloque `es` del objeto `IDIOMAS` (días, meses, plantilla) como `pt` y traducirlo.
3. En `app.js`, cambiar `const IDIOMA = 'es';` por `'pt'`.

## Cómo se guardan los datos

En IndexedDB (base de datos `tucankit-citas`) hay dos «cajones»:

- `citas`: una ficha por cita con `id`, `nombre`, `telefono` (solo dígitos, con código de país),
  `fecha` (texto `AAAA-MM-DD`), `hora` (texto `HH:MM`), `servicio`, `nota`,
  `recordatorioEnviado`, `recordatorioFecha`, `creada`, `modificada`.
- `ajustes`: una sola ficha con `negocio`, `direccion`, `codigoPais`, `plantilla`,
  `ultimaCopia`, `primerUso`, `ayudaIphoneOculta`.

La copia de seguridad es un archivo `.json` con `{ app, version, creada, citas, ajustes }`.
