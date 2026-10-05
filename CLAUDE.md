# Reglas permanentes del proyecto Tucankit Citas

Estas reglas valen para cualquier persona o asistente que modifique este repositorio.

1. **Tecnología:** solo HTML, CSS y JavaScript puro; sin frameworks, sin npm, sin compilación,
   sin servidor propio.
2. **Datos:** los datos de los usuarios viven en su dispositivo (y, si lo activan, en su propio
   Google Drive). Nunca en un servidor nuestro.
3. **Red:** cero conexiones de red, con una única excepción: los servicios de Google para Drive
   (`accounts.google.com`, `apis.google.com`, `googleapis.com`), **solo cuando el usuario activa
   la sincronización**. El service worker no guarda en caché ni intercepta esas llamadas.
   Cualquier otra conexión requiere permiso explícito del dueño del proyecto.
4. **WhatsApp:** nunca enviar mensajes automáticamente ni en lote; siempre un toque del usuario
   por mensaje.
5. **Versión:** cada cambio en archivos de la app sube en 1 el número `VERSION` de `sw.js` en el
   mismo commit, y todo archivo nuevo que use la app se agrega a la lista `ARCHIVOS` de `sw.js`.
6. **Ramas:** trabajar siempre en una rama aparte. La versión publicada (rama
   `claude/clever-bohr-n7ztvm`, servida por GitHub Pages) solo se actualiza cuando todo esté
   terminado y probado, nunca con cambios a medias que alteren lo que ven los usuarios.
7. **Cambios en cómo se guardan los datos:** deben migrar lo existente sin perder nada, guardar
   una copia automática antes, y seguir aceptando copias de seguridad de versiones anteriores.
8. **Comunicación:** explicar todo en español simple, sin jerga, y antes de cambiar algo decir
   qué cambia, por qué y qué se puede romper.

## Notas técnicas útiles

- `core.js`: funciones puras (fechas, teléfonos, plantillas, montos, mezcla de datos). No tocan
  la pantalla ni IndexedDB; se pueden reutilizar en una extensión de Chrome.
- `excel.js`: crear y leer `.xlsx` y CSV (ZIP armado a mano, sin bibliotecas) y convertir filas en clientes.
- `app.js`: pantalla, IndexedDB, copias, Drive, bienvenida e instalación. Textos de pantalla en `TEXTOS`.
- Fechas: siempre texto `AAAA-MM-DD` y horas `HH:MM`; nunca `new Date("AAAA-MM-DD")` (UTC).
- Bibliotecas externas: si alguna vez hacen falta, se copian en `vendor/` con su licencia (solo MIT o Apache 2.0). Hoy no se usa ninguna.

## Decisiones tomadas por el dueño (aplicar cuando llegue el momento)

- **Cobro / licencias:** cuando se inicie el cobro, aplicar **solo la opción 2**: clave de licencia
  firmada (se verifica sin internet con una clave pública; solo el dueño puede generar claves) que
  incluye el **nombre del comprador**, y la app lo muestra en Ajustes («Licencia de …»).
  **No** usar activación en línea ni servidor (Cloudflare Worker), ni ofuscar el código, salvo que
  el dueño lo pida explícitamente más adelante.

## Pendientes (recordárselos al dueño cuando pregunte «qué falta»)

- [ ] **Bienvenida:** agregar un paso que explique cómo instalar la app en la computadora desde Chrome
      (botón «Instalar app» de la barra de direcciones). Esperar a que el dueño diga que se haga.
- [ ] **Google Drive:** que el dueño confirme que la conexión funciona con su cuenta de prueba.
- [ ] **Excel:** que el dueño confirme que la plantilla abre bien en Microsoft Excel real y que se importa.
- [ ] **Dominio:** comprar `tucankit.com`, publicar con Cloudflare Pages en `citas.tucankit.com`,
      avisar a los usuarios de prueba que muden sus datos y luego apagar GitHub Pages.
- [ ] **Antes de cobrar:** revisión de los términos de uso por un abogado de Costa Rica y decidir
      el modelo de cobro (pago único, suscripción o gratis con límite). Licencias: ver «Decisiones».
- [ ] **Extensión de Chrome:** solo si varios usuarios la piden; en ese caso, la opción de panel lateral
      (sin tocar la página de WhatsApp Web).
