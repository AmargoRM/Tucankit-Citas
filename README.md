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

## Probarla en su computadora

1. Abra una terminal en la carpeta del proyecto.
2. Ejecute:

   ```
   python3 -m http.server 8000
   ```

3. Abra en el navegador: <http://localhost:8000>
4. Para detenerlo, vuelva a la terminal y presione `Ctrl + C`.

> **Importante:** no abra `index.html` con doble clic (dirección `file://...`).
> El service worker (modo sin internet e instalación) **solo funciona en `localhost` o con `https://`**.
> Con doble clic la app puede verse, pero no funcionará sin internet ni se podrá instalar.

### Probar en el celular

El celular necesita `https://` para instalar la app. Lo más simple es publicarla
(ver abajo) y abrir la dirección de Cloudflare Pages en el celular.

## Publicarla en Cloudflare Pages

1. Suba este repositorio a GitHub (ya está).
2. En Cloudflare: **Workers & Pages → Create → Pages → Connect to Git** y elija el repositorio.
3. Configuración de compilación:
   - Framework preset: **None**
   - Build command: *(dejar vacío)*
   - Build output directory: **`/`** (la carpeta raíz)
4. Guardar y publicar. Cloudflare le dará una dirección `https://...pages.dev`.

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
