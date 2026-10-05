# Guía: activar la sincronización con Google Drive

Esta guía se hace **una sola vez**, desde la computadora, con la cuenta de Google del negocio.
Al final vas a tener un «ID de cliente» que se copia en el archivo `config.js`.

> **¿Qué es el ID de cliente?** Es el «documento de identidad» de la app ante Google.
> Le dice a Google: «esta app se llama Tucankit Citas y vive en estas direcciones web».
> **No es una contraseña**: puede estar a la vista en el código sin riesgo.

Google cambia de vez en cuando los nombres de los menús. Si algo no coincide exactamente,
buscá el nombre más parecido. Entre paréntesis pongo cómo puede aparecer en inglés.

---

## Paso 1: crear el proyecto

1. Entrá a **https://console.cloud.google.com** con tu cuenta de Google.
2. Arriba a la izquierda, al lado del logo de Google Cloud, tocá el selector de proyecto
   y luego **«Proyecto nuevo»** (*New project*).
3. Nombre: `Tucankit Citas`. Tocá **«Crear»**.
4. Esperá unos segundos y asegurate de que arriba diga **Tucankit Citas** (que sea el proyecto elegido).

## Paso 2: activar la API de Google Drive

1. Menú ☰ → **«APIs y servicios»** → **«Biblioteca»** (*APIs & Services → Library*).
2. Buscá **Google Drive API** y entrá.
3. Tocá **«Habilitar»** (*Enable*).

## Paso 3: configurar la pantalla de consentimiento

Es la ventanita que ve la persona cuando toca «Conectar con Google Drive».

1. Menú ☰ → **«APIs y servicios»** → **«Pantalla de consentimiento de OAuth»**
   (en la versión nueva se llama **«Google Auth Platform»**). Tocá **«Comenzar»** (*Get started*).
2. **Información de la app** (*App information / Branding*):
   - Nombre de la app: `Tucankit Citas`
   - Correo de asistencia: tu correo.
3. **Público** (*Audience*): elegí **«Externo»** (*External*).
   (Interno solo sirve para empresas con Google Workspace.)
4. **Información de contacto**: tu correo. Aceptá las condiciones y tocá **«Crear»**.
5. En **«Desarrollo de la marca»** (*Branding*) completá, si te lo pide:
   - Página principal: `https://citas.tucankit.com`
   - Política de privacidad: `https://citas.tucankit.com/privacidad.html`
   - Dominios autorizados: `tucankit.com`
6. En **«Acceso a los datos»** (*Data Access*) → **«Agregar o quitar permisos»** (*Add or remove scopes*):
   - Buscá y marcá **solamente**: `.../auth/drive.file`
     (descripción: «Ver, editar, crear y borrar solo los archivos de Google Drive que usas con esta app»).
   - **No marques ningún otro permiso de Drive.** La app no los necesita y Google pide revisiones
     largas para los permisos amplios.
   - Tocá **«Actualizar»** y luego **«Guardar»**.

## Paso 4: crear el ID de cliente web

1. Menú ☰ → **«APIs y servicios»** → **«Credenciales»** (*Credentials*)
   (o en Google Auth Platform: **«Clientes»** / *Clients*).
2. **«Crear credenciales»** → **«ID de cliente de OAuth»** (*OAuth client ID*).
3. Tipo de aplicación: **«Aplicación web»** (*Web application*).
4. Nombre: `Tucankit Citas web`.
5. En **«Orígenes autorizados de JavaScript»** (*Authorized JavaScript origins*) agregá, uno por uno:

   | Origen | Para qué |
   |---|---|
   | `http://localhost:8000` | Pruebas en la computadora con `python3 -m http.server 8000` |
   | `https://tucankit-citas.pages.dev` | Dirección de Cloudflare Pages |
   | `https://citas.tucankit.com` | Dirección definitiva |
   | `https://amargorm.github.io` | **Solo para pruebas** (GitHub Pages). Borrarlo cuando ya no se use. |

   ⚠️ Escribilos **exactamente así**: sin barra al final y sin carpetas.
   Por ejemplo, aunque la app de prueba esté en `https://amargorm.github.io/Tucankit-Citas/`,
   el origen es solo `https://amargorm.github.io`.

6. **«URI de redireccionamiento autorizados»**: dejalo **vacío** (esta app no lo usa).
7. Tocá **«Crear»**. Aparece una ventana con el **ID de cliente**, que termina en
   `.apps.googleusercontent.com`. Copialo.
   (El «secreto del cliente», si aparece, **no se usa**: no lo copies en ningún lado.)

## Paso 5: poner el ID en la app

1. Abrí el archivo `config.js` del repositorio.
2. Reemplazá `TU-ID-DE-CLIENTE.apps.googleusercontent.com` por el ID que copiaste.
3. Subí en 1 el número `VERSION` de `sw.js` (regla 5 de CLAUDE.md) y publicá.

Los cambios en Google pueden tardar **de 5 minutos a unas horas** en funcionar.

---

## Modo de prueba y modo de producción

En **Google Auth Platform → Público** (*Audience*) aparece el «Estado de publicación».

### Modo de prueba (*Testing*) — así queda al crearlo
- **Solo las personas que agregues como «usuarios de prueba»** pueden conectar Drive
  (hasta 100 correos). Agregalas en **Público → Usuarios de prueba → «Agregar usuarios»**.
- Cualquier otra persona ve un error de «acceso bloqueado».
- Sirve para probar con vos y unos pocos clientes de confianza.

### Modo de producción (*In production*)
- **Cualquier persona con cuenta de Google** puede conectar Drive.
- Se activa con **Público → «Publicar app»** (*Publish app*).
- Como la app usa **solo** el permiso `drive.file`, que Google considera «no sensible»,
  normalmente **no hace falta** pasar por la revisión larga de Google.
  Si querés que en la ventanita aparezca el logo de Tucankit, Google pide verificar la marca
  (que el dominio `tucankit.com` es tuyo), en **Centro de verificación** (*Verification Center*).

**Recomendación:** quedate en modo de prueba mientras probás; pasá a producción
cuando la dirección definitiva `citas.tucankit.com` esté funcionando.

---

## Problemas comunes

| Mensaje | Causa probable | Solución |
|---|---|---|
| «Falta configurar el ID de cliente» (en la app) | `config.js` todavía tiene el valor de ejemplo | Paso 5 |
| `origin_mismatch` o «no autorizado» en la ventanita de Google | La dirección donde abrís la app no está en los orígenes autorizados | Paso 4.5 (revisá que esté exacto, sin barra final) |
| `access_denied` / «acceso bloqueado» | La app está en modo de prueba y tu correo no es usuario de prueba | Agregalo en Público → Usuarios de prueba |
| La ventanita no se abre | El navegador bloqueó la ventana emergente | Permití ventanas emergentes para la app y tocá de nuevo |
| «El permiso de Google venció» | Es normal: el permiso dura una hora | Tocá «Volver a conectar». Los datos no se pierden |
